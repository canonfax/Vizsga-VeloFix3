// ═══════════════════════════════════════════
//  VeloFix · app.js  – főoldal, 3 lépés
// ═══════════════════════════════════════════

(() => {
  // ── Állapot ──
  let mechanics = [];
  let chosen    = null;   // kiválasztott szerelő
  let selDate   = null;
  let selSlot   = null;

  // ── DOM ──
  const app = document.getElementById('app');

  // ── Segédek ──
  function pad(n) { return String(n).padStart(2,'0'); }

  function setStep(n) {
    document.querySelectorAll('.step-dot').forEach((el, i) => {
      el.classList.toggle('active',    i + 1 === n);
      el.classList.toggle('done',      i + 1 <  n);
    });
    document.querySelectorAll('.step-line').forEach((el, i) => {
      el.classList.toggle('done', i + 1 < n);
    });
  }

  function toast(msg, type = '') {
    const c = document.getElementById('toasts');
    const t = document.createElement('div');
    t.className = 'toast' + (type ? ' ' + type : '');
    t.textContent = msg;
    c.appendChild(t);
    requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('show')));
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 3500);
  }

  function fmtDate(s) {
    if (!s) return '–';
    const [y, m, d] = s.split('-');
    return `${y}. ${m}. ${d}.`;
  }

  function checkSubmit() {
    const btn = document.getElementById('btn-submit');
    if (btn) btn.disabled = !(selDate && selSlot);
  }

  // ══════════════════════════════════════════
  //  LÉPÉS 1 – Szerelők
  // ══════════════════════════════════════════
  async function step1() {
    setStep(1);
    chosen = null; selDate = null; selSlot = null;

    app.innerHTML = `<div class="loader"><div class="spin"></div><span>Szerelők betöltése...</span></div>`;
    mechanics = await API.getMechanics();

    // Ikon hozzárendelés sorrend szerint
    const icons = ['👨‍🔧','👩‍🔧','🧑‍🔧','👷'];

    app.innerHTML = `
      <div class="section-intro">
        <h2 class="section-title">// VÁLASSZ SZAKEMBERT</h2>
        <p class="section-sub">Kattints egy szerelőre az időpontfoglalás megkezdéséhez</p>
      </div>
      <div class="mechanics-grid" id="mech-grid"></div>
    `;

    const grid = document.getElementById('mech-grid');
    mechanics.forEach((m, idx) => {
      const id = m.id ?? m.hairdresser_id;
      const card = document.createElement('div');
      card.className = 'mech-card';
      card.innerHTML = `
        <div class="mech-glow"></div>
        <div class="mech-icon">${icons[idx % icons.length]}</div>
        <h3 class="mech-name">${m.name}</h3>
        <div class="mech-hours">
          <span class="hours-label">MUNKAIDŐ</span>
          <span class="hours-val">${m.work_start || '08:00'} – ${m.work_end || '16:00'}</span>
        </div>
        <div class="mech-divider"></div>
        <button class="btn-primary">Időpontot foglalok →</button>
      `;
      card.querySelector('button').addEventListener('click', () => {
        chosen = { ...m, id };
        step2();
      });
      grid.appendChild(card);
    });
  }

  // ══════════════════════════════════════════
  //  LÉPÉS 2 – Foglalás
  // ══════════════════════════════════════════
  function step2() {
    setStep(2);
    selDate = null; selSlot = null;

    app.innerHTML = `
      <button class="btn-back" id="btn-back">← Vissza</button>

      <div class="booking-who">
        <div class="bw-label">// KIVÁLASZTOTT SZERELŐ</div>
        <div class="bw-name">${chosen.name}</div>
        <div class="bw-hours">${chosen.work_start || '08:00'} – ${chosen.work_end || '16:00'}</div>
      </div>

      <div class="booking-layout">

        <!-- BAL: naptár + slotok -->
        <div class="booking-left">
          <div class="panel">
            <div class="panel-label">// DÁTUM KIVÁLASZTÁSA</div>
            <div id="cal"></div>
          </div>
          <div class="panel" id="slots-panel" style="display:none">
            <div class="panel-label">// SZABAD IDŐPONTOK</div>
            <div id="slots"></div>
          </div>
        </div>

        <!-- JOBB: form -->
        <div class="booking-right">
          <div class="panel">
            <div class="panel-label">// ADATAID</div>
            <div class="form-group">
              <label>Teljes neved *</label>
              <input id="inp-name" type="text" placeholder="pl. Kovács Péter" autocomplete="name">
            </div>
            <div class="form-group">
              <label>Telefonszám *</label>
              <input id="inp-phone" type="tel" placeholder="pl. 06301234567" autocomplete="tel">
            </div>
            <div class="form-group">
              <label>Szervíz típusa *</label>
              <select id="inp-svc">
                <option value="">— Válassz —</option>
                ${SERVICES.map(s => `<option>${s}</option>`).join('')}
              </select>
            </div>
          </div>

          <div class="panel summary-panel">
            <div class="panel-label">// ÖSSZEFOGLALÓ</div>
            <div class="sum-row"><span>Szerelő</span><strong>${chosen.name}</strong></div>
            <div class="sum-row"><span>Dátum</span><strong id="sum-d">–</strong></div>
            <div class="sum-row"><span>Időpont</span><strong id="sum-s">–</strong></div>
          </div>

          <button class="btn-primary btn-submit" id="btn-submit" disabled>
            <span>LEFOGLALOM</span>
            <span class="btn-arrow">→</span>
          </button>
        </div>

      </div>
    `;

    document.getElementById('btn-back').addEventListener('click', step1);

    // Naptár init
    Calendar.init('cal', async (date) => {
      selDate = date; selSlot = null;
      document.getElementById('sum-d').textContent = fmtDate(date);
      document.getElementById('sum-s').textContent = '–';
      checkSubmit();

      const panel = document.getElementById('slots-panel');
      panel.style.display = 'block';

      await TimeSlots.render('slots', chosen, date, (slot) => {
        selSlot = slot;
        document.getElementById('sum-s').textContent = slot;
        checkSubmit();
      });
    });

    document.getElementById('btn-submit').addEventListener('click', doSubmit);
  }

  // ══════════════════════════════════════════
  //  SUBMIT
  // ══════════════════════════════════════════
  async function doSubmit() {
    const name    = document.getElementById('inp-name').value.trim();
    const phone   = document.getElementById('inp-phone').value.trim();
    const service = document.getElementById('inp-svc').value;

    if (!name)    return toast('Add meg a neved!', 'err');
    if (!phone)   return toast('Add meg a telefonszámodat!', 'err');
    if (!service) return toast('Válassz szervíztípust!', 'err');
    if (!selDate) return toast('Válassz dátumot!', 'err');
    if (!selSlot) return toast('Válassz időpontot!', 'err');

    const btn = document.getElementById('btn-submit');
    btn.disabled = true;
    btn.querySelector('span').textContent = 'Küldés...';

    const res = await API.createAppointment({
      hairdresserId   : chosen.id,
      customerName    : name,
      customerPhone   : phone,
      appointmentDate : `${selDate} ${selSlot}:00`,
      service,
    });

    if (res.ok) {
      step3({ name, service });
    } else {
      toast('Hiba: ' + (res.error || 'Ismeretlen hiba'), 'err');
      btn.disabled = false;
      btn.querySelector('span').textContent = 'LEFOGLALOM';
    }
  }

  // ══════════════════════════════════════════
  //  LÉPÉS 3 – Siker
  // ══════════════════════════════════════════
  function step3({ name, service }) {
    setStep(3);
    app.innerHTML = `
      <div class="success-wrap">
        <div class="success-icon">✓</div>
        <h2 class="success-title">FOGLALÁS RÖGZÍTVE</h2>
        <p class="success-sub">Köszönjük, <strong>${name}</strong>! Időpontod sikeresen rögzítettük.</p>
        <div class="success-card">
          <div class="sum-row"><span>Szerelő</span><strong>${chosen.name}</strong></div>
          <div class="sum-row"><span>Időpont</span><strong>${fmtDate(selDate)} ${selSlot}</strong></div>
          <div class="sum-row"><span>Szervíz</span><strong>${service}</strong></div>
        </div>
        <button class="btn-primary" id="btn-restart">← Új foglalás</button>
      </div>
    `;
    document.getElementById('btn-restart').addEventListener('click', step1);
  }

  // ── Indítás ──
  document.addEventListener('DOMContentLoaded', step1);
})();