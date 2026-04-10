// Velofix - konfiguráció

const CONFIG = {
    API_BASE : 'http://salonsapi.prooktatas.hu/api',
    API_KEY : 'velofix2026',
    SLOT_MIN : 30,
};

// Fallback - ha az API nem válaszol
const FALLBACK_MECHANICS = [
    {id:1, name:'Kovács Péter', work_start:'08:00', work_end:'16:00'},
    {id:2, name:'Nagy István', work_start:'08:00', work_end:'16:00'},
    {id:3, name:'Tóth Balázs', work_start:'08:00', work_end:'16:00'},
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