import { assessmentQuestions } from './assessment-questions.js';

const maximums = { stress: 14, sedentary: 14, social: 12 };

export function getRiskLabel(score) {
  if (!Number.isInteger(score) || score < 0 || score > 100) throw new RangeError('Score must be an integer from 0 to 100.');
  if (score <= 25) return 'Low';
  if (score <= 50) return 'Mild';
  if (score <= 75) return 'Elevated';
  return 'High';
}

export function calculateAssessmentScores(answers) {
  if (assessmentQuestions.some(({ id }) => !Number.isInteger(answers[id]))) {
    throw new Error('All assessment questions must be answered.');
  }

  const points = { stress: 0, sedentary: 0, social: 0 };
  assessmentQuestions.forEach(({ id, dimension, answers: options }) => {
    const selected = options.find(({ score }) => score === answers[id]);
    if (!selected) throw new Error(`Question ${id} has an invalid answer.`);
    points[dimension] += selected.score;
  });

  return Object.fromEntries(Object.entries(points).map(([dimension, value]) => {
    const score = Math.round((value / maximums[dimension]) * 100);
    return [dimension, { score, label: getRiskLabel(score) }];
  }));
}
