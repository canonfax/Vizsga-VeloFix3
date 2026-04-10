// ═══════════════════════════════════════════
//  VeloFix · api.js
// ═══════════════════════════════════════════

const API = {

  // GET /api/hairdressers
  async getMechanics() {
    try {
      const r = await fetch(`${CONFIG.API_BASE}/api/hairdressers`);
      if (r.ok) return await r.json();
      console.warn('[API] getMechanics:', r.status, await r.text());
    } catch (e) {
      console.warn('[API] getMechanics hiba:', e.message);
    }
    return FALLBACK_MECHANICS;
  },

  // GET /api/appointments?api_key=xxx
  async getAppointments() {
    try {
      const r = await fetch(`${CONFIG.API_BASE}/api/appointments?api_key=${CONFIG.API_KEY}`);
      if (r.ok) return await r.json();
      const txt = await r.text();
      console.error('[API] getAppointments:', r.status, txt);
    } catch (e) {
      console.error('[API] getAppointments hiba:', e.message);
    }
    return [];
  },

  // POST /api/appointments?api_key=xxx  ← api_key az URL-ben IS!
  async createAppointment({ hairdresserId, customerName, customerPhone, appointmentDate, service }) {
    try {
      const payload = {
        hairdresser_id   : Number(hairdresserId),
        api_key          : CONFIG.API_KEY,
        customer_name    : customerName,
        customer_phone   : customerPhone,
        appointment_date : appointmentDate,
        service          : service,
      };

      console.log('[API] POST küldés:', payload);

      const r = await fetch(`${CONFIG.API_BASE}/api/appointments?api_key=${CONFIG.API_KEY}`, {
        method  : 'POST',
        headers : { 'Content-Type': 'application/json' },
        body    : JSON.stringify(payload),
      });

      const txt = await r.text();
      console.log('[API] POST válasz:', r.status, txt);

      let json = {};
      try { json = JSON.parse(txt); } catch {}

      if (r.ok) return { ok: true };
      return { ok: false, error: json.message || json.error || txt || `HTTP ${r.status}` };

    } catch (e) {
      console.error('[API] POST hiba:', e.message);
      return { ok: false, error: e.message };
    }
  },

  // Foglalt slotok szűrése
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