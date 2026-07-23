const dimensions = {
  stress: { name: 'stress and recovery', focus: 'Protecting a regular sleep window, using brief breathing pauses and setting aside a small daily period without responsibilities can support recovery.' },
  sedentary: { name: 'movement and sedentary time', focus: 'Short movement breaks, a daily walk and two manageable strength or mobility sessions each week can make activity easier to sustain.' },
  social: { name: 'social connection', focus: 'A regular message, shared walk, community activity or unhurried conversation can create connection without requiring a major change to your schedule.' },
};

export function generateAssessmentAnalysis(scores) {
  const ranked = Object.entries(scores).sort(([, a], [, b]) => b.score - a.score);
  const [highestKey, highest] = ranked[0];
  const [lowestKey, lowest] = ranked[ranked.length - 1];
  const highestKeys = ranked.filter(([, value]) => value.score === highest.score).map(([key]) => key);
  const allEqual = highest.score === lowest.score;
  const elevatedCount = ranked.filter(([, value]) => value.score > 50).length;
  const average = Math.round(ranked.reduce((total, [, value]) => total + value.score, 0) / ranked.length);
  const opening = elevatedCount === 0
    ? 'Your results suggest a generally steady lifestyle pattern across the three areas explored here. This is a useful foundation to protect, while remembering that wellbeing naturally changes with work, relationships, sleep and other demands.'
    : elevatedCount === 1
      ? 'Your results show a mostly balanced pattern with one area that may benefit from a little more attention. Treat this as a practical prompt for reflection, not a judgment about how well you are doing.'
      : 'Your results suggest that several parts of daily life may currently be placing demands on your wellbeing. You do not need to change everything at once; a few repeatable actions can begin to support more balance.';
  const positive = allEqual
    ? `All three scores are aligned at ${lowest.score}%. ${lowest.score <= 25 ? 'That consistent Low pattern suggests several supportive habits may already be in place; notice and protect the routines that help you feel steady.' : 'Because no single area is clearly lower, choose the dimension where a small change feels most practical and use it as your starting point.'}`
    : lowest.score <= 25
    ? `Your lowest score is in ${dimensions[lowestKey].name}, which sits in the Low range. That may reflect helpful routines or sources of support already present in your life. Notice what is working there and consider how the same consistency could support other areas.`
    : `Of the three dimensions, ${dimensions[lowestKey].name} is currently the lowest-risk area at ${lowest.score}%. Even when a score is not Low, relative strengths matter: existing routines in this area may provide a realistic starting point for broader change.`;

  const priority = highestKeys.length > 1
    ? `The highest score is shared by ${highestKeys.map((key) => dimensions[key].name).join(' and ')}, at ${highest.score}% (${highest.label}). Start with whichever of these areas feels easiest to influence. ${dimensions[highestKey].focus}`
    : `The clearest priority is ${dimensions[highestKey].name}, with a score of ${highest.score}% (${highest.label}). ${dimensions[highestKey].focus}`;

  return `${opening}

${priority} Choose the suggestion that feels easiest to repeat, rather than the one that sounds most ambitious. A five-minute action completed regularly is often more useful than a large plan that is difficult to maintain.

${positive}

These dimensions often influence one another. Long periods of sitting can reduce energy and make stress feel harder to release; stress can disrupt sleep and motivation; and limited connection can make recovery feel less restorative. The reverse can also be helpful: a walk with another person adds movement, time outdoors and social contact, while a short stretch or breathing pause can interrupt sitting and create a calmer transition between tasks.

Your overall average across the assessment is ${average}%. For the next week, consider choosing one small daily anchor: stand and move each hour, take a ten-minute walk, keep a consistent wind-down time, spend a few quiet minutes breathing, or contact someone you value. Review how it affects your energy and routine, then adjust gently. These results are intended for lifestyle awareness and do not provide a medical or psychological diagnosis. If you have concerns about your physical or mental health, consider speaking with an appropriate qualified professional.`;
}
