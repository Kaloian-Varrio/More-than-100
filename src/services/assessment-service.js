import { supabase } from './supabase-client.js';
import { getCurrentUser } from './auth-service.js';

export async function saveAssessmentResult(scores) {
  const user = await getCurrentUser();
  if (!user) throw new Error('You must be logged in to save an assessment.');

  const summary = `Stress: ${scores.stress.score}% (${scores.stress.label}); Sedentary: ${scores.sedentary.score}% (${scores.sedentary.label}); Social: ${scores.social.score}% (${scores.social.label})`;
  const { data, error } = await supabase
    .from('assessment_results')
    .insert({
      user_id: user.id,
      stress_score: scores.stress.score,
      sedentary_score: scores.sedentary.score,
      social_score: scores.social.score,
      summary,
    })
    .select('id, user_id, stress_score, sedentary_score, social_score, summary, created_at')
    .single();

  if (error) throw error;
  return data;
}
