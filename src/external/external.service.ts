import { Injectable } from '@nestjs/common';

@Injectable()
export class ExternalService {
  getWeather(lat: number, lng: number) {
    return {
      location: { lat, lng },
      temperature: 22,
      condition: Math.random() > 0.7 ? 'Rain' : 'Clear',
      windSpeed: 10,
      source: 'mock-weather',
    };
  }

  getRoutePreview(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
  ) {
    const distanceKm = this.calculateDistanceKm(
      origin.lat,
      origin.lng,
      destination.lat,
      destination.lng,
    );

    const durationMinutes = Math.round((distanceKm / 50) * 60);

    return {
      origin,
      destination,
      distanceKm: Number(distanceKm.toFixed(2)),
      durationMinutes,
      provider: 'mock-routing',
    };
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
}