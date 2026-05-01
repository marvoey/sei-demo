const SEGMENT_KEY = 'sei_segment';

const SEGMENTS = {
  'bd-breakaway': {
    label: 'BD Breakaway',
    icon: '📈',
    desc: 'Moving from a broker-dealer to independence',
    page: '/sei-bd-breakaway/index.html'
  },
  'enterprise-ria': {
    label: 'Enterprise RIA',
    icon: '🏢',
    desc: 'Established independent advisory at scale',
    page: '/sei-enterprise-ria/index.html'
  }
};

function getSegment() { return localStorage.getItem(SEGMENT_KEY); }
function setSegment(s) { localStorage.setItem(SEGMENT_KEY, s); }
function clearSegment() { localStorage.removeItem(SEGMENT_KEY); }
function getSegmentMeta(s) { return SEGMENTS[s] || null; }
function getSegmentPage(s) { return SEGMENTS[s]?.page || 'index.html'; }
function getSegmentLabel(s) { return SEGMENTS[s]?.label || s; }
function getAllSegments() { return Object.entries(SEGMENTS).map(([id, meta]) => ({ id, ...meta })); }

window.SEI_Personalization = {
  getSegment,
  setSegment,
  clearSegment,
  getSegmentMeta,
  getSegmentPage,
  getSegmentLabel,
  getAllSegments
};
