import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../../styles/global.css';
import './assessment.css';
import { renderLayout } from '../../components/layout.js';
import { requireAuthenticatedUser } from '../../services/auth-service.js';
import { saveAssessmentResult } from '../../services/assessment-service.js';
import { escapeHtml } from '../../utils/html.js';
import { assessmentDimensions, assessmentQuestions } from './assessment-questions.js';
import { calculateAssessmentScores } from './assessment-scoring.js';

document.querySelector('#app').innerHTML = '<main class="d-grid min-vh-100" style="place-items:center"><span class="spinner-border text-success" aria-label="Loading assessment"></span></main>';
const user = await requireAuthenticatedUser();

if (user) initializeAssessment();

function initializeAssessment() {
  const state = { index: 0, answers: {}, submitting: false };
  renderLayout({ activePath: '/assessment', mainClass: 'assessment-page', content: `<section class="container assessment-shell py-5">
    <header class="text-center mb-4"><p class="text-success fw-bold text-uppercase small mb-2">Personal Assessment</p><h1 class="display-6 fw-bold mb-3">Lifestyle &amp; Wellbeing Self-Assessment</h1><p class="lead text-body-secondary mb-0">Reflect on everyday patterns across stress, movement and social connection.</p></header>
    <aside class="assessment-disclaimer rounded-3 p-3 mb-4 small" aria-label="Important disclaimer"><i class="bi bi-info-circle me-2 text-success" aria-hidden="true"></i>This tool supports general lifestyle and wellbeing awareness. It is not a medical or psychological diagnosis and does not replace professional medical or mental health advice.</aside>
    <div id="assessment-content"></div>
  </section>` });
  renderQuestion(state);
}

function renderQuestion(state) {
  const item = assessmentQuestions[state.index];
  const selected = state.answers[item.id];
  const percent = Math.round(((state.index + 1) / assessmentQuestions.length) * 100);
  const container = document.querySelector('#assessment-content');
  container.innerHTML = `<article class="card assessment-card border-0"><div class="card-body p-sm-5">
    <div class="d-flex justify-content-between gap-3 mb-2"><span class="text-success fw-semibold">${escapeHtml(assessmentDimensions[item.dimension])}</span><span class="text-body-secondary">Question ${item.id} of ${assessmentQuestions.length}</span></div>
    <div class="progress assessment-progress mb-4" role="progressbar" aria-label="Assessment progress" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100"><div class="progress-bar" style="width:${percent}%"></div></div>
    <form id="question-form"><fieldset><legend class="h3 mb-4">${escapeHtml(item.prompt)}</legend><div class="d-grid gap-3">${item.answers.map((answer) => `<div class="assessment-option form-check"><input class="form-check-input" type="radio" name="answer" id="answer-${item.id}-${answer.score}" value="${answer.score}"${selected === answer.score ? ' checked' : ''} required><label class="form-check-label" for="answer-${item.id}-${answer.score}">${escapeHtml(answer.label)}</label></div>`).join('')}</div><div class="text-danger small mt-3 d-none" id="answer-error" role="alert">Choose one answer to continue.</div></fieldset>
      <div class="assessment-actions d-flex flex-column-reverse flex-sm-row justify-content-between gap-2 mt-4"><button class="btn btn-outline-secondary" id="previous-question" type="button"${state.index === 0 ? ' disabled' : ''}><i class="bi bi-arrow-left me-2"></i>Previous</button><button class="btn btn-primary" id="next-question" type="submit">${state.index === assessmentQuestions.length - 1 ? 'Submit & View Results <i class="bi bi-check2-circle ms-2"></i>' : 'Next <i class="bi bi-arrow-right ms-2"></i>'}</button></div>
    </form>
  </div></article>`;

  container.querySelector('#previous-question').addEventListener('click', () => { saveVisibleAnswer(state); state.index -= 1; renderQuestion(state); });
  container.querySelector('#question-form').addEventListener('submit', (event) => handleNext(event, state));
  container.querySelector('input:checked, input')?.focus({ preventScroll: true });
}

async function handleNext(event, state) {
  event.preventDefault();
  if (!saveVisibleAnswer(state)) {
    document.querySelector('#answer-error').classList.remove('d-none');
    return;
  }
  if (state.index < assessmentQuestions.length - 1) {
    state.index += 1;
    renderQuestion(state);
    return;
  }
  if (state.submitting || Object.keys(state.answers).length !== assessmentQuestions.length) return;
  state.submitting = true;
  const button = document.querySelector('#next-question');
  button.disabled = true;
  button.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Submitting...';
  try {
    const scores = calculateAssessmentScores(state.answers);
    renderCompletionLoading();
    await Promise.all([saveAssessmentResult(scores), delay(850)]);
    renderResults(scores);
  } catch (error) {
    console.error('Assessment could not be saved.', error);
    state.submitting = false;
    renderQuestion(state);
    const form = document.querySelector('#question-form');
    form.insertAdjacentHTML('afterbegin', `<div class="alert alert-danger">${escapeHtml(error.message || 'Your assessment could not be saved. Please try again.')}</div>`);
  }
}

function saveVisibleAnswer(state) {
  const selected = document.querySelector('input[name="answer"]:checked');
  if (!selected) return false;
  state.answers[assessmentQuestions[state.index].id] = Number(selected.value);
  return true;
}

function renderCompletionLoading() {
  document.querySelector('#assessment-content').innerHTML = `<div class="card assessment-card border-0 text-center"><div class="card-body p-5" aria-live="polite"><i class="bi bi-check-circle-fill text-success display-5"></i><h2 class="h3 mt-3">You have successfully completed the assessment.</h2><div class="spinner-border spinner-border-sm text-success mt-3" aria-hidden="true"></div><p class="text-body-secondary mt-2 mb-0">Generating your results…</p></div></div>`;
}

function renderResults(scores) {
  const rows = [['stress', 'Stress Level'], ['sedentary', 'Sedentary Lifestyle Risk'], ['social', 'Social Disconnection Risk']];
  document.querySelector('#assessment-content').innerHTML = `<article class="card assessment-card border-0"><div class="card-body p-4 p-sm-5"><p class="text-success fw-bold text-uppercase small mb-2">Assessment complete</p><h2 class="h2 mb-2">Your results summary</h2><p class="text-body-secondary mb-4">Higher percentages indicate a higher lifestyle risk in that area.</p><div class="d-grid gap-3">${rows.map(([key, label]) => `<div class="assessment-result d-flex flex-column flex-sm-row justify-content-between gap-1 p-3"><span>${label}</span><strong>${scores[key].score}% — ${scores[key].label}</strong></div>`).join('')}</div><div class="d-flex flex-column flex-sm-row gap-2 mt-4"><a class="btn btn-primary" href="/assessment">Take assessment again</a><a class="btn btn-outline-secondary" href="/dashboard">Return to Dashboard</a></div></div></article>`;
}

function delay(milliseconds) { return new Promise((resolve) => window.setTimeout(resolve, milliseconds)); }
