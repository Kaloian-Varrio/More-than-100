export const assessmentDimensions = {
  stress: 'Stress Level',
  sedentary: 'Sedentary Lifestyle Risk',
  social: 'Social Disconnection Risk',
};

const question = (id, dimension, prompt, answers) => ({
  id,
  dimension,
  prompt,
  answers: answers.map((label, score) => ({ label, score })),
});

export const assessmentQuestions = [
  question(1, 'stress', 'How often do you feel overwhelmed by your daily responsibilities?', ['Rarely or never', 'Sometimes', 'Often or almost every day']),
  question(2, 'stress', 'How often do you feel that you have too many things to do and not enough time?', ['Rarely', 'Sometimes', 'Very often']),
  question(3, 'stress', 'How well do you feel you can handle unexpected problems?', ['Usually very well', 'It depends on the situation', 'I often feel unable to cope']),
  question(4, 'stress', 'How often do you have difficulty relaxing after work or daily responsibilities?', ['Rarely', 'Several times a week', 'Almost every day']),
  question(5, 'stress', 'How would you describe your average sleep duration?', ['Around 7–9 hours', 'Around 6 hours or more than 9 hours', 'Usually less than 6 hours']),
  question(6, 'stress', 'How often do work or personal concerns interfere with your sleep?', ['Rarely', 'Sometimes', 'Frequently']),
  question(7, 'stress', 'How often do you intentionally take time to relax, breathe, meditate or simply disconnect from responsibilities?', ['Almost every day', 'A few times per week', 'Rarely or never']),
  question(8, 'sedentary', 'How many days per week are you physically active for at least 30 minutes?', ['5–7 days', '2–4 days', '0–1 day']),
  question(9, 'sedentary', 'How much time do you typically spend sitting during a normal day?', ['Less than 4 hours', 'Around 4–8 hours', 'More than 8 hours']),
  question(10, 'sedentary', 'If you work or study while sitting, how often do you stand up or move?', ['At least once every hour', 'Every 1–2 hours', 'I often sit for several hours without moving']),
  question(11, 'sedentary', 'How often do you walk as part of your everyday routine?', ['Every day', 'A few times per week', 'Rarely']),
  question(12, 'sedentary', 'How often do you intentionally exercise or play a sport?', ['3 or more times per week', '1–2 times per week', 'Rarely or never']),
  question(13, 'sedentary', 'How often do you spend active time outdoors or in nature?', ['Several times per week', 'A few times per month', 'Rarely or never']),
  question(14, 'sedentary', 'How often do you include strength, mobility, stretching or similar body-maintenance activities in your routine?', ['2 or more times per week', 'Occasionally', 'Rarely or never']),
  question(15, 'social', 'How often do you have meaningful face-to-face contact with family, friends or people you care about?', ['Almost every day', 'A few times per week', 'Rarely']),
  question(16, 'social', 'Do you have someone you can talk to openly when you are worried or under stress?', ['Yes, definitely', 'Sometimes', 'Rarely or no']),
  question(17, 'social', 'How often do you feel lonely even when other people are around?', ['Rarely or never', 'Sometimes', 'Often']),
  question(18, 'social', 'How often do you participate in social, community, group or volunteer activities?', ['Regularly', 'Occasionally', 'Rarely or never']),
  question(19, 'social', 'How satisfied are you with the quality of your close relationships?', ['Very satisfied', 'Somewhat satisfied', 'Unsatisfied or disconnected']),
  question(20, 'social', 'How often do you experience positive physical or emotional connection with others — for example hugs, affection, shared activities, meaningful conversation or time with a pet?', ['Frequently', 'Sometimes', 'Rarely']),
];
