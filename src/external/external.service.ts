import { Injectable, Logger } from '@nestjs/common';

type RoutePoint = { lat: number; lng: number };

export type WeatherResult = {
  location: { lat: number; lng: number };
  temperature: number | null;
  condition: string;
  windSpeed: number | null;
  source: string;
};

export type RoutePreviewResult = {
  origin: RoutePoint;
  destination: RoutePoint;
  distanceKm: number;
  durationMinutes: number;
  provider: string;
};

class TtlCache<T> {
  private readonly store = new Map<string, { value: T; expiresAt: number }>();

  constructor(private readonly ttlMs: number) {}

  get(key: string): T | undefined {
    const row = this.store.get(key);
    if (!row) {
      return undefined;
    }
    if (Date.now() > row.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return row.value;
  }

  set(key: string, value: T) {
    this.store.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }
}

/** In-process limiter for outbound calls to public APIs (per process). */
class SlidingWindowLimiter {
  private readonly hits: number[] = [];

  constructor(private readonly maxPerMinute: number) {}

  canProceed(): boolean {
    const now = Date.now();
    const cutoff = now - 60_000;
    while (this.hits.length && this.hits[0]! < cutoff) {
      this.hits.shift();
    }
    if (this.hits.length >= this.maxPerMinute) {
      return false;
    }
    this.hits.push(now);
    return true;
  }
}

function envInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw === '') {
    return fallback;
  }
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function roundCoord(n: number, decimals: number) {
  const f = 10 ** decimals;
  return Math.round(n * f) / f;
}

function cacheKeyWeather(lat: number, lng: number) {
  return `${roundCoord(lat, 3)}:${roundCoord(lng, 3)}`;
}

function cacheKeyRoute(a: RoutePoint, b: RoutePoint) {
  return `${roundCoord(a.lat, 4)},${roundCoord(a.lng, 4)}|${roundCoord(b.lat, 4)},${roundCoord(b.lng, 4)}`;
}

async function fetchJson<T>(
  url: string,
  timeoutMs: number,
  logger: Logger,
  label: string,
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      throw new Error(`${label} HTTP ${res.status}`);
    }
    return (await res.json()) as T;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.warn(`${label} request failed: ${msg}`);
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

function wmoWeatherCodeToCondition(code: number): string {
  if (code === 0) {
    return 'Clear';
  }
  if (code <= 3) {
    return 'Mainly clear';
  }
  if (code <= 48) {
    return 'Foggy or cloudy';
  }
  if (code <= 67 || (code >= 80 && code <= 82)) {
    return 'Rain';
  }
  if (code >= 95) {
    return 'Storm';
  }
  return 'Other';
}

@Injectable()
export class ExternalService {
  private readonly logger = new Logger(ExternalService.name);
  private readonly weatherCache: TtlCache<WeatherResult>;
  private readonly routeCache: TtlCache<RoutePreviewResult>;
  private readonly outboundLimiter: SlidingWindowLimiter;
  private readonly timeoutMs: number;

  constructor() {
    this.timeoutMs = envInt('EXTERNAL_HTTP_TIMEOUT_MS', 10_000);
    const weatherTtl = envInt('WEATHER_CACHE_TTL_SEC', 600) * 1000;
    const routeTtl = envInt('ROUTE_CACHE_TTL_SEC', 300) * 1000;
    this.weatherCache = new TtlCache<WeatherResult>(weatherTtl);
    this.routeCache = new TtlCache<RoutePreviewResult>(routeTtl);
    this.outboundLimiter = new SlidingWindowLimiter(
      envInt('EXTERNAL_OUTBOUND_RPM', 60),
    );
  }

  async getWeather(lat: number, lng: number): Promise<WeatherResult> {
    const key = cacheKeyWeather(lat, lng);
    const cached = this.weatherCache.get(key);
    if (cached) {
      return { ...cached, location: { lat, lng } };
    }

    if (!this.outboundLimiter.canProceed()) {
      this.logger.warn('Outbound rate limit reached; using weather fallback');
      return this.fallbackWeather(lat, lng, 'rate-limited-fallback');
    }

    const apiKey = process.env.OPENWEATHER_API_KEY?.trim();
    try {
      if (apiKey) {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${encodeURIComponent(
          String(lat),
        )}&lon=${encodeURIComponent(String(lng))}&appid=${encodeURIComponent(
          apiKey,
        )}&units=metric`;
        type Ow = {
          main?: { temp?: number };
          weather?: Array<{ main?: string }>;
          wind?: { speed?: number };
        };
        const data = await fetchJson<Ow>(url, this.timeoutMs, this.logger, 'OpenWeatherMap');
        const out: WeatherResult = {
          location: { lat, lng },
          temperature: data.main?.temp ?? null,
          condition: data.weather?.[0]?.main ?? 'Unknown',
          windSpeed: data.wind?.speed ?? null,
          source: 'openweathermap',
        };
        this.weatherCache.set(key, out);
        return { ...out, location: { lat, lng } };
      }

      const omUrl =
        `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(
          String(lat),
        )}&longitude=${encodeURIComponent(
          String(lng),
        )}` + `&current=temperature_2m,weather_code,wind_speed_10m`;
      type Om = {
        current?: {
          temperature_2m?: number;
          weather_code?: number;
          wind_speed_10m?: number;
        };
      };
      const om = await fetchJson<Om>(omUrl, this.timeoutMs, this.logger, 'Open-Meteo');
      const code = om.current?.weather_code ?? 0;
      const out: WeatherResult = {
        location: { lat, lng },
        temperature: om.current?.temperature_2m ?? null,
        condition: wmoWeatherCodeToCondition(code),
        windSpeed: om.current?.wind_speed_10m ?? null,
        source: 'open-meteo',
      };
      this.weatherCache.set(key, out);
      return { ...out, location: { lat, lng } };
    } catch {
      return this.fallbackWeather(lat, lng, 'error-fallback');
    }
  }

  private fallbackWeather(lat: number, lng: number, source: string): WeatherResult {
    return {
      location: { lat, lng },
      temperature: 22,
      condition: 'Clear',
      windSpeed: 10,
      source,
    };
  }

  async getRoutePreview(
    origin: RoutePoint,
    destination: RoutePoint,
  ): Promise<RoutePreviewResult> {
    const key = cacheKeyRoute(origin, destination);
    const cached = this.routeCache.get(key);
    if (cached) {
      return {
        ...cached,
        origin: { ...origin },
        destination: { ...destination },
      };
    }

    if (!this.outboundLimiter.canProceed()) {
      this.logger.warn('Outbound rate limit reached; using routing fallback');
      return this.fallbackRoute(origin, destination, 'rate-limited-fallback');
    }

    const base = (
      process.env.OSRM_BASE_URL?.trim() || 'https://router.project-osrm.org'
    ).replace(/\/$/, '');
    const path = `/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
    const url = `${base}${path}?overview=false&alternatives=false`;

    try {
      type Osrm = {
        routes?: Array<{ distance?: number; duration?: number }>;
        code?: string;
      };
      const data = await fetchJson<Osrm>(url, this.timeoutMs, this.logger, 'OSRM');
      const route = data.routes?.[0];
      if (!route || data.code === 'NoRoute') {
        throw new Error('No OSRM route');
      }
      const distanceKm = (route.distance ?? 0) / 1000;
      const durationMinutes = Math.max(1, Math.round((route.duration ?? 0) / 60));
      const out: RoutePreviewResult = {
        origin: { ...origin },
        destination: { ...destination },
        distanceKm: Number(distanceKm.toFixed(2)),
        durationMinutes,
        provider: 'osrm',
      };
      this.routeCache.set(key, out);
      return out;
    } catch {
      return this.fallbackRoute(origin, destination, 'haversine-fallback');
    }
  }

  private calculateDistanceKm(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ) {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const earthRadiusKm = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c;
  }

  private fallbackRoute(
    origin: RoutePoint,
    destination: RoutePoint,
    provider: string,
  ): RoutePreviewResult {
    const distanceKm = this.calculateDistanceKm(
      origin.lat,
      origin.lng,
      destination.lat,
      destination.lng,
    );
    const durationMinutes = Math.max(1, Math.round((distanceKm / 50) * 60));
    return {
      origin: { ...origin },
      destination: { ...destination },
      distanceKm: Number(distanceKm.toFixed(2)),
      durationMinutes,
      provider,
    };
  }
}
