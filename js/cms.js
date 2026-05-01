/* CMS client — swap CMS_URL to a real API endpoint when going live */
const CMS_URL = './cms/content.json';

async function fetchContent(segment) {
  const startTime = performance.now();
  const res = await fetch(CMS_URL);
  if (!res.ok) throw new Error(`CMS fetch failed: ${res.status}`);
  const data = await res.json();
  const elapsed = Math.round(performance.now() - startTime);

  const segmentData = data.segments[segment] || data.segments['default'];
  const content = { ...data.shared, ...segmentData, _meta: { segment, fetchMs: elapsed } };
  return content;
}

window.SEI_CMS = { fetchContent };
