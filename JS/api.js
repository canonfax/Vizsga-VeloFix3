// ═══════════════════════════════════════════
//  VeloFix · api.js
// ═══════════════════════════════════════════

const API = {

  // GET /hairdressers
  async getMechanics() {
    // Próba 1: /api/hairdressers
    try {
      const r = await fetch(`${CONFIG.API_BASE}/api/hairdressers`);
      if (r.ok) { console.log('[API] getMechanics OK: /api/hairdressers'); return await r.json(); }
      console.warn('[API] /api/hairdressers:', r.status, await r.text());
    } catch (e) { console.warn('[API] /api/hairdressers hiba:', e.message); }

    // Próba 2: /hairdressers
    try {
      const r = await fetch(`${CONFIG.API_BASE}/hairdressers`);
      if (r.ok) { console.log('[API] getMechanics OK: /hairdressers'); return await r.json(); }
      console.warn('[API] /hairdressers:', r.status, await r.text());
    } catch (e) { console.warn('[API] /hairdressers hiba:', e.message); }

    console.warn('[API] getMechanics: fallback');
    return FALLBACK_MECHANICS;
  },

  // GET appointments
  async getAppointments() {
    const paths = [
      `/api/appointments/${CONFIG.API_KEY}`,
      `/api/appointments?api_key=${CONFIG.API_KEY}`,
      `/appointments/${CONFIG.API_KEY}`,
      `/appointments?api_key=${CONFIG.API_KEY}`,
    ];

    for (const path of paths) {
      try {
        const r = await fetch(`${CONFIG.API_BASE}${path}`);
        if (r.ok) { console.log('[API] getAppointments OK:', path); return await r.json(); }
        const txt = await r.text();
        console.warn(`[API] ${path}:`, r.status, txt);
      } catch (e) {
        console.warn(`[API] ${path} hiba:`, e.message);
      }
    }
    return [];
  },

  // POST /appointments
  async createAppointment({ hairdresserId, customerName, customerPhone, appointmentDate, service }) {
    const payload = {
      hairdresser_id   : Number(hairdresserId),
      api_key          : CONFIG.API_KEY,
      customer_name    : customerName,
      customer_phone   : customerPhone,
      appointment_date : appointmentDate,
      service          : service,
    };

    const endpoints = [
      `${CONFIG.API_BASE}/api/appointments`,
      `${CONFIG.API_BASE}/appointments`,
    ];

    for (const url of endpoints) {
      try {
        const r = await fetch(url, {
          method  : 'POST',
          headers : { 'Content-Type': 'application/json' },
          body    : JSON.stringify(payload),
        });
        const txt = await r.text();
        console.log('[API] POST', url, r.status, txt);
        let json = {};
        try { json = JSON.parse(txt); } catch {}
        if (r.ok) return { ok: true };
        if (r.status !== 404) {
          return { ok: false, error: json.message || json.error || txt || `HTTP ${r.status}` };
        }
      } catch (e) {
        console.warn('[API] POST hiba:', url, e.message);
      }
    }
    return { ok: false, error: 'Nem sikerült elérni a szervert.' };
  },

  // Foglalt slotok
  async getBookedSlots(hairdresserId, dateStr) {
    const all = await this.getAppointments();
    return all
      .filter(a =>
        String(a.hairdresser_id) === String(hairdresserId) &&
        (a.appointment_date || '').startsWith(dateStr)
      )
      .map(a => (a.appointment_date || '').slice(11, 16));
  },
};