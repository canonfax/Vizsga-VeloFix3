// ═══════════════════════════════════════════
//  VeloFix · timeslots.js
// ═══════════════════════════════════════════

const TimeSlots = (() => {

    function _genAll(mechanic) {
        const slots = [];
        const [sh, sm] = (mechanic.work_start || '08:00').split(':').map(Number);
        const [eh, em] = (mechanic.work_end || '16:00').split(':').map(Number);
        let h = sh, m = sm;
        while (h * 60 + m < eh * 60 + em) {
            slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
            m += CONFIG.SLOT_MIN;
            if (m >= 60) { m -= 60; h++ };
        }
        return slots;
    }

    async function render(containerId, mechanic, dateStr, onPick) {
        const wrap = document.getElementById(containerId);
        if (!wrap) return;

        wrap.innerHTML = `<div class="slots-loading"><span class="spin-sm"></span> Időpontok betöltése...</div>`;

        const booked = await API.getBookedSlots(mechanic.id || mechanic.hairdresser_id, dateStr);
        const all = _genAll(mechanic);

        const now = new Date();
        const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const isToday = dateStr === todayKey;

        const free = all.filter(slot => {
            if (booked.includes(slot)) return false;
            if (isToday) {
                const [h, m] = slot.split(':').map(Number);
                if (h * 60 + m <= now.getHours() * 60 + now.getMinutes()) return false;
            }
            return true;
        });

        if (!free.length) {
            wrap.innerHTML = `<p class="slots-empty">Erre a napra minden időpont foglalt.</p>`;
            return;
        }

        wrap.innerHTML = `<div class="slots-grid">${free.map(s => `<button class="slot-btn" data-slot="${s}">${s}</button>`).join('')
            }</div>`;


        wrap.querySelectorAll('.slot-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                wrap.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                onPick(btn.dataset.slot);
            });
        });
    }

    return {render};
})();