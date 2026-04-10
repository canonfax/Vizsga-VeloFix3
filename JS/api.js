// ═══════════════════════════════════════════
//  VeloFix · api.js
// ═══════════════════════════════════════════

const API = {

  // GET /hairdressers
  async getMechanics() {
    try {
      const r = await fetch(`${CONFIG.API_BASE}/hairdressers`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return await r.json();
    } catch (e) {
      console.warn('[API] getMechanics fallback:', e.message);
      return FALLBACK_MECHANICS;
    }
  },

  // GET /appointments/:api_key
  // 401 = még nincs mentett foglalás ezzel a kulccsal → üres tömb, nem hiba
  async getAppointments() {
    try {
      const r = await fetch(`${CONFIG.API_BASE}/appointments/${CONFIG.API_KEY}`);
      if (r.status === 401 || r.status === 404) return [];
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return await r.json();
    } catch (e) {
      console.warn('[API] getAppointments:', e.message);
      return [];
    }
  },

  // POST /appointments
  async createAppointment({ hairdresserId, customerName, customerPhone, appointmentDate, service }) {
    try {
      const body = new URLSearchParams({
        hairdresser_id   : hairdresserId,
        api_key          : CONFIG.API_KEY,
        customer_name    : customerName,
        customer_phone   : customerPhone,
        appointment_date : appointmentDate,
        service          : service,
      });

      const r = await fetch(`${CONFIG.API_BASE}/appointments`, {
        method  : 'POST',
        headers : { 'Content-Type': 'application/x-www-form-urlencoded' },
        body    : body.toString(),
      });

      const text = await r.text();
      let json = {};
      try { json = JSON.parse(text); } catch {}

      if (r.ok) return { ok: true };
      return { ok: false, error: json.message || json.error || text || `HTTP ${r.status}` };

    } catch (e) {
      return { ok: false, error: e.message };
    }
  },

  // Foglalt slotok egy napra és szerelőre
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