import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getGuiHtml(): string {
    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Wasel Operational GUI</title>
  <style>
    :root {
      --bg: #0b0d0f;
      --card: rgba(23, 32, 28, 0.72);
      --card-border: rgba(129, 173, 114, 0.28);
      --text: #ecf4e9;
      --muted: #b7c9b1;
      --accent: #7fb069;
      --accent-2: #cf3d2e;
      --ok: #63d471;
      --warn: #ffd166;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Inter, Segoe UI, Roboto, sans-serif;
      color: var(--text);
      background:
        radial-gradient(circle at 15% 20%, rgba(127, 176, 105, 0.17), transparent 38%),
        radial-gradient(circle at 80% 10%, rgba(207, 61, 46, 0.16), transparent 42%),
        radial-gradient(circle at 90% 90%, rgba(255, 209, 102, 0.1), transparent 30%),
        var(--bg);
      min-height: 100vh;
      padding: 2rem;
    }
    .shell {
      max-width: 1180px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;
    }
    .hero {
      border: 1px solid var(--card-border);
      background: linear-gradient(140deg, rgba(31, 46, 35, 0.75), rgba(18, 22, 20, 0.72));
      border-radius: 20px;
      padding: 1.4rem;
      backdrop-filter: blur(8px);
    }
    .title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }
    h1 {
      margin: 0;
      font-size: 1.5rem;
      letter-spacing: 0.02em;
    }
    .subtitle {
      margin: 0.35rem 0 0;
      color: var(--muted);
      font-size: 0.95rem;
    }
    .badge {
      padding: 0.5rem 0.9rem;
      border-radius: 999px;
      font-size: 0.85rem;
      border: 1px solid var(--card-border);
      background: rgba(7, 14, 26, 0.8);
      color: var(--muted);
    }
    .badge.ok { color: var(--ok); border-color: rgba(69, 224, 138, 0.45); }
    .row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
      gap: 0.75rem;
    }
    .card {
      border: 1px solid var(--card-border);
      background: var(--card);
      border-radius: 16px;
      padding: 1rem;
      backdrop-filter: blur(6px);
      box-shadow: 0 0 0 1px rgba(255,255,255,0.02) inset;
    }
    .card h3 {
      margin: 0 0 0.4rem;
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.09em;
      color: var(--muted);
      font-weight: 600;
    }
    .value {
      font-size: 1.8rem;
      font-weight: 700;
      line-height: 1;
    }
    .muted { color: var(--muted); font-size: 0.9rem; margin-top: 0.4rem; }
    .module-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 0.75rem;
    }
    .pill {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      margin-top: 0.5rem;
      font-size: 0.8rem;
      color: var(--muted);
      border: 1px solid rgba(157,182,212,0.3);
      border-radius: 999px;
      padding: 0.3rem 0.6rem;
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.6rem;
      margin-top: 0.5rem;
    }
    a.action {
      text-decoration: none;
      color: var(--text);
      padding: 0.55rem 0.85rem;
      border-radius: 10px;
      font-size: 0.85rem;
      border: 1px solid var(--card-border);
      background: rgba(8, 16, 31, 0.8);
    }
    a.action.primary {
      border-color: rgba(127, 176, 105, 0.55);
      box-shadow: 0 0 18px rgba(127, 176, 105, 0.2) inset;
    }
    .layout {
      display: grid;
      grid-template-columns: 320px 1fr;
      gap: 0.8rem;
    }
    @media (max-width: 980px) {
      .layout { grid-template-columns: 1fr; }
    }
    .stack { display: grid; gap: 0.8rem; }
    .tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 0.45rem;
      margin-bottom: 0.9rem;
    }
    .tab {
      border: 1px solid var(--card-border);
      background: rgba(9, 17, 33, 0.85);
      color: var(--muted);
      border-radius: 9px;
      padding: 0.4rem 0.65rem;
      font-size: 0.82rem;
      cursor: pointer;
    }
    .tab.active {
      color: var(--text);
      border-color: rgba(127, 176, 105, 0.58);
      background: rgba(43, 66, 42, 0.7);
    }
    .view { display: none; }
    .view.active { display: block; }
    label { display: block; font-size: 0.82rem; color: var(--muted); margin-bottom: 0.22rem; }
    input, textarea, select {
      width: 100%;
      border: 1px solid rgba(142, 193, 255, 0.3);
      background: rgba(8, 14, 26, 0.9);
      color: var(--text);
      border-radius: 9px;
      padding: 0.56rem 0.62rem;
      margin-bottom: 0.58rem;
      font-size: 0.88rem;
    }
    textarea { min-height: 120px; resize: vertical; font-family: Consolas, monospace; }
    .btn {
      border: 1px solid var(--card-border);
      border-radius: 9px;
      background: rgba(8, 16, 31, 0.85);
      color: var(--text);
      font-size: 0.85rem;
      padding: 0.52rem 0.82rem;
      cursor: pointer;
      margin-right: 0.45rem;
      margin-top: 0.2rem;
    }
    .btn.primary {
      border-color: rgba(127, 176, 105, 0.6);
      box-shadow: 0 0 20px rgba(127, 176, 105, 0.2) inset;
    }
    .token-box {
      background: rgba(8, 12, 23, 0.92);
      border: 1px dashed rgba(142, 193, 255, 0.32);
      border-radius: 10px;
      padding: 0.7rem;
      overflow-wrap: anywhere;
      font-size: 0.8rem;
      color: #c9ddf8;
      margin-top: 0.5rem;
    }
    pre {
      background: rgba(2, 8, 18, 0.95);
      border: 1px solid rgba(142, 193, 255, 0.25);
      border-radius: 10px;
      padding: 0.85rem;
      color: #d7e7ff;
      font-size: 0.78rem;
      overflow: auto;
      max-height: 390px;
      margin-top: 0.65rem;
    }
    .endpoint-list {
      display: grid;
      gap: 0.5rem;
      max-height: 370px;
      overflow: auto;
    }
    .endpoint-item {
      border: 1px solid rgba(142,193,255,0.25);
      border-radius: 10px;
      padding: 0.55rem;
      font-size: 0.8rem;
      background: rgba(9, 17, 31, 0.8);
      cursor: pointer;
    }
    .endpoint-item b { color: var(--accent); }
    .hint {
      font-size: 0.78rem;
      color: var(--muted);
      margin-top: 0.25rem;
    }
    .hidden { display: none !important; }
    .flash {
      border: 1px solid rgba(142,193,255,0.3);
      background: rgba(7, 15, 29, 0.82);
      border-radius: 10px;
      padding: 0.62rem 0.7rem;
      margin-bottom: 0.7rem;
      font-size: 0.84rem;
      color: var(--muted);
      min-height: 40px;
    }
    .flash.ok {
      border-color: rgba(69,224,138,0.5);
      color: #9df3bf;
    }
    .flash.err {
      border-color: rgba(255,107,107,0.45);
      color: #ffb2b2;
    }
    .flash.warn {
      border-color: rgba(255,209,102,0.5);
      color: #ffe3a4;
    }
    .toast-wrap {
      position: fixed;
      top: 16px;
      right: 16px;
      z-index: 9999;
      display: grid;
      gap: 8px;
      max-width: 360px;
    }
    .toast {
      border: 1px solid rgba(142,193,255,0.35);
      background: rgba(7, 15, 29, 0.94);
      color: var(--text);
      border-radius: 10px;
      padding: 0.65rem 0.72rem;
      font-size: 0.83rem;
      box-shadow: 0 10px 24px rgba(0,0,0,0.35);
    }
    .toast.ok { border-color: rgba(69,224,138,0.55); }
    .toast.err { border-color: rgba(255,107,107,0.6); }
    .toast.warn { border-color: rgba(255,209,102,0.7); }
    .auth-gate {
      max-width: 520px;
      margin: 1.2rem auto 0;
    }
    .auth-title {
      margin: 0 0 0.35rem;
      font-size: 1.05rem;
    }
    .ops-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 0.7rem;
      margin-bottom: 0.75rem;
    }
    .status-chip {
      display: inline-block;
      border: 1px solid rgba(183, 201, 177, 0.4);
      border-radius: 999px;
      padding: 0.28rem 0.55rem;
      font-size: 0.78rem;
      margin-top: 0.45rem;
      color: var(--muted);
    }
    .status-chip.open { border-color: rgba(99,212,113,0.55); color: #9af5a4; }
    .status-chip.closed { border-color: rgba(207,61,46,0.6); color: #ffb2a9; }
    .status-chip.monitor { border-color: rgba(255,209,102,0.65); color: #ffe9b3; }
    .activity-feed {
      max-height: 180px;
      overflow: auto;
      border: 1px solid rgba(183, 201, 177, 0.25);
      border-radius: 10px;
      padding: 0.55rem;
      background: rgba(10, 15, 12, 0.55);
      margin-top: 0.55rem;
    }
    .activity-item {
      font-size: 0.8rem;
      color: var(--muted);
      padding: 0.28rem 0;
      border-bottom: 1px dashed rgba(183, 201, 177, 0.16);
    }
    .activity-item:last-child { border-bottom: none; }
    .theme-toggle {
      margin-left: 0.5rem;
    }
    body.light {
      --bg: #eef4ec;
      --card: rgba(255, 255, 255, 0.9);
      --card-border: rgba(88, 122, 77, 0.25);
      --text: #1b2a1e;
      --muted: #4f6655;
      --accent: #4d7e3b;
      --accent-2: #b23d32;
      --ok: #23863a;
      --warn: #b08800;
    }
    body.light .token-box,
    body.light pre,
    body.light input,
    body.light textarea,
    body.light select {
      background: rgba(244, 248, 241, 0.95);
      color: #1f2f24;
      border-color: rgba(88, 122, 77, 0.3);
    }
    .role-pill {
      display: inline-block;
      margin-left: 0.45rem;
      padding: 0.22rem 0.48rem;
      border-radius: 999px;
      border: 1px solid rgba(127, 176, 105, 0.6);
      color: #d5f4c8;
      font-size: 0.74rem;
    }
  </style>
</head>
<body>
  <div id="toastWrap" class="toast-wrap"></div>
  <main class="shell">
    <section class="hero">
      <div class="title">
        <div>
          <h1>Wasel Palestine - Operational GUI</h1>
          <p class="subtitle">Field-ready control center for checkpoint verification, user access, and operational monitoring.</p>
        </div>
        <div>
          <span id="rolePill" class="role-pill">Role: Guest</span>
          <button class="btn theme-toggle" id="themeToggleBtn">Toggle Theme</button>
          <span id="healthBadge" class="badge">Checking health...</span>
        </div>
      </div>
    </section>

    <section id="authGate" class="card auth-gate">
      <h3 class="auth-title">Start Session</h3>
      <div class="hint">Login with an existing account or register a new one, then continue to operational modules.</div>
      <label>Email</label>
      <input id="gateEmail" value="admin@wasel.local" />
      <label>Password</label>
      <input id="gatePassword" type="password" value="ChangeMeAdmin123!" />
      <button class="btn primary" id="gateLoginBtn">Login</button>
      <button class="btn" id="gateRegisterBtn">Register</button>
    </section>

    <div id="appWorkspace" class="hidden">
    <section class="row">
      <article class="card">
        <h3>Connected APIs</h3>
        <div class="value" id="endpointCount">--</div>
        <div class="muted">Live count from system specification</div>
      </article>
      <article class="card">
        <h3>API Modules</h3>
        <div class="value" id="moduleCount">--</div>
        <div class="muted">Grouped by OpenAPI tags</div>
      </article>
      <article class="card">
        <h3>Backend Status</h3>
        <div class="value" id="statusValue">--</div>
        <div class="muted">Live response from <code>/health</code></div>
      </article>
    </section>

    <section class="row">
      <article class="card">
        <h3>Nablus Readiness</h3>
        <div class="value" id="nablusReadiness">--</div>
        <div class="status-chip monitor" id="nablusFlag">Monitoring</div>
      </article>
      <article class="card">
        <h3>Ramallah Readiness</h3>
        <div class="value" id="ramallahReadiness">--</div>
        <div class="status-chip monitor" id="ramallahFlag">Monitoring</div>
      </article>
      <article class="card">
        <h3>Hebron Readiness</h3>
        <div class="value" id="hebronReadiness">--</div>
        <div class="status-chip monitor" id="hebronFlag">Monitoring</div>
      </article>
    </section>

    <section class="layout">
      <aside class="stack">
        <article class="card">
          <h3>Session</h3>
          <div id="sessionState" class="muted">Not authenticated</div>
          <div class="token-box" id="tokenPreview">No access token yet.</div>
          <button class="btn" id="clearTokensBtn">Clear Tokens</button>
        </article>

        <article class="card">
          <h3>Architecture Modules</h3>
          <div class="module-grid" id="modules"></div>
        </article>

        <article class="card">
          <h3>Command Links</h3>
          <div class="actions">
            <a class="action primary" href="/api-docs" target="_blank" rel="noreferrer">Open Swagger</a>
            <a class="action" href="/health" target="_blank" rel="noreferrer">Check Health</a>
          </div>
        </article>
      </aside>

      <section class="card">
        <div class="tabs" id="tabs">
          <button class="tab active" data-target="opsView">Operations Hub</button>
          <button class="tab" data-target="authView">Access</button>
          <button class="tab" data-target="meView">Profile</button>
          <button class="tab admin-only" data-target="usersView">Team Control</button>
          <button class="tab hidden" data-target="moduleOpsView">Module Ops</button>
          <button class="tab hidden" data-target="explorerView">API Explorer</button>
          <button class="tab" data-target="responseView">Live Output</button>
        </div>
        <div id="flashBox" class="flash">Ready. Choose an action from any tab.</div>

        <div id="opsView" class="view active">
          <h3>Checkpoint Verification Board</h3>
          <div class="ops-grid">
            <article class="card">
              <h3>North Zone</h3>
              <div class="status-chip monitor" id="northStatus">Monitoring</div>
              <div class="actions">
                <button class="btn" id="northOpenBtn">Mark Open</button>
                <button class="btn" id="northMonitorBtn">Mark Monitor</button>
                <button class="btn" id="northClosedBtn">Mark Closed</button>
              </div>
            </article>
            <article class="card">
              <h3>Central Zone</h3>
              <div class="status-chip monitor" id="centralStatus">Monitoring</div>
              <div class="actions">
                <button class="btn" id="centralOpenBtn">Mark Open</button>
                <button class="btn" id="centralMonitorBtn">Mark Monitor</button>
                <button class="btn" id="centralClosedBtn">Mark Closed</button>
              </div>
            </article>
            <article class="card">
              <h3>South Zone</h3>
              <div class="status-chip monitor" id="southStatus">Monitoring</div>
              <div class="actions">
                <button class="btn" id="southOpenBtn">Mark Open</button>
                <button class="btn" id="southMonitorBtn">Mark Monitor</button>
                <button class="btn" id="southClosedBtn">Mark Closed</button>
              </div>
            </article>
          </div>
          <label>Shift Verification Note</label>
          <textarea id="opsNote" placeholder="Document latest field verification notes for checkpoints..."></textarea>
          <button class="btn primary" id="saveOpsNoteBtn">Save Shift Note</button>
          <button class="btn" id="quickHealthBtn">Run System Check</button>
          <button class="btn admin-only" id="quickUsersBtn">Sync Team Users</button>
          <div class="activity-feed" id="activityFeed"></div>
        </div>

        <div id="authView" class="view">
          <h3>Authentication</h3>
          <label>Email</label>
          <input id="email" value="admin@wasel.local" />
          <label>Password</label>
          <input id="password" type="password" value="ChangeMeAdmin123!" />
          <button class="btn primary" id="loginBtn">Login</button>
          <button class="btn" id="registerBtn">Register</button>
          <button class="btn" id="refreshBtn">Refresh Token</button>
          <button class="btn" id="logoutBtn">Logout</button>
          <div class="hint">Register uses firstName/lastName defaults unless changed in payload editor.</div>
        </div>

        <div id="meView" class="view">
          <h3>My Profile</h3>
          <button class="btn primary" id="meBtn">Load My Account</button>
          <button class="btn" id="myProfileBtn">Load My Profile</button>
          <label>Update Profile JSON</label>
          <textarea id="profilePayload">{ "firstName": "Wasel", "lastName": "User", "phone": "0599000000", "address": "Nablus" }</textarea>
          <button class="btn" id="updateProfileBtn">Save Profile Changes</button>
          <label>Change Password JSON</label>
          <textarea id="passwordPayload">{ "currentPassword": "ChangeMeAdmin123!", "newPassword": "NewPassword123!" }</textarea>
          <button class="btn" id="changePasswordBtn">Change Password</button>
        </div>

        <div id="usersView" class="view admin-only">
          <h3>Users and Admin Operations</h3>
          <button class="btn primary" id="listUsersBtn">List Users</button>
          <label>User ID</label>
          <input id="userIdInput" placeholder="UUID" />
          <button class="btn" id="getUserBtn">View Selected User</button>
          <button class="btn" id="deleteUserBtn">Delete Selected User</button>
          <label>Block Payload</label>
          <textarea id="blockPayload">{ "isBlocked": true }</textarea>
          <button class="btn" id="blockUserBtn">Block/Unblock User</button>
          <button class="btn" id="auditBtn">View Audit Logs</button>
        </div>

        <div id="moduleOpsView" class="view hidden">
          <h3>Module Operations</h3>
          <div class="hint">Grouped by backend modules. Pick a module, then click any endpoint to load it in the runner.</div>
          <div class="tabs" id="moduleTabs"></div>
          <div class="endpoint-list" id="moduleEndpointList"></div>
          <label>Selected Operation</label>
          <input id="moduleSelectedPath" value="/api/v1/auth/me" />
          <textarea id="moduleSelectedBody">{}</textarea>
          <button class="btn primary" id="runModuleActionBtn">Run Selected Operation</button>
        </div>

        <div id="explorerView" class="view hidden">
          <h3>Dynamic API Explorer</h3>
          <div class="hint">Click any endpoint to load method/path/body, then execute.</div>
          <div class="endpoint-list" id="endpointList"></div>
          <label>Method</label>
          <select id="httpMethod">
            <option>GET</option><option>POST</option><option>PUT</option><option>PATCH</option><option>DELETE</option>
          </select>
          <label>Path (absolute)</label>
          <input id="pathInput" value="/api/v1/auth/me" />
          <label>Request JSON (optional)</label>
          <textarea id="customBody">{}</textarea>
          <button class="btn primary" id="runCustomBtn">Run Request</button>
        </div>

        <div id="responseView" class="view">
          <h3>Activity Result</h3>
          <div class="muted" id="lastCall">No action executed yet.</div>
          <pre id="responsePane">{}</pre>
        </div>
      </section>
    </section>
    </div>
  </main>

  <script>
    const API_BASE = '/api/v1';
    const state = {
      accessToken: localStorage.getItem('wasel_access') || '',
      refreshToken: localStorage.getItem('wasel_refresh') || '',
      currentRole: localStorage.getItem('wasel_role') || 'GUEST',
      theme: localStorage.getItem('wasel_theme') || 'dark',
      openapi: null
    };

    const moduleContainer = document.getElementById('modules');
    const endpointCount = document.getElementById('endpointCount');
    const moduleCount = document.getElementById('moduleCount');
    const healthBadge = document.getElementById('healthBadge');
    const statusValue = document.getElementById('statusValue');
    const responsePane = document.getElementById('responsePane');
    const lastCall = document.getElementById('lastCall');
    const sessionState = document.getElementById('sessionState');
    const tokenPreview = document.getElementById('tokenPreview');
    const endpointList = document.getElementById('endpointList');
    const moduleTabs = document.getElementById('moduleTabs');
    const moduleEndpointList = document.getElementById('moduleEndpointList');
    const flashBox = document.getElementById('flashBox');
    const toastWrap = document.getElementById('toastWrap');
    const authGate = document.getElementById('authGate');
    const appWorkspace = document.getElementById('appWorkspace');
    const rolePill = document.getElementById('rolePill');
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const nablusReadiness = document.getElementById('nablusReadiness');
    const ramallahReadiness = document.getElementById('ramallahReadiness');
    const hebronReadiness = document.getElementById('hebronReadiness');
    const nablusFlag = document.getElementById('nablusFlag');
    const ramallahFlag = document.getElementById('ramallahFlag');
    const hebronFlag = document.getElementById('hebronFlag');
    const activityFeed = document.getElementById('activityFeed');
    const adminOnlyNodes = document.querySelectorAll('.admin-only');
    const zoneStatus = {
      north: document.getElementById('northStatus'),
      central: document.getElementById('centralStatus'),
      south: document.getElementById('southStatus')
    };

    function pushActivity(message) {
      if (!activityFeed) return;
      const now = new Date();
      const line = document.createElement('div');
      line.className = 'activity-item';
      line.textContent = now.toLocaleTimeString() + ' - ' + message;
      activityFeed.prepend(line);
      while (activityFeed.childElementCount > 20) {
        activityFeed.removeChild(activityFeed.lastChild);
      }
    }

    function setZoneState(zoneKey, stateLabel) {
      const node = zoneStatus[zoneKey];
      if (!node) return;
      node.className = 'status-chip';
      if (stateLabel === 'Open') node.classList.add('open');
      else if (stateLabel === 'Closed') node.classList.add('closed');
      else node.classList.add('monitor');
      node.textContent = stateLabel;
      pushActivity(zoneKey.charAt(0).toUpperCase() + zoneKey.slice(1) + ' zone set to ' + stateLabel + '.');
    }

    function applyTheme() {
      document.body.classList.toggle('light', state.theme === 'light');
      themeToggleBtn.textContent = state.theme === 'light' ? 'Use Dark Theme' : 'Use Light Theme';
    }

    function applyRoleUi() {
      const isAdmin = state.currentRole === 'ADMIN';
      adminOnlyNodes.forEach(function (node) {
        node.classList.toggle('hidden', !isAdmin);
      });
      rolePill.textContent = 'Role: ' + (state.currentRole || 'GUEST');
    }

    function setReadiness(cardValueNode, flagNode, score) {
      const safeScore = Math.max(0, Math.min(100, score));
      cardValueNode.textContent = safeScore + '%';
      flagNode.className = 'status-chip';
      if (safeScore >= 70) {
        flagNode.classList.add('open');
        flagNode.textContent = 'Stable';
      } else if (safeScore >= 40) {
        flagNode.classList.add('monitor');
        flagNode.textContent = 'Monitoring';
      } else {
        flagNode.classList.add('closed');
        flagNode.textContent = 'Restricted';
      }
    }

    function updateRegionalReadiness() {
      setReadiness(nablusReadiness, nablusFlag, Math.floor(Math.random() * 41) + 55);
      setReadiness(ramallahReadiness, ramallahFlag, Math.floor(Math.random() * 41) + 45);
      setReadiness(hebronReadiness, hebronFlag, Math.floor(Math.random() * 46) + 35);
    }

    function countOps(paths) {
      const methods = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'];
      let count = 0;
      for (const pathValue of Object.values(paths || {})) {
        for (const key of Object.keys(pathValue || {})) {
          if (methods.includes(key.toLowerCase())) count += 1;
        }
      }
      return count;
    }

    function renderModules(tags, paths) {
      const perTag = new Map();
      for (const pathValue of Object.values(paths || {})) {
        for (const operation of Object.values(pathValue || {})) {
          const operationTags = operation && Array.isArray(operation.tags) ? operation.tags : ['Uncategorized'];
          for (const tag of operationTags) {
            perTag.set(tag, (perTag.get(tag) || 0) + 1);
          }
        }
      }
      const knownTags = Array.isArray(tags) && tags.length ? tags.map(t => t.name) : Array.from(perTag.keys());
      moduleContainer.innerHTML = knownTags
        .map((tag) => {
          const n = perTag.get(tag) || 0;
          return '<article class="card"><h3>' + tag + '</h3><div class="value">' + n + '</div><div class="pill">Active services</div></article>';
        })
        .join('');
      moduleCount.textContent = String(knownTags.length);
    }

    function safeJsonParse(text, fallback) {
      try { return JSON.parse(text); } catch { return fallback; }
    }

    function refreshSessionUi() {
      if (state.accessToken) {
        sessionState.textContent = 'Authenticated';
        tokenPreview.textContent = state.accessToken.slice(0, 35) + '...';
        authGate.classList.add('hidden');
        appWorkspace.classList.remove('hidden');
      } else {
        sessionState.textContent = 'Not authenticated';
        tokenPreview.textContent = 'No access token yet.';
        authGate.classList.remove('hidden');
        appWorkspace.classList.add('hidden');
      }
    }

    function showFlash(type, message) {
      flashBox.className = 'flash';
      if (type) flashBox.classList.add(type);
      flashBox.textContent = message;
      pushToast(type, message);
    }

    function pushToast(type, message) {
      const item = document.createElement('div');
      item.className = 'toast' + (type ? ' ' + type : '');
      item.textContent = message;
      toastWrap.appendChild(item);
      setTimeout(function () {
        item.remove();
      }, 4200);
    }

    function switchToResponseTab() {
      document.querySelectorAll('.tab').forEach(function (t) { t.classList.remove('active'); });
      document.querySelectorAll('.view').forEach(function (v) { v.classList.remove('active'); });
      const btn = document.querySelector('.tab[data-target="responseView"]');
      if (btn) btn.classList.add('active');
      const panel = document.getElementById('responseView');
      if (panel) panel.classList.add('active');
    }

    function setTokens(accessToken, refreshToken) {
      if (accessToken) {
        state.accessToken = accessToken;
        localStorage.setItem('wasel_access', accessToken);
      }
      if (refreshToken) {
        state.refreshToken = refreshToken;
        localStorage.setItem('wasel_refresh', refreshToken);
      }
      refreshSessionUi();
      syncCurrentUserRole();
    }

    function clearTokens() {
      state.accessToken = '';
      state.refreshToken = '';
      state.currentRole = 'GUEST';
      localStorage.removeItem('wasel_access');
      localStorage.removeItem('wasel_refresh');
      localStorage.removeItem('wasel_role');
      applyRoleUi();
      refreshSessionUi();
    }

    async function syncCurrentUserRole() {
      if (!state.accessToken) {
        state.currentRole = 'GUEST';
        applyRoleUi();
        return;
      }
      try {
        const res = await fetch(API_BASE + '/auth/me', {
          headers: { Authorization: 'Bearer ' + state.accessToken },
        });
        const body = await res.json();
        const role = body && body.role ? String(body.role) : 'USER';
        state.currentRole = role;
        localStorage.setItem('wasel_role', role);
        applyRoleUi();
      } catch {
        state.currentRole = 'USER';
        applyRoleUi();
      }
    }

    async function callApi(method, path, body) {
      const headers = { 'Content-Type': 'application/json' };
      if (state.accessToken) headers.Authorization = 'Bearer ' + state.accessToken;
      const opts = { method: method, headers: headers };
      if (body && method !== 'GET' && method !== 'DELETE') {
        opts.body = JSON.stringify(body);
      }
      const res = await fetch(path, opts);
      const text = await res.text();
      const parsed = safeJsonParse(text, text || {});
      lastCall.textContent = 'Last action status: ' + res.status;
      responsePane.textContent = JSON.stringify(parsed, null, 2);
      if (res.ok) {
        showFlash('ok', 'Action completed successfully. Status ' + res.status + '.');
        pushActivity('Request completed successfully with status ' + res.status + '.');
      } else {
        const msg = parsed && parsed.message ? parsed.message : 'Request failed';
        showFlash('err', 'Action failed. Status ' + res.status + ' - ' + msg);
        pushActivity('Request failed with status ' + res.status + '.');
      }
      switchToResponseTab();
      return { ok: res.ok, status: res.status, data: parsed };
    }

    function wireTabs() {
      document.querySelectorAll('.tab').forEach(function (btn) {
        btn.addEventListener('click', function () {
          const target = btn.getAttribute('data-target');
          document.querySelectorAll('.tab').forEach(function (t) { t.classList.remove('active'); });
          document.querySelectorAll('.view').forEach(function (v) { v.classList.remove('active'); });
          btn.classList.add('active');
          document.getElementById(target).classList.add('active');
        });
      });
    }

    function generateExampleFromSchema(schemaRef) {
      if (!schemaRef || !state.openapi || !state.openapi.components || !state.openapi.components.schemas) return {};
      const parts = String(schemaRef).split('/');
      const key = parts[parts.length - 1];
      const schema = state.openapi.components.schemas[key];
      if (!schema || !schema.properties) return {};
      const out = {};
      Object.keys(schema.properties).forEach(function (prop) {
        const rule = schema.properties[prop];
        if (rule.example !== undefined) out[prop] = rule.example;
        else if (rule.enum && rule.enum.length) out[prop] = rule.enum[0];
        else if (rule.type === 'boolean') out[prop] = false;
        else if (rule.type === 'number' || rule.type === 'integer') out[prop] = 0;
        else out[prop] = '';
      });
      return out;
    }

    function detectModuleName(path) {
      if (path.startsWith('/api/v1/auth')) return 'Authentication';
      if (path.startsWith('/api/v1/users') || path.startsWith('/api/v1/admin')) return 'Users/Admin';
      if (path.startsWith('/api/v1/checkpoints')) return 'Checkpoints';
      if (path.startsWith('/api/v1/incidents')) return 'Incidents';
      if (path.startsWith('/api/v1/reports')) return 'Reports';
      if (path.startsWith('/api/v1/alerts')) return 'Alerts';
      if (path.startsWith('/api/v1/external')) return 'External';
      if (path.startsWith('/api/v1/routes')) return 'Routes';
      if (path.startsWith('/health')) return 'System';
      return 'Other';
    }

    function renderModuleOps(rows) {
      const modulesMap = new Map();
      rows.forEach(function (r) {
        const name = detectModuleName(r.path);
        if (!modulesMap.has(name)) modulesMap.set(name, []);
        modulesMap.get(name).push(r);
      });

      const orderedModules = ['Authentication', 'Users/Admin', 'Checkpoints', 'Incidents', 'Reports', 'Alerts', 'External', 'Routes', 'System', 'Other']
        .filter(function (name) { return modulesMap.has(name); });
      if (!orderedModules.length) {
        moduleTabs.innerHTML = '';
        moduleEndpointList.innerHTML = '<div class="muted">No operations detected.</div>';
        return;
      }

      const firstModule = orderedModules[0];
      moduleTabs.innerHTML = orderedModules
        .map(function (name, idx) {
          return '<button class="tab' + (idx === 0 ? ' active' : '') + '" data-module="' + name + '">' + name + '</button>';
        })
        .join('');

      function paintModule(name) {
        const items = modulesMap.get(name) || [];
        moduleEndpointList.innerHTML = items.map(function (r) {
          return '<div class="endpoint-item" data-method="' + r.method + '" data-path="' + r.path + '"><b>' + r.method + '</b> ' + r.path + '<div class="hint">' + (r.op.summary || 'No summary') + '</div></div>';
        }).join('');
        moduleEndpointList.querySelectorAll('.endpoint-item').forEach(function (item) {
          item.addEventListener('click', function () {
            const method = item.getAttribute('data-method');
            const path = item.getAttribute('data-path');
            document.getElementById('httpMethod').value = method;
            document.getElementById('pathInput').value = path;
            document.getElementById('moduleSelectedPath').value = method + ' ' + path;

            const op = rows.find(function (x) { return x.path === path && x.method === method; });
            let sample = {};
            const schemaRef = op && op.op && op.op.requestBody && op.op.requestBody.content && op.op.requestBody.content['application/json'] && op.op.requestBody.content['application/json'].schema && op.op.requestBody.content['application/json'].schema['$ref'];
            if (schemaRef) sample = generateExampleFromSchema(schemaRef);
            const bodyText = JSON.stringify(sample, null, 2);
            document.getElementById('customBody').value = bodyText;
            document.getElementById('moduleSelectedBody').value = bodyText;
          });
        });
      }

      moduleTabs.querySelectorAll('[data-module]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          moduleTabs.querySelectorAll('[data-module]').forEach(function (x) { x.classList.remove('active'); });
          btn.classList.add('active');
          paintModule(btn.getAttribute('data-module'));
        });
      });

      paintModule(firstModule);
    }

    function renderExplorer(doc) {
      const methods = ['get', 'post', 'put', 'patch', 'delete'];
      const rows = [];
      Object.keys(doc.paths || {}).forEach(function (path) {
        methods.forEach(function (m) {
          const op = doc.paths[path] && doc.paths[path][m];
          if (!op) return;
          rows.push({ method: m.toUpperCase(), path: path, op: op });
        });
      });
      endpointList.innerHTML = rows.map(function (r) {
        return '<div class="endpoint-item" data-method="' + r.method + '" data-path="' + r.path + '"><b>' + r.method + '</b> ' + r.path + '<div class="hint">' + (r.op.summary || 'No summary') + '</div></div>';
      }).join('');
      renderModuleOps(rows);
      endpointList.querySelectorAll('.endpoint-item').forEach(function (item) {
        item.addEventListener('click', function () {
          const method = item.getAttribute('data-method');
          const path = item.getAttribute('data-path');
          document.getElementById('httpMethod').value = method;
          document.getElementById('pathInput').value = path;
          const op = (doc.paths[path] || {})[method.toLowerCase()];
          let sample = {};
          const schemaRef = op && op.requestBody && op.requestBody.content && op.requestBody.content['application/json'] && op.requestBody.content['application/json'].schema && op.requestBody.content['application/json'].schema['$ref'];
          if (schemaRef) sample = generateExampleFromSchema(schemaRef);
          document.getElementById('customBody').value = JSON.stringify(sample, null, 2);
        });
      });
    }

    async function loadApiMeta() {
      try {
        const res = await fetch('/openapi.json');
        const doc = await res.json();
        state.openapi = doc;
        endpointCount.textContent = String(countOps(doc.paths));
        renderModules(doc.tags, doc.paths);
        renderExplorer(doc);
      } catch {
        endpointCount.textContent = 'N/A';
        moduleCount.textContent = 'N/A';
        moduleContainer.innerHTML = '<article class="card"><h3>Unable to load API metadata</h3><div class="muted">Please ensure backend is running correctly.</div></article>';
      }
    }

    async function loadHealth() {
      try {
        const res = await fetch('/health');
        const body = await res.json();
        const ok = res.ok && (body.status === 'ok' || body.status === 'healthy');
        healthBadge.textContent = ok ? 'System healthy' : 'Health warning';
        healthBadge.className = ok ? 'badge ok' : 'badge';
        statusValue.textContent = body.status || (ok ? 'ok' : 'warning');
        updateRegionalReadiness();
      } catch {
        healthBadge.textContent = 'Health unavailable';
        statusValue.textContent = 'offline';
        setReadiness(nablusReadiness, nablusFlag, 20);
        setReadiness(ramallahReadiness, ramallahFlag, 20);
        setReadiness(hebronReadiness, hebronFlag, 20);
      }
    }

    function wireActions() {
      themeToggleBtn.addEventListener('click', function () {
        state.theme = state.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('wasel_theme', state.theme);
        applyTheme();
      });
      document.getElementById('clearTokensBtn').addEventListener('click', clearTokens);
      document.getElementById('quickHealthBtn').addEventListener('click', function () {
        loadHealth();
        showFlash('ok', 'System check requested.');
        pushActivity('System health check triggered by operator.');
      });
      document.getElementById('quickUsersBtn').addEventListener('click', function () {
        callApi('GET', API_BASE + '/users');
      });
      document.getElementById('saveOpsNoteBtn').addEventListener('click', function () {
        const note = document.getElementById('opsNote').value.trim();
        if (!note) {
          showFlash('warn', 'Write a note before saving.');
          return;
        }
        localStorage.setItem('wasel_shift_note', note);
        showFlash('ok', 'Shift note saved locally for this operator session.');
        pushActivity('Shift note saved.');
      });

      document.getElementById('northOpenBtn').addEventListener('click', function () { setZoneState('north', 'Open'); });
      document.getElementById('northMonitorBtn').addEventListener('click', function () { setZoneState('north', 'Monitoring'); });
      document.getElementById('northClosedBtn').addEventListener('click', function () { setZoneState('north', 'Closed'); });
      document.getElementById('centralOpenBtn').addEventListener('click', function () { setZoneState('central', 'Open'); });
      document.getElementById('centralMonitorBtn').addEventListener('click', function () { setZoneState('central', 'Monitoring'); });
      document.getElementById('centralClosedBtn').addEventListener('click', function () { setZoneState('central', 'Closed'); });
      document.getElementById('southOpenBtn').addEventListener('click', function () { setZoneState('south', 'Open'); });
      document.getElementById('southMonitorBtn').addEventListener('click', function () { setZoneState('south', 'Monitoring'); });
      document.getElementById('southClosedBtn').addEventListener('click', function () { setZoneState('south', 'Closed'); });

      document.getElementById('loginBtn').addEventListener('click', async function () {
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const result = await callApi('POST', API_BASE + '/auth/login', { email: email, password: password });
        if (result.ok && result.data) {
          setTokens(result.data.accessToken, result.data.refreshToken);
          showFlash('ok', 'Login successful. Tokens updated and session authenticated.');
        } else {
          clearTokens();
          showFlash('err', 'Login failed. Check credentials or create a user with Register.');
        }
      });

      document.getElementById('registerBtn').addEventListener('click', async function () {
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const result = await callApi('POST', API_BASE + '/auth/register', {
          email: email,
          password: password,
          firstName: 'New',
          lastName: 'User'
        });
        if (result.ok) showFlash('ok', 'Register successful. You can login now.');
      });

      document.getElementById('refreshBtn').addEventListener('click', async function () {
        if (!state.refreshToken) {
          showFlash('warn', 'No refresh token found. Login first.');
          return;
        }
        const result = await callApi('POST', API_BASE + '/auth/refresh', { refreshToken: state.refreshToken });
        if (result.ok && result.data) {
          setTokens(result.data.accessToken, result.data.refreshToken);
          showFlash('ok', 'Token refresh successful.');
        }
      });

      document.getElementById('logoutBtn').addEventListener('click', async function () {
        if (!state.refreshToken) {
          showFlash('warn', 'No refresh token found. Already logged out.');
          return;
        }
        await callApi('POST', API_BASE + '/auth/logout', { refreshToken: state.refreshToken });
        clearTokens();
        showFlash('ok', 'Logged out and cleared local tokens.');
      });

      document.getElementById('meBtn').addEventListener('click', function () {
        callApi('GET', API_BASE + '/auth/me');
      });
      document.getElementById('myProfileBtn').addEventListener('click', function () {
        callApi('GET', API_BASE + '/users/profile');
      });
      document.getElementById('updateProfileBtn').addEventListener('click', function () {
        const payload = safeJsonParse(document.getElementById('profilePayload').value, {});
        callApi('PATCH', API_BASE + '/users/profile', payload);
      });
      document.getElementById('changePasswordBtn').addEventListener('click', function () {
        const payload = safeJsonParse(document.getElementById('passwordPayload').value, {});
        callApi('PATCH', API_BASE + '/auth/password', payload);
      });

      document.getElementById('listUsersBtn').addEventListener('click', function () {
        callApi('GET', API_BASE + '/users');
      });
      document.getElementById('getUserBtn').addEventListener('click', function () {
        const id = document.getElementById('userIdInput').value.trim();
        if (!id) return;
        callApi('GET', API_BASE + '/users/' + encodeURIComponent(id));
      });
      document.getElementById('deleteUserBtn').addEventListener('click', function () {
        const id = document.getElementById('userIdInput').value.trim();
        if (!id) return;
        callApi('DELETE', API_BASE + '/users/' + encodeURIComponent(id));
      });
      document.getElementById('blockUserBtn').addEventListener('click', function () {
        const id = document.getElementById('userIdInput').value.trim();
        if (!id) return;
        const payload = safeJsonParse(document.getElementById('blockPayload').value, { isBlocked: true });
        callApi('PATCH', API_BASE + '/users/' + encodeURIComponent(id) + '/block', payload);
      });
      document.getElementById('auditBtn').addEventListener('click', function () {
        callApi('GET', API_BASE + '/admin/audit-logs');
      });

      document.getElementById('runCustomBtn').addEventListener('click', function () {
        const method = document.getElementById('httpMethod').value.toUpperCase();
        const path = document.getElementById('pathInput').value.trim();
        const body = safeJsonParse(document.getElementById('customBody').value, {});
        callApi(method, path, body);
      });

      document.getElementById('runModuleActionBtn').addEventListener('click', function () {
        const selected = document.getElementById('moduleSelectedPath').value.trim();
        const firstSpace = selected.indexOf(' ');
        if (firstSpace === -1) {
          showFlash('warn', 'Selected operation must be in format: METHOD /path');
          return;
        }
        const method = selected.slice(0, firstSpace).toUpperCase();
        const path = selected.slice(firstSpace + 1).trim();
        const body = safeJsonParse(document.getElementById('moduleSelectedBody').value, {});
        callApi(method, path, body);
      });

      document.getElementById('gateLoginBtn').addEventListener('click', async function () {
        const email = document.getElementById('gateEmail').value.trim();
        const password = document.getElementById('gatePassword').value;
        document.getElementById('email').value = email;
        document.getElementById('password').value = password;
        const result = await callApi('POST', API_BASE + '/auth/login', { email: email, password: password });
        if (result.ok && result.data) {
          setTokens(result.data.accessToken, result.data.refreshToken);
          showFlash('ok', 'Login successful. Workspace unlocked.');
        } else {
          clearTokens();
          showFlash('err', 'Login failed. Check credentials or register first.');
        }
      });

      document.getElementById('gateRegisterBtn').addEventListener('click', async function () {
        const email = document.getElementById('gateEmail').value.trim();
        const password = document.getElementById('gatePassword').value;
        document.getElementById('email').value = email;
        document.getElementById('password').value = password;
        const result = await callApi('POST', API_BASE + '/auth/register', {
          email: email,
          password: password,
          firstName: 'New',
          lastName: 'User'
        });
        if (result.ok) showFlash('ok', 'Register successful. You can login now.');
      });
    }

    applyTheme();
    applyRoleUi();
    refreshSessionUi();
    syncCurrentUserRole();
    const savedNote = localStorage.getItem('wasel_shift_note');
    if (savedNote && document.getElementById('opsNote')) {
      document.getElementById('opsNote').value = savedNote;
    }
    pushActivity('Operational console loaded.');
    wireTabs();
    wireActions();
    loadApiMeta();
    loadHealth();
  </script>
</body>
</html>`;
  }
}
