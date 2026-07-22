import { escapeHtml } from '../../utils/html.js';

export function createAssessmentGauge({ name, score, label, key }) {
  const safeScore = Math.min(100, Math.max(0, Number(score) || 0));
  const angle = getGaugeAngle(safeScore);
  const accessibleLabel = `${name}: ${safeScore}%, ${label} risk.`;
  return `<figure class="assessment-gauge assessment-gauge--${label.toLowerCase()} m-0" role="img" aria-label="${escapeHtml(accessibleLabel)}">
    <figcaption class="assessment-gauge__title">${escapeHtml(name)}</figcaption>
    <svg class="assessment-gauge__visual" viewBox="0 0 220 130" aria-hidden="true" focusable="false">
      <defs><linearGradient id="gauge-gradient-${key}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4f9b72"/><stop offset=".34" stop-color="#a7bd55"/><stop offset=".67" stop-color="#dc9b48"/><stop offset="1" stop-color="#c85d4d"/></linearGradient></defs>
      <path class="assessment-gauge__track" d="M 20 110 A 90 90 0 0 1 200 110" pathLength="100"/><path class="assessment-gauge__scale" d="M 20 110 A 90 90 0 0 1 200 110" pathLength="100" stroke="url(#gauge-gradient-${key})"/>
      <g class="assessment-gauge__needle" transform="rotate(${angle} 110 110)"><line x1="110" y1="110" x2="110" y2="38"/><circle cx="110" cy="110" r="7"/></g>
      <text class="assessment-gauge__edge" x="18" y="127">Low</text><text class="assessment-gauge__edge" x="202" y="127" text-anchor="end">High</text>
    </svg><div class="assessment-gauge__reading"><strong>${safeScore}%</strong><span>${escapeHtml(label)} risk</span></div>
  </figure>`;
}

export function getGaugeAngle(score) {
  const safeScore = Math.min(100, Math.max(0, Number(score) || 0));
  return -90 + (safeScore / 100) * 180;
}
