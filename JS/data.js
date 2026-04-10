// ═══════════════════════════════════════════
//  VeloFix · data.js  – konfiguráció
// ═══════════════════════════════════════════

const CONFIG = {
  API_BASE : 'http://salonsapi.prooktatas.hu',   // ← base URL az /api nélkül!
  API_KEY  : 'velofix2026',
  SLOT_MIN : 30,
};

// Fallback – ha az API nem válaszol
const FALLBACK_MECHANICS = [
  { id:1, name:'Kovács Péter',  work_start:'08:00', work_end:'16:00' },
  { id:2, name:'Nagy Eszter',   work_start:'10:00', work_end:'18:00' },
  { id:3, name:'Tóth Balázs',   work_start:'08:00', work_end:'16:00' },
];

const SERVICES = [
  'Általános szervíz',
  'E-bike diagnosztika',
  'Kerékcsere / defektragasztás',
  'Fékrendszer beállítás',
  'Átvizsgálás + kenés',
  'Versenykerékpár optimalizálás',
  'Egyedi festés',
  'Egyéb',
];