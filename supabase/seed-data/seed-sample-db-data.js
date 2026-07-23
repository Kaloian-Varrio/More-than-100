import { createHash } from 'node:crypto';

const REQUIRED_ENV = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SEED_ADMIN_PASSWORD',
  'SEED_JOHN_PASSWORD',
  'SEED_DENIS_PASSWORD',
  'SEED_NELINA_PASSWORD',
];
const validationOnly = process.argv.includes('--validate');
const usersOnly = process.argv.includes('--users-only');
const contentOnly = process.argv.includes('--content-only');

const missingEnvironmentVariables = REQUIRED_ENV.filter((name) => !process.env[name]);

if (!validationOnly && missingEnvironmentVariables.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvironmentVariables.join(', ')}. ` +
      'Copy .env.example to .env.local and add local values before seeding.',
  );
}

const supabaseUrl = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const authUsers = [
  {
    email: 'kaloianh@gmail.com',
    password: process.env.SEED_ADMIN_PASSWORD,
    role: 'admin',
    profile: {
      first_name: 'Kaloian',
      last_name: 'Hristov',
      nickname: 'kaloian-active',
      bio: 'Longevity enthusiast who enjoys strength training, mountain walks and practical healthy habits.',
      website_url: 'https://example.com/kaloian-active',
      instagram_url: 'https://instagram.com/kaloian.active',
    },
  },
  {
    email: 'john@gmail.com',
    password: process.env.SEED_JOHN_PASSWORD,
    role: 'user',
    profile: {
      first_name: 'John',
      last_name: 'Miller',
      nickname: 'john-moves',
      bio: 'Weekend runner, home cook and believer in small daily improvements.',
      instagram_url: 'https://instagram.com/john.moves',
    },
  },
  {
    email: 'denis@gmail.com',
    password: process.env.SEED_DENIS_PASSWORD,
    role: 'user',
    profile: {
      first_name: 'Denis',
      last_name: 'Petrov',
      nickname: 'denis-outdoors',
      bio: 'Outdoor enthusiast exploring better sleep, mindful breathing and everyday mobility.',
      facebook_url: 'https://facebook.com/denis.outdoors',
    },
  },
  {
    email: 'nelina@gmail.com',
    password: process.env.SEED_NELINA_PASSWORD,
    role: 'user',
    profile: {
      first_name: 'Nelina',
      last_name: 'Ivanova',
      nickname: 'nelina-wellbeing',
      bio: 'Yoga practitioner who values nourishing food, close friendships and time in nature.',
      instagram_url: 'https://instagram.com/nelina.wellbeing',
    },
  },
];

const categoryTree = {
  Foods: ['Fruits', 'Vegetables', 'Nuts', 'Dairy', 'Meat', 'Fish', 'Fermented Foods', 'Baked Foods', 'Root Vegetables'],
  Drinks: ['Water', 'Tea', 'Coffee', 'Kombucha'],
  Herbs: [],
  Mindfulness: ['Family', 'Meditation', 'Cold Therapy', 'Sleep', 'Breathing', 'Work', 'Activity'],
  Movement: ['Stretching', 'Yoga', 'Outdoor Activities', 'Running', 'Water Sports', 'Winter Sports'],
  'Emotions and Senses': [
    'Love',
    'Sharing',
    'Social Connection',
    'Volunteering',
    'Pets',
    'Connection with Nature',
    'Grounding',
    'Touch',
    'Intimacy',
  ],
};

const articles = [
  {
    title: 'A Short Morning Walk to Start the Day',
    slug: 'short-morning-walk-start-day',
    category: 'Outdoor Activities',
    author: 'john@gmail.com',
    short_description: 'A practical way to add gentle movement, daylight and a calm start to your morning.',
    content: 'Set out for ten to fifteen minutes at a comfortable pace. Leave your phone in your pocket, notice the light and let your breathing settle. A short walk is easy to repeat, and consistency matters more than distance.',
  },
  {
    title: 'Build a More Regular Sleep Rhythm',
    slug: 'build-regular-sleep-rhythm',
    category: 'Sleep',
    author: 'denis@gmail.com',
    short_description: 'Simple cues that can make evenings calmer and mornings more predictable.',
    content: 'Choose a realistic wake-up time and keep it fairly steady. Dim bright lights in the evening, finish demanding tasks earlier when possible and create a short wind-down routine that you can maintain.',
  },
  {
    title: 'A Simple Breathing Pause for Busy Moments',
    slug: 'simple-breathing-pause-busy-moments',
    category: 'Breathing',
    author: 'nelina@gmail.com',
    short_description: 'Use one quiet minute to slow down and reconnect with the present moment.',
    content: 'Sit or stand comfortably and breathe without forcing the pace. Let each exhale last slightly longer than the inhale for five gentle rounds. Stop if you feel uncomfortable and return to normal breathing.',
  },
  {
    title: 'Hydration as an Everyday Habit',
    slug: 'hydration-everyday-habit',
    category: 'Water',
    author: 'kaloianh@gmail.com',
    short_description: 'Straightforward reminders that make drinking water easier during a full day.',
    content: 'Keep water visible, drink with meals and carry a reusable bottle when you leave home. Needs vary with weather and activity, so use thirst and your daily routine as practical guides.',
  },
  {
    title: 'Make More Room for Nature',
    slug: 'make-more-room-for-nature',
    category: 'Connection with Nature',
    author: 'denis@gmail.com',
    short_description: 'Small ways to spend meaningful time outdoors even during a busy week.',
    content: 'Eat lunch outside, take a familiar route through a park or plan one longer weekend outing. Pay attention to sounds, textures and seasonal changes instead of treating outdoor time as another task.',
  },
  {
    title: 'Stretching After Long Periods of Sitting',
    slug: 'stretching-after-long-sitting',
    category: 'Stretching',
    author: 'john@gmail.com',
    short_description: 'A brief movement sequence for desk days and long journeys.',
    content: 'Stand up, roll your shoulders, reach overhead and gently move your hips and ankles. Keep every movement comfortable. Two or three minutes repeated through the day can feel more approachable than one long session.',
  },
  {
    title: 'Social Connection in Everyday Life',
    slug: 'social-connection-everyday-life',
    category: 'Social Connection',
    author: 'nelina@gmail.com',
    short_description: 'Simple, genuine ways to maintain relationships that matter.',
    content: 'Send a thoughtful message, share a walk or schedule an unhurried meal. Regular small moments of attention often support a relationship better than waiting for a perfect special occasion.',
  },
  {
    title: 'Adding Fermented Foods to Familiar Meals',
    slug: 'fermented-foods-familiar-meals',
    category: 'Fermented Foods',
    author: 'kaloianh@gmail.com',
    short_description: 'Easy serving ideas for yogurt, kefir, sauerkraut and other fermented foods.',
    content: 'Start with a small portion alongside foods you already enjoy. Add plain yogurt to breakfast, serve sauerkraut with lunch or try kefir in a smoothie. Choose products you like and check labels for ingredients.',
  },
  {
    title: 'Cold Exposure Basics for Beginners',
    slug: 'cold-exposure-basics-beginners',
    category: 'Cold Therapy',
    author: 'denis@gmail.com',
    short_description: 'A cautious introduction to brief, controlled encounters with cold water.',
    content: 'Begin by making the final seconds of a normal shower slightly cooler. Stay calm, never force yourself to continue and warm up naturally afterward. Avoid extreme temperatures and practise with extra caution if unsure.',
  },
  {
    title: 'What Pets Teach Us About Daily Presence',
    slug: 'pets-daily-presence',
    category: 'Pets',
    author: 'nelina@gmail.com',
    short_description: 'How ordinary routines with animals can create moments of connection and joy.',
    content: 'Feeding, walking and playing with a pet invite attention to a simple shared activity. Put distractions aside for a few minutes and notice the animal’s signals, energy and personality.',
  },
  {
    title: 'A Colorful Bowl of Everyday Vegetables',
    slug: 'colorful-bowl-everyday-vegetables',
    category: 'Vegetables',
    author: 'kaloianh@gmail.com',
    short_description: 'A flexible formula for preparing vegetables without a complicated recipe.',
    content: 'Combine two or three vegetables with a grain or bean, a favorite herb and a simple dressing. Mix raw and cooked textures, use what is in season and prepare extra portions for tomorrow.',
  },
  {
    title: 'Running at a Conversational Pace',
    slug: 'running-conversational-pace',
    category: 'Running',
    author: 'john@gmail.com',
    short_description: 'An approachable way to keep an easy run relaxed and enjoyable.',
    content: 'Choose a pace at which short sentences still feel comfortable. Slow down or take walking breaks whenever needed. Finish with energy left over so the next session feels inviting rather than intimidating.',
  },
  {
    title: 'Create a Quiet Tea Ritual',
    slug: 'create-quiet-tea-ritual',
    category: 'Tea',
    author: 'nelina@gmail.com',
    short_description: 'Turn an ordinary cup of tea into a brief mindful pause.',
    content: 'Choose a tea you enjoy, notice its aroma and sit down while you drink it. Let the preparation become a transition between tasks. Keep the ritual simple enough to fit naturally into your day.',
  },
  {
    title: 'Share Food, Time and Attention',
    slug: 'share-food-time-attention',
    category: 'Sharing',
    author: 'kaloianh@gmail.com',
    short_description: 'Low-pressure ideas for creating warm moments around a table.',
    content: 'Invite someone for a simple meal, bring fruit to a shared break or cook together. The menu does not need to be elaborate; attention and a welcoming atmosphere are what make the time memorable.',
  },
  {
    title: 'A Gentle Ten-Minute Yoga Reset',
    slug: 'gentle-ten-minute-yoga-reset',
    category: 'Yoga',
    author: 'denis@gmail.com',
    short_description: 'A short sequence focused on comfortable movement and steady breathing.',
    content: 'Move through an easy forward fold, a supported lunge and a seated twist without pushing your range. Pause between shapes, breathe normally and adapt each position to what feels comfortable today.',
  },
];

const expandedArticleContent = {
  'short-morning-walk-start-day': `## A small walk with a useful purpose
A morning walk does not need to be long, fast or athletic. Ten to fifteen minutes of comfortable movement can mark the transition from sleep into the day, offer daylight and create a little space before messages and tasks take over.

## How to begin
- Put on comfortable shoes and choose a familiar route.
- Walk at a pace that lets you breathe easily and speak in full sentences.
- Keep your phone in your pocket unless you need it for safety.
- Notice light, temperature and sounds instead of chasing a distance goal.

If ten minutes feels unrealistic, start with five. Link the walk to something that already happens, such as making coffee, taking a child to school or walking a dog. On busy mornings, a walk to transport or one lap around the building still counts.

Prepare shoes and a light layer the night before. Vary the experience gently: use a greener route once a week, invite a neighbor or finish with one minute of easy mobility. Consistency matters more than turning every outing into a workout.

## Comfort and safety
Choose visible routes and adapt to weather, traffic and daylight. Wear reflective details in low light and carry water for longer or hotter walks. Stop for pain, dizziness or unusual shortness of breath and seek appropriate advice. This is a flexible wellbeing habit, not a test you have to pass.`,

  'build-regular-sleep-rhythm': `## Why rhythm matters
Sleep is influenced by many factors, but timing is one of the clearest signals you can shape. A fairly regular wake-up time gives the day an anchor. The goal is not perfect discipline; it is a pattern that makes evenings calmer and mornings more predictable.

Choose a wake-up time that works on most workdays and weekends. Try to keep it within roughly the same hour, then get natural light and gentle movement after waking. If shifts change, repeat the same sequence—light, water, breakfast and movement—even when the clock time varies.

## Build a short wind-down
Thirty to sixty minutes before bed, lower the intensity of the day:
- dim bright lights and finish demanding work where possible;
- prepare clothes or a bag for tomorrow;
- wash, stretch gently or read a few pages;
- keep the bedroom cool, dark and reasonably quiet.

A ten-minute routine you repeat is more useful than an elaborate ideal you rarely follow. If you remain wide awake and frustrated, get up briefly and do something quiet in low light, then return when sleepy.

Notice whether late caffeine, alcohol, heavy meals, naps or stressful work consistently affect you. Change one factor at a time. Occasional poor nights are normal. Persistent insomnia, loud snoring with breathing pauses or severe daytime sleepiness deserve discussion with a qualified health professional. Lifestyle routines can support sleep, but they do not replace treatment when a problem continues.`,

  'simple-breathing-pause-busy-moments': `## What a breathing pause is
A breathing pause is a brief moment of attention, not a test of lung capacity. Many people use it as a transition between tasks or to interrupt the feeling of rushing.

## Try one gentle minute
Sit with your feet supported or stand comfortably. Let your shoulders drop. Breathe in through the nose if that feels natural, then exhale without pushing. For five rounds, allow the exhale to last slightly longer than the inhale. You might count three in and four out, but the exact numbers do not matter.

Keep the breath small and comfortable. If counting creates tension, notice the coolness of the inhale and warmth of the exhale instead.

## Use everyday cues
- Pause before opening email or joining a meeting.
- Take three calm breaths after parking.
- Use a kettle boiling or an elevator ride as a reminder.
- Pair the pause with washing your hands or sitting down to eat.

You may feel calmer, or you may simply notice how activated you are. Both are useful observations. The aim is not to erase emotion but to create a little room to respond.

## Safety
Never breathe rapidly, hold your breath for long periods or continue through dizziness, tingling, chest discomfort or panic. Return to normal breathing if you feel unwell. People with respiratory, cardiovascular or panic-related conditions should ask a qualified professional about suitable practices. This pause supports everyday awareness; it does not replace care.`,

  'hydration-everyday-habit': `## Hydration without complicated rules
Water supports normal daily function, but there is no single perfect amount for everyone. Needs vary with body size, food, activity, climate, pregnancy, illness and medication. Make water easy to access and respond to thirst rather than forcing an arbitrary target.

Keep a glass or bottle where you spend time. Drink with meals, refill before leaving home and take a few sips after activity. Fruit, vegetables, soups and yogurt also contribute fluid. If plain water feels unappealing, try it cool or room temperature, use sparkling water, or add citrus and herbs.

## Adjust to the day
Hot weather, long exercise and heavy sweating usually require more attention. Bring water before you become very thirsty and drink gradually. For ordinary short activity, water is generally the simplest choice. Very long or intense exercise may need a specific fluid and electrolyte plan.

## Make it sustainable
- Choose a bottle that is easy to clean and carry.
- Refill at predictable moments.
- Place water beside items you always take.
- Increase gradually if you currently drink little.

Urine color is only a rough clue and can be affected by food, supplements and medication.

## Safety matters
More is not always better. Drinking excessive water quickly can be dangerous. People with kidney, heart or endocrine conditions, or medicines affecting fluid balance, should follow individualized advice. Seek help for persistent extreme thirst, confusion or signs of dehydration. Everyday hydration is about steady support, not forcing large amounts.`,

  'make-more-room-for-nature': `## Nature can be close and ordinary
Meaningful outdoor time does not require a remote forest. A tree-lined street, balcony, garden, river path or patch of sky can provide a change in sensory input. People often use nature time to step away from screens, move gently and regain perspective.

Choose the easiest option: eat lunch outside, walk through a small park or sit near an open window. Spend ten minutes noticing specific details—the direction of light, wind, bird sounds, bark texture or seasonal change. This is not about forcing relaxation. Attention itself is the practice.

## Make room during a full week
- Move one phone call outdoors when privacy allows.
- Get off transport one stop earlier near a green route.
- Plan a simple weekend walk before the calendar fills.
- Keep a rain layer or comfortable shoes ready.
- Invite someone who makes the outing easier and safer.

If green space is limited, care for a plant, watch clouds or look for a route with daylight and open views.

Some people enjoy standing barefoot on grass because it feels sensory and calming. Claims that grounding cures illness are not established; treat it as personal comfort, not medical therapy.

## Safety and respect
Check weather, terrain and daylight. Use sun protection, suitable footwear and insect precautions. Avoid unknown plants, unstable water edges and isolated routes that feel unsafe. Leave habitats as you found them. Nature time should support both your wellbeing and the place you visit.`,

  'stretching-after-long-sitting': `## Movement after stillness
Long sitting can leave the body feeling stiff or sleepy. A short break changes position, moves joints through comfortable ranges and gives the eyes a reason to look beyond the screen. You do not need an intense stretching session.

## A three-minute reset
Stand beside a stable chair or desk, then:
- roll the shoulders slowly in both directions;
- reach overhead without forcing the ribs forward;
- turn the upper body gently from side to side;
- shift weight between the feet and circle each ankle;
- step one foot back for a comfortable calf stretch;
- finish with a short walk around the room.

Hold nothing to the point of strain. Smooth movement often feels better after sitting than a deep static stretch.

Two or three minutes every hour or two may be more realistic than trying to undo a desk day in one evening session. Use a meeting ending, drink refill or bathroom break as the cue. Alternate sitting, standing and walking when possible. No posture needs to be held perfectly; variety is the useful principle.

Once breaks become automatic, add a few sit-to-stands, wall push-ups or a longer lunchtime walk.

## Safety
Stretching should create mild tension, never sharp pain, numbness or tingling. Avoid bouncing and forcing joints. Recent injury, surgery, osteoporosis, balance concerns or persistent pain may require adapted professional guidance. Movement breaks can improve comfort, but they do not diagnose ongoing symptoms.`,

  'social-connection-everyday-life': `## Connection is built through attention
Social wellbeing is not measured by a full calendar. It comes from feeling seen, supported and able to offer the same to others. One honest conversation or a reliable weekly walk can matter more than many hurried interactions.

Think of one person you would genuinely like to hear from. Send a specific message: ask about something they mentioned or suggest a simple time to talk. “Would you like to walk for twenty minutes on Thursday?” is easier to answer than “We should meet.”

During conversation, place the phone aside when possible. Ask a follow-up question, allow pauses and resist planning your reply while the other person speaks.

## Create repeatable formats
- Share a regular meal without making it elaborate.
- Walk together so conversation happens side by side.
- Schedule a short weekly call with distant family.
- Join a class, volunteer group or community activity around a real interest.
- Offer practical help and allow others to help you.

People vary in social energy, culture and communication style. Meaningful relationships do not require constant contact. Digital connection can be valuable, but notice which spaces leave you nourished or depleted.

## When loneliness feels heavy
Loneliness is common and not a personal failure. Persistent isolation, grief or low mood may need more support from a counselor, community organization or healthcare professional. If a relationship is controlling or unsafe, prioritize specialist help rather than simply increasing contact. Connection should protect dignity and wellbeing.`,

  'fermented-foods-familiar-meals': `## What fermented foods are
Fermentation uses microorganisms such as bacteria or yeast to transform food. Familiar examples include yogurt, kefir, sauerkraut, kimchi and miso. Not every fermented product contains live cultures when eaten; heat treatment and processing can remove them.

People include these foods for taste, tradition and variety. Some provide protein, calcium, fiber or live cultures, depending on the product. Research on the gut microbiome is developing, but no single fermented food is a cure or a requirement for health.

## Begin with familiar meals
- Add plain yogurt and fruit to breakfast.
- Blend kefir into a smoothie.
- Serve a spoonful of sauerkraut beside lunch.
- Stir miso into soup after removing it from high heat.
- Add kimchi to rice, eggs or vegetables.

Start with a small portion and choose one product you genuinely enjoy. Look at storage directions, added sugar and salt. Pickles made only with vinegar are tasty but are not necessarily fermented.

## Comfort and food safety
Increase portions gradually; fermented foods can cause gas or bloating for some people. High-sodium products may not suit everyone. Use clean utensils, refrigerate as directed and discard products with unexpected mold, odor or damaged packaging.

Home fermentation requires reliable instructions, correct salt levels and good hygiene. People who are pregnant, immunocompromised or managing specific digestive, kidney or cardiovascular conditions should seek individualized guidance about unpasteurized foods, sodium and portions. Fermented foods can add interest to a balanced pattern, but tolerance and moderation matter.`,

  'cold-exposure-basics-beginners': `## What cold exposure means
Cold exposure is intentional, brief contact with cool air or water. It ranges from ending a normal shower with cooler water to supervised immersion. People may use it for alertness, personal challenge or recovery rituals. Dramatic claims about immunity, metabolism or disease prevention are not a reason to take risks.

## A conservative beginning
Start with an ordinary warm shower. During the final fifteen to thirty seconds, lower the temperature only until it feels clearly cool—not painfully cold. Keep breathing normally, relax your shoulders and step out whenever you choose. Repeat on another day before increasing time or lowering temperature.

If you later try immersion, use a controlled setting, know the temperature, enter gradually and have a capable person nearby. Keep your head out at first. Never compete over time.

## Practical rules
- Decide your limit before starting.
- Avoid breath-holding, rapid breathing and alcohol.
- Keep dry clothes and a warm environment ready.
- Exit if coordination, speech or thinking changes.
- Warm gradually with dry layers and gentle movement.

Cold shock can cause an involuntary gasp and rapid changes in breathing and heart rate. Open water adds currents, depth and difficult exits.

## Who should be cautious
Pregnancy, cardiovascular disease, uncontrolled blood pressure, Raynaud’s phenomenon, cold urticaria, fainting history or medicines affecting circulation can increase risk. Ask a qualified healthcare professional when unsure. Stop for chest pain, severe breathlessness, dizziness, confusion or uncontrollable shivering. Cold exposure is not medical treatment; a mild cool finish is enough if it feels good.`,

  'pets-daily-presence': `## Presence through shared routine
Animals respond to immediate signals: a leash appearing, food being prepared, a familiar voice or a patch of sunlight. Caring for a pet can invite us into the same moment. Feeding, grooming, walking and play provide clear shared activities.

Choose one daily routine and put distractions aside for five minutes. Notice the animal’s posture, energy and preferences. During a walk, let safe sniffing be part of the experience rather than treating every outing as a distance target. During play, stop before the animal becomes overtired.

This attention supports practical care: you may notice changes in appetite, movement or behavior earlier because you know what is normal.

## Build mutual wellbeing
- Keep feeding, exercise and rest reasonably predictable.
- Match activity to species, age, health and temperament.
- Offer quiet companionship as well as stimulation.
- Learn consent signals; not every pet wants constant touch.
- Share care fairly so one person does not carry everything.

Pets create joy and opportunities for movement, but also cost, cleaning, planning and grief. Do not acquire an animal solely as a wellbeing tool. Consider shelter volunteering or walking a friend’s dog first, and assess housing, allergies and long-term capacity before adoption.

## Safety and support
Supervise children and animals, wash hands after waste handling and follow veterinary guidance. Seek veterinary care for sudden changes, pain or aggression. Human-animal connection may be comforting, but it does not replace mental health support or human relationships.`,

  'colorful-bowl-everyday-vegetables': `## A formula, not a strict recipe
A vegetable bowl is a flexible way to combine color, texture and satisfying ingredients. Begin with two or three vegetables, then add protein or a hearty grain and a dressing you enjoy. The goal is a meal you want to eat, not a perfect photograph.

## Build the bowl
- Use raw, roasted, steamed or sautéed vegetables.
- Add beans, lentils, eggs, fish, chicken or tofu.
- Include rice, quinoa, potatoes, whole grains or bread as desired.
- Finish with herbs, seeds, nuts or a little cheese.
- Use olive oil and lemon, yogurt and herbs, tahini or a favorite sauce.

Contrast makes vegetables interesting: crisp cucumber with roasted carrots, warm broccoli with fresh leaves, or creamy beans with shredded cabbage.

Wash and cut sturdy vegetables when you have time, roast a tray while cooking another meal and make enough grain for two days. Store wet dressing separately from delicate greens. Frozen vegetables reduce preparation and waste; canned beans make the bowl faster.

You do not need every color at every meal. Rotate what is affordable and seasonal across the week. Leftovers and imperfect-looking produce are useful once safely prepared.

## Food safety
Wash produce, prevent cross-contamination with raw meat and refrigerate cooked ingredients promptly. Allergies, digestive conditions and kidney disease may affect suitable ingredients. Adapt the formula rather than following it rigidly. A colorful bowl supports an overall eating pattern; it is not a detox or medical treatment.`,

  'running-conversational-pace': `## What conversational pace means
A conversational run is easy enough that you can speak a complete short sentence without gasping. The pace changes with fitness, sleep, hills, heat and stress, so effort is more useful than a number on a watch. The aim is to finish with energy left.

## Start with run-walk intervals
Warm up with five to ten minutes of brisk walking. Alternate one minute of relaxed jogging with one or two minutes of walking for fifteen to twenty minutes. If speaking feels difficult, shorten the running interval or slow down.

Over several weeks, lengthen only the parts that feel comfortable. There is no need to eliminate walking.

## Make easy days easy
- Choose a flat, familiar route.
- Run with a friend who supports the relaxed pace.
- Ignore average speed and focus on even breathing.
- Shorten the session in heat or after poor sleep.
- Finish with a few minutes of walking.

Relaxed hands, shoulders away from the ears and a natural stride are enough; do not force a particular foot strike.

## Recovery and safety
Increase total running time gradually and allow recovery days. Suitable shoes, visibility and awareness of traffic matter more than fashionable equipment. Stop for sharp pain, chest pain, dizziness or unusual breathlessness. People returning after illness, pregnancy, injury or a long inactive period may benefit from professional guidance. Running is one movement option, not a requirement; walking, cycling or swimming can provide an enjoyable easy-effort session too.`,

  'create-quiet-tea-ritual': `## More than a hot drink
A tea ritual is ordinary preparation given a little attention. Boiling water, measuring leaves, noticing aroma and sitting for a few minutes can create a boundary between tasks. The value comes from the pause, not from claiming that one tea solves a health problem.

## Create a five-minute version
Choose a tea you enjoy. While water heats, clear one small space and put the phone aside. Follow package guidance for temperature and steeping time, especially for green tea. Notice color and aroma before the first sip.

Sit down if you can. Drink slowly enough to notice temperature and taste. When the cup is finished, decide what you are moving into next. This turns the ritual into a useful transition.

## Adapt it
- Use morning tea as a quiet start before messages.
- Make an afternoon cup away from the workstation.
- Share a pot and give conversation time.
- Choose caffeine-free infusions later in the day.
- Prepare a thermos when you need the pause outside home.

A mug, kettle and strainer are enough. The ritual should reduce friction, not create a shopping project.

## Tea and safety
Caffeine varies by tea and preparation, and some people are sensitive to its effects on sleep, anxiety, heart rhythm or digestion. Herbal does not automatically mean risk-free; some herbs interact with medicines or are unsuitable during pregnancy. Use reputable food products and ask a professional when unsure. Avoid liquids hot enough to burn. Enjoy tea for taste and a calm pause, not as medical treatment.`,

  'share-food-time-attention': `## The table as a place to connect
Sharing food is a simple way to create time together. The meal does not need to be impressive. Soup, bread, fruit or a familiar one-pan dish can support conversation just as well as a special menu. What matters is the invitation and attention.

Invite one or two people and be specific. Say the meal will be simple, ask about allergies and let guests contribute if they want. A shared lunch, picnic or workplace fruit break may feel easier than a formal dinner. Use store-bought items freely; hospitality is not a performance.

## Share the activity
- Chop vegetables or assemble bowls together.
- Ask someone to choose music or make tea.
- Invite children to wash produce or set safe items.
- Pack leftovers for a neighbor who needs support.
- Rotate homes or meet in a park to share effort.

Put phones aside when practical, make room for everyone to speak and avoid commenting on how much another person eats. Do not pressure anyone to try food.

Food carries culture, religion, identity and memory. Ask rather than assume. Provide ingredient information for allergies and consider seating, sensory needs, alcohol-free choices and cost.

## Keep it safe
Wash hands, keep hot food hot and cold food cold, cook animal products appropriately and refrigerate leftovers promptly. If eating with others triggers significant anxiety or disordered eating concerns, choose a lower-pressure form of connection and seek qualified support. Shared meals should create belonging, never judgment.`,

  'gentle-ten-minute-yoga-reset': `## A short reset, not a full class
Ten minutes of gentle yoga can provide a transition after sitting, before bed or at the start of a busy day. The aim is comfortable movement and steady breathing. You do not need advanced flexibility or special clothing.

Use a mat or non-slip surface with room to reach your arms. Keep a chair, wall, folded towel or blocks nearby.

## A simple sequence
1. Stand or sit and take three natural breaths.
2. Roll the shoulders and gently turn the head.
3. Fold forward with knees bent and hands supported.
4. Step one foot back into a low lunge, using support.
5. Return to sitting for a mild twist, growing tall before turning.
6. Finish lying down or seated, noticing the breath for one minute.

Spend three to five breaths in each position, or move sooner. Repeat the lunge on both sides. Nothing should require strain or breath-holding.

On a low-energy day, do the sequence seated. On a stronger day, add slow cat-cow movements. Consistency means responding honestly to the body you have today.

## Safety
Yoga should not cause sharp pain, numbness, dizziness or instability. Avoid forcing stretches or copying an image that does not suit your proportions. Pregnancy, recent surgery, glaucoma, osteoporosis, balance concerns or injury may require modifications from a qualified instructor or clinician. Yoga can support movement and awareness, but it is not a substitute for diagnosis or treatment.`,
};

articles.forEach((article) => {
  article.content = expandedArticleContent[article.slug];
  article.cover_image_url = `/images/articles/${article.slug}.jpg`;
});

const stories = [
  {
    title: 'Steady Strength, Open Trails',
    slug: 'steady-strength-open-trails',
    person_name: 'Daniel, 57',
    intro: 'Daniel rebuilt his everyday energy and mobility through repeatable routines, patient strength work and regular time outdoors with his dog.',
    image_url: '/images/stories/steady-strength-outdoor-life.jpg',
    themes: ['Strength', 'Outdoor activity', 'Sleep', 'Daily routines'],
    content: `## Where Daniel started

At 52, Daniel did not think of himself as unhealthy. He worked full days, kept up with family responsibilities and still managed the occasional weekend walk. Yet ordinary things had become less comfortable. His lower back felt stiff after driving, he avoided carrying heavy shopping bags in one trip, and his energy often disappeared by late afternoon. Most evenings ended on the sofa with a laptop still open.

The change was not prompted by a dramatic event. During a holiday hike, Daniel noticed that he was watching the ground rather than the landscape because every uneven step demanded attention. His dog, Milo, kept stopping and looking back. Daniel finished the walk, but the experience made him wonder how much of his world had quietly become smaller.

## What changed

He began with a deliberately modest plan. Three mornings each week, he walked Milo for twenty minutes before checking messages. Twice a week, he followed a basic strength routine built around squats to a chair, supported rows, light carries and push-ups against a bench. He chose weights that left him confident he could have completed another repetition.

The first month felt almost too easy. That was the point. Daniel had started ambitious plans before and abandoned them when work became busy. This time, the minimum version of every habit mattered. A ten-minute walk counted. One set of each exercise counted. Going to bed fifteen minutes earlier counted.

He also created a clearer end to his workday. His laptop stayed out of the bedroom, evening coffee became herbal tea, and he prepared his walking clothes before bed. A regular wake-up time gradually made mornings less negotiable.

## Challenges along the way

Progress was not perfectly linear. A demanding project interrupted his routine, and a sore knee made him anxious about losing momentum. Instead of pushing through, Daniel shortened his walks, used flatter routes and asked a qualified trainer to review his technique. The adjustment reminded him that consistency is not the same as stubbornness.

He stopped measuring success only by body weight or workout numbers. He noticed different evidence: getting out of the car without stiffness, carrying luggage upstairs, sleeping more predictably and feeling willing to suggest an outdoor plan at the weekend.

## How life feels today

Five years later, Daniel still trains twice most weeks and walks every day, although the distance changes. He enjoys longer hikes again and uses trekking poles on steep ground without seeing them as a concession. Milo remains his enthusiastic training partner and the reason Daniel goes outside when motivation is low.

Daniel describes the biggest improvement as capacity. He has more room in the day for work, relationships and spontaneous activity because ordinary movement costs less effort. His physique is stronger, but realistically so; his routines support his life rather than dominating it.

## What Daniel learned

- Make the useful habit small enough to repeat during a difficult week.
- Strength training can begin with supported, familiar movements.
- Sleep routines improve when the evening has a clear boundary.
- Outdoor activity is easier to sustain when it includes companionship and enjoyment.
- Pain, unusual symptoms or persistent limitations deserve appropriate professional advice rather than heroic persistence.

This is an inspirational fictionalized example based on common healthy lifestyle journeys. It is not a medical case study, and the same habits will not produce identical outcomes for everyone.`,
  },
  {
    title: 'The Consistency That Changed Everything',
    slug: 'consistency-that-changed-everything',
    person_name: 'Maya, 35',
    intro: 'Maya moved away from extreme dieting and built a calmer pattern of nourishing meals, walking, strength work, sleep and stress recovery.',
    image_url: '/images/stories/consistency-changed-everything.jpg',
    themes: ['Nutrition', 'Walking', 'Strength', 'Stress management'],
    content: `## A cycle that was no longer working

Maya entered her mid-thirties feeling tired of starting over. She had tried strict meal plans, intense exercise challenges and rules that divided food into good and bad. Each attempt created a short burst of progress, followed by exhaustion and a return to old patterns. Busy workdays made skipped lunches common, and late evenings often ended with convenience food eaten while answering messages.

She wanted to lose some excess weight, but more than that she wanted steady energy and a way of caring for herself that did not require constant willpower. Her turning point was surprisingly ordinary: she cancelled a weekend plan because she felt too depleted to enjoy it. Maya realized that a routine designed only around appearance was not improving her actual life.

## Building a steadier foundation

She began by making breakfast and lunch more predictable. Instead of chasing perfect recipes, she used a simple structure: a source of protein, vegetables or fruit, a satisfying carbohydrate and some healthy fat. She kept yogurt, oats, eggs, frozen vegetables, beans and ready-to-wash fruit available for busy days.

Walking became her main form of daily movement. Maya started with fifteen minutes after lunch, partly to create a boundary in her workday. Over several months, the walks became longer and occasionally social. She added two short strength sessions each week, learning basic movements from a qualified coach and progressing only when her technique felt secure.

Sleep was the least visible change and one of the most useful. Maya set an evening reminder to finish work, dimmed the lights and stopped treating midnight as extra productive time. She did not sleep perfectly, but a more regular rhythm reduced the powerful hunger and irritability that had made other habits harder.

## Learning to handle imperfect weeks

Travel, deadlines and family celebrations tested the new approach. In the past, one unplanned meal would have become evidence that the whole week was ruined. Maya practised returning to her next ordinary meal instead. She kept walking even when a gym session was impossible and used five quiet minutes of breathing or journaling when stress was high.

Her body composition changed gradually. Clothes fitted differently, strength improved and excess weight reduced over time, but there was no dramatic deadline. Maya tracked how she felt during afternoon meetings, how comfortably she climbed stairs and whether her routines left space for friends. Those measures helped her continue when the scale barely moved.

## How she feels now

Maya still enjoys dessert, restaurant meals and quiet days. The difference is that none of them need to be corrected with punishment. She walks because it clears her mind, trains because feeling capable is rewarding and prepares food because it makes busy days easier.

Her energy is more dependable and she feels comfortable planning active weekends. The result is not a finished transformation but a stable direction. She knows that work, sleep and appetite will fluctuate, so her routines include flexibility from the beginning.

## Practical lessons from Maya's journey

- Build meals from a simple pattern rather than a long list of forbidden foods.
- Use walking as repeatable movement, recovery and a transition between tasks.
- Strength and mobility improve through gradual practice, not punishment.
- Protect sleep and stress recovery because they influence every other choice.
- After an imperfect day, return to the next useful action without waiting for Monday.

This fictionalized inspirational story reflects a common sustainable lifestyle journey, not a guaranteed weight-loss outcome or medical recommendation. Individual needs and results vary.`,
  },
  {
    title: 'The Mountains Keep Us Moving',
    slug: 'mountains-keep-us-moving',
    person_name: 'Elena, 89',
    intro: 'For Elena, movement has never been about proving her age wrong. It is how she stays connected to the mountains, her family and everyday independence.',
    image_url: '/images/stories/mountains-keep-us-moving.jpg',
    themes: ['Healthy ageing', 'Mobility', 'Family', 'Nature'],
    content: `## A lifetime of ordinary movement

Elena is 89 and still looks forward to mountain mornings. She does not race to a summit or pretend that the trail feels the same as it did decades ago. She chooses broad, familiar paths, carries light equipment and checks the weather carefully. What has remained constant is her delight in being outside.

Movement was woven into Elena's life long before it became a wellness goal. She walked to school, tended a garden, carried groceries and spent family holidays near the mountains. In middle age she joined a community walking group, partly for exercise and mostly for conversation. The group gave the week a rhythm and turned neighbours into close friends.

## Adapting instead of stopping

As the years passed, Elena changed how she moved. She added simple strength exercises after noticing that getting up from low chairs required more effort. At home she practises controlled sit-to-stands, heel raises while holding a counter and light resistance-band rows. A physiotherapist helped her choose movements appropriate for her balance and joints.

Her mountain walks became shorter, and trekking poles became standard equipment. Elena plans rest points and is comfortable turning around early. She says that adapting a route protects the next walk; pushing to satisfy pride can take the joy out of the entire season.

Mobility practice is brief but frequent. She moves her ankles before leaving the house, reaches and rotates gently while waiting for the kettle, and keeps frequently used items where she can reach them safely. None of it looks impressive in isolation. Together, the habits support confidence in daily tasks.

## Passing the habit forward

Elena's favourite walking partners are her grandchildren. When they were young, she invented games around spotting birds, balancing on safe logs and packing their own water. Now they understand that a good outing is not measured only by distance. They wait at junctions, share snacks and let the oldest walker help choose the pace.

She also teaches them that sport includes responsibility. They prepare for weather, respect trail closures and leave natural places as they found them. The conversation matters as much as the exercise. On the path, phones disappear into backpacks and stories emerge that might not surface around a table.

## Challenges and support

Elena has experienced setbacks, including a winter when illness reduced her strength and confidence. She restarted indoors with professional guidance, family nearby and smaller goals. Social support made the return less frightening. Her walking group stayed in touch even when she could not join them, reminding her that belonging did not depend on performance.

Today, Elena schedules recovery as carefully as activity. She eats regularly, brings water, rests after longer outings and does not walk alone on remote routes. She has routine health care and treats changes in balance, pain or breathlessness as information to discuss, not obstacles to hide.

## What her example offers

- Movement accumulated over decades can be ordinary, social and enjoyable.
- Strength and balance practice should be adapted to the individual and the season of life.
- Shorter routes, poles and rest stops are tools for participation.
- Family and community connection can make activity more meaningful and sustainable.
- Positive thinking helps most when it includes realistic planning and a willingness to ask for support.

Elena's story is a fictionalized inspirational example, not a promise of exceptional longevity. Ageing experiences differ widely, and no routine guarantees the same health or independence for everyone.`,
  },
];

const comments = [
  ['short-morning-walk-start-day', 'nelina@gmail.com', 'I tried this before breakfast and enjoyed how calm the street felt.'],
  ['short-morning-walk-start-day', 'denis@gmail.com', 'Keeping the phone in my pocket made the walk feel much longer in a good way.'],
  ['build-regular-sleep-rhythm', 'john@gmail.com', 'A consistent wake-up time has been the easiest part for me to control.'],
  ['build-regular-sleep-rhythm', 'nelina@gmail.com', 'The short wind-down routine is a helpful idea.'],
  ['simple-breathing-pause-busy-moments', 'kaloianh@gmail.com', 'Clear and practical. One minute is easy to fit between meetings.'],
  ['hydration-everyday-habit', 'john@gmail.com', 'Keeping a bottle on my desk is the reminder that works best.'],
  ['hydration-everyday-habit', 'denis@gmail.com', 'I also fill mine before leaving the house so it is ready to go.'],
  ['make-more-room-for-nature', 'nelina@gmail.com', 'Lunch outside is such a simple change when the weather is good.'],
  ['make-more-room-for-nature', 'john@gmail.com', 'Noticing seasonal details makes my usual park route feel fresh.'],
  ['stretching-after-long-sitting', 'denis@gmail.com', 'The ankle movements are especially useful after a long drive.'],
  ['stretching-after-long-sitting', 'nelina@gmail.com', 'Short movement breaks feel more realistic than one long routine.'],
  ['social-connection-everyday-life', 'john@gmail.com', 'I sent a message to an old friend after reading this.'],
  ['social-connection-everyday-life', 'kaloianh@gmail.com', 'Shared walks are a great way to talk without rushing.'],
  ['fermented-foods-familiar-meals', 'denis@gmail.com', 'Plain yogurt with fruit has become an easy breakfast for me.'],
  ['cold-exposure-basics-beginners', 'john@gmail.com', 'I appreciate the cautious approach and reminder not to force it.'],
  ['pets-daily-presence', 'denis@gmail.com', 'Walking my dog is often the most mindful part of my afternoon.'],
  ['pets-daily-presence', 'kaloianh@gmail.com', 'Animals are very good at bringing attention back to the moment.'],
  ['colorful-bowl-everyday-vegetables', 'nelina@gmail.com', 'Preparing an extra portion makes the next lunch much easier.'],
  ['running-conversational-pace', 'denis@gmail.com', 'Walking breaks helped me enjoy running again instead of chasing speed.'],
  ['create-quiet-tea-ritual', 'john@gmail.com', 'This is a nice transition away from the computer in the afternoon.'],
  ['share-food-time-attention', 'nelina@gmail.com', 'Simple meals often lead to the best conversations.'],
  ['gentle-ten-minute-yoga-reset', 'john@gmail.com', 'Ten minutes feels approachable even on a busy morning.'],
  ['gentle-ten-minute-yoga-reset', 'kaloianh@gmail.com', 'Adapting the movement to the day is an important reminder.'],
];
const omittedCommentIndexes = new Set([4, 13, 14]);

function activeComments() {
  return comments
    .map((comment, index) => ({ comment, index }))
    .filter(({ index }) => !omittedCommentIndexes.has(index));
}

const assessmentResults = [
  ['john@gmail.com', 5, 7, 3, 'Moderate sitting time; regular movement breaks and social routines may support a more balanced week.'],
  ['john@gmail.com', 4, 5, 3, 'A steady week with improving activity habits and good opportunities to keep moving consistently.'],
  ['denis@gmail.com', 6, 4, 5, 'Some busy-day stress; brief breathing pauses and planned connection time may be useful.'],
  ['denis@gmail.com', 4, 3, 4, 'A fairly active period with room for a calmer evening routine and regular recovery time.'],
  ['nelina@gmail.com', 3, 5, 2, 'Strong social wellbeing with an opportunity to add more movement during desk-based days.'],
  ['nelina@gmail.com', 4, 4, 3, 'Generally balanced habits; maintaining sleep rhythm and outdoor time may help preserve momentum.'],
];

function stableUuid(value) {
  const bytes = createHash('sha256').update(`more-than-100-seed:${value}`).digest().subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function slugify(value) {
  return value.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function request(path, { method = 'GET', body, headers = {} } = {}) {
  const response = await fetch(`${supabaseUrl}${path}`, {
    method,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const responseText = await response.text();
  const responseBody = responseText ? JSON.parse(responseText) : null;

  if (!response.ok) {
    const detail = responseBody?.message || responseBody?.msg || responseBody?.error_description || responseText;
    throw new Error(`${method} ${path} failed (${response.status}): ${detail}`);
  }

  return responseBody;
}

async function authRequest(path, options) {
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      return await request(path, options);
    } catch (error) {
      const retryable = error.message.includes('unable to parse or verify signature');
      if (!retryable || attempt === 5) throw error;
      console.log(`  retrying temporary Auth API verification failure (${attempt}/5)`);
    }
  }
}

async function upsert(table, rows, conflictColumn) {
  return request(`/rest/v1/${table}?on_conflict=${encodeURIComponent(conflictColumn)}`, {
    method: 'POST',
    body: rows,
    headers: {
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
  });
}

async function listAuthUsers() {
  const users = [];
  let page = 1;

  while (true) {
    const result = await authRequest(`/auth/v1/admin/users?page=${page}&per_page=100`);
    users.push(...result.users);
    if (result.users.length < 100) return users;
    page += 1;
  }
}

async function createAuthUser(seedUser) {
  const payload = {
    email: seedUser.email,
    password: seedUser.password,
    email_confirm: true,
    user_metadata: {
      first_name: seedUser.profile.first_name,
      last_name: seedUser.profile.last_name,
    },
  };

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await authRequest('/auth/v1/admin/users', { method: 'POST', body: payload });
    } catch (error) {
      const existing = (await listAuthUsers()).find(
        (user) => user.email?.toLowerCase() === seedUser.email.toLowerCase(),
      );
      if (existing) return existing;
      if (attempt === 3) throw error;
      console.log(`  retrying a temporary Auth API failure for ${seedUser.email}`);
    }
  }
}

async function ensureAuthUsers() {
  console.log('1/8 Creating or reusing sample Auth users...');
  const existingUsers = await listAuthUsers();
  const usersByEmail = new Map(existingUsers.map((user) => [user.email.toLowerCase(), user]));
  const result = new Map();

  for (const seedUser of authUsers) {
    const email = seedUser.email.toLowerCase();
    let user = usersByEmail.get(email);

    if (!user) {
      user = await createAuthUser(seedUser);
      console.log(`  created ${email}`);
    } else {
      console.log(`  reused ${email}`);
    }

    result.set(email, { ...seedUser, id: user.id });
  }

  return result;
}

async function loadExistingSeedUsers() {
  console.log('1/6 Loading existing sample Auth users...');
  const existingUsers = await listAuthUsers();
  const usersByEmail = new Map();

  for (const seedUser of authUsers) {
    const user = existingUsers.find((candidate) => candidate.email?.toLowerCase() === seedUser.email);
    if (!user) {
      throw new Error(`Required existing Auth user not found: ${seedUser.email}. No Auth users were created.`);
    }
    usersByEmail.set(seedUser.email, { ...seedUser, id: user.id });
    console.log(`  found ${seedUser.email}`);
  }

  return usersByEmail;
}

async function seedProfilesAndRoles(usersByEmail) {
  console.log('2/8 Upserting profiles and roles...');
  const users = [...usersByEmail.values()];
  const profiles = users.map(({ id, profile }) => ({
    id,
    first_name: profile.first_name || null,
    last_name: profile.last_name || null,
    nickname: profile.nickname || null,
    bio: profile.bio || null,
    avatar_url: profile.avatar_url || null,
    website_url: profile.website_url || null,
    instagram_url: profile.instagram_url || null,
    facebook_url: profile.facebook_url || null,
  }));
  const roles = users.map(({ id, email, role }) => ({
    id: stableUuid(`role:${email}`),
    user_id: id,
    role,
  }));

  await upsert('profiles', profiles, 'id');
  await upsert('user_roles', roles, 'user_id');
  console.log(`  ${profiles.length} profiles and ${roles.length} roles ready`);
}

async function seedCategories() {
  console.log('3/8 Creating or reusing categories...');
  const existing = await request('/rest/v1/categories?select=id,name,slug,parent_id');
  const bySlug = new Map(existing.map((category) => [category.slug, category]));

  for (const name of Object.keys(categoryTree)) {
    const slug = slugify(name);
    if (!bySlug.has(slug)) {
      const [created] = await upsert('categories', [{ id: stableUuid(`category:${slug}`), name, slug }], 'slug');
      bySlug.set(slug, created);
    }
  }

  for (const [parentName, childNames] of Object.entries(categoryTree)) {
    const parent = bySlug.get(slugify(parentName));
    for (const name of childNames) {
      const slug = slugify(name);
      const payload = {
        id: bySlug.get(slug)?.id || stableUuid(`category:${slug}`),
        name,
        slug,
        parent_id: parent.id,
      };
      const [category] = await upsert('categories', [payload], 'slug');
      bySlug.set(slug, category);
    }
  }

  console.log(`  ${bySlug.size} categories and subcategories ready`);
  return bySlug;
}

async function seedArticles(usersByEmail, categoriesBySlug) {
  console.log('4/8 Upserting sample articles...');
  const existing = await request('/rest/v1/articles?select=id,slug');
  const existingBySlug = new Map(existing.map((article) => [article.slug, article]));
  const payload = articles.map((article) => ({
    id: existingBySlug.get(article.slug)?.id || stableUuid(`article:${article.slug}`),
    author_id: usersByEmail.get(article.author).id,
    category_id: categoriesBySlug.get(slugify(article.category)).id,
    title: article.title,
    slug: article.slug,
    short_description: article.short_description,
    content: article.content,
    cover_image_url: article.cover_image_url,
  }));
  const saved = await upsert('articles', payload, 'slug');
  console.log(`  ${saved.length} articles ready`);
  return new Map(saved.map((article) => [article.slug, article]));
}

async function seedStories() {
  console.log('5/8 Upserting inspirational demo stories...');
  const existing = await request('/rest/v1/stories?select=id,slug');
  const existingBySlug = new Map(existing.map((story) => [story.slug, story]));
  const payload = stories.map((story) => ({
    id: existingBySlug.get(story.slug)?.id || stableUuid(`story:${story.slug}`),
    ...story,
    is_published: true,
  }));
  const saved = await upsert('stories', payload, 'slug');
  console.log(`  ${saved.length} stories ready`);
}

async function seedComments(usersByEmail, articlesBySlug) {
  console.log('6/8 Upserting sample comments...');
  const obsoleteIds = [...omittedCommentIndexes].map((index) => {
    const [articleSlug, authorEmail] = comments[index];
    return stableUuid(`comment:${index}:${articleSlug}:${authorEmail}`);
  });
  await request(`/rest/v1/comments?id=in.(${obsoleteIds.join(',')})`, {
    method: 'DELETE',
    headers: { Prefer: 'return=minimal' },
  });

  const payload = activeComments().map(({ comment: [articleSlug, authorEmail, content], index }) => ({
    id: stableUuid(`comment:${index}:${articleSlug}:${authorEmail}`),
    article_id: articlesBySlug.get(articleSlug).id,
    author_id: usersByEmail.get(authorEmail).id,
    content,
  }));
  const saved = await upsert('comments', payload, 'id');
  console.log(`  ${saved.length} comments ready`);
}

async function seedAssessmentResults(usersByEmail) {
  console.log('7/8 Upserting sample assessment results...');
  const payload = assessmentResults.map(([email, stressScore, sedentaryScore, socialScore, summary], index) => ({
    id: stableUuid(`assessment:${index}:${email}`),
    user_id: usersByEmail.get(email).id,
    stress_score: stressScore,
    sedentary_score: sedentaryScore,
    social_score: socialScore,
    summary,
  }));
  const saved = await upsert('assessment_results', payload, 'id');
  console.log(`  ${saved.length} assessment results ready`);
}

async function verifySeed(usersByEmail) {
  console.log('8/8 Verifying seeded records...');
  const userIds = [...usersByEmail.values()].map(({ id }) => id);
  const encodedIds = encodeURIComponent(`(${userIds.join(',')})`);
  const [profiles, roles, categories, savedArticles, savedStories, savedComments, assessments] = await Promise.all([
    request(`/rest/v1/profiles?select=id&id=in.${encodedIds}`),
    request(`/rest/v1/user_roles?select=user_id,role&user_id=in.${encodedIds}`),
    request('/rest/v1/categories?select=id,slug'),
    request(`/rest/v1/articles?select=id,slug&slug=in.(${articles.map(({ slug }) => `\"${slug}\"`).join(',')})`),
    request(`/rest/v1/stories?select=id,slug,image_url&slug=in.(${stories.map(({ slug }) => `\"${slug}\"`).join(',')})`),
    request(`/rest/v1/comments?select=id&id=in.(${activeComments().map(({ comment: entry, index }) => stableUuid(`comment:${index}:${entry[0]}:${entry[1]}`)).join(',')})`),
    request(`/rest/v1/assessment_results?select=id&id=in.(${assessmentResults.map((entry, index) => stableUuid(`assessment:${index}:${entry[0]}`)).join(',')})`),
  ]);

  const expectedCategoryCount = Object.keys(categoryTree).length + Object.values(categoryTree).flat().length;
  const admin = usersByEmail.get('kaloianh@gmail.com');
  const adminRole = roles.find((role) => role.user_id === admin.id)?.role;
  const checks = {
    profiles: [profiles.length, authUsers.length],
    roles: [roles.length, authUsers.length],
    categories: [categories.filter(({ slug }) => Object.keys(categoryTree).some((name) => slug === slugify(name)) || Object.values(categoryTree).flat().some((name) => slug === slugify(name))).length, expectedCategoryCount],
    articles: [savedArticles.length, articles.length],
    stories: [savedStories.length, stories.length],
    comments: [savedComments.length, activeComments().length],
    assessments: [assessments.length, assessmentResults.length],
  };

  for (const [label, [actual, expected]] of Object.entries(checks)) {
    if (actual !== expected) throw new Error(`Verification failed for ${label}: expected ${expected}, found ${actual}`);
  }
  if (adminRole !== 'admin') throw new Error('Verification failed: the admin sample user does not have the admin role.');

  console.log('  verification passed');
  console.table(Object.fromEntries(Object.entries(checks).map(([label, [count]]) => [label, { count }])));
}

async function verifyUsers(usersByEmail) {
  console.log('3/3 Verifying Auth users, profiles and roles...');
  const allAuthUsers = await listAuthUsers();
  const userIds = [...usersByEmail.values()].map(({ id }) => id);
  const encodedIds = encodeURIComponent(`(${userIds.join(',')})`);
  const [profiles, roles] = await Promise.all([
    request(`/rest/v1/profiles?select=id&id=in.${encodedIds}`),
    request(`/rest/v1/user_roles?select=user_id,role&user_id=in.${encodedIds}`),
  ]);

  for (const [email, expected] of usersByEmail) {
    const matchingAuthUsers = allAuthUsers.filter((user) => user.email?.toLowerCase() === email);
    const matchingProfiles = profiles.filter((profile) => profile.id === expected.id);
    const matchingRoles = roles.filter((role) => role.user_id === expected.id);

    if (matchingAuthUsers.length !== 1) {
      throw new Error(`Verification failed for ${email}: expected one Auth user, found ${matchingAuthUsers.length}.`);
    }
    if (matchingProfiles.length !== 1) {
      throw new Error(`Verification failed for ${email}: expected one profile, found ${matchingProfiles.length}.`);
    }
    if (matchingRoles.length !== 1 || matchingRoles[0].role !== expected.role) {
      throw new Error(`Verification failed for ${email}: expected exactly one ${expected.role} role.`);
    }
  }

  console.log('  all four users have exactly one Auth account, profile and correct role');
}

async function main() {
  console.log('Seeding More Than 100 sample data...');
  const usersByEmail = contentOnly ? await loadExistingSeedUsers() : await ensureAuthUsers();
  if (!contentOnly) await seedProfilesAndRoles(usersByEmail);
  if (usersOnly) {
    await verifyUsers(usersByEmail);
    console.log('Sample user seed completed successfully.');
    return;
  }
  const categoriesBySlug = await seedCategories();
  const articlesBySlug = await seedArticles(usersByEmail, categoriesBySlug);
  await seedStories();
  await seedComments(usersByEmail, articlesBySlug);
  await seedAssessmentResults(usersByEmail);
  await verifySeed(usersByEmail);
  console.log('Seed completed successfully. It is safe to rerun this script.');
}

function validateSeedDefinition() {
  const expectedCategoryCount = Object.keys(categoryTree).length + Object.values(categoryTree).flat().length;
  const categoryNames = new Set([...Object.keys(categoryTree), ...Object.values(categoryTree).flat()]);
  const userEmails = new Set(authUsers.map(({ email }) => email));
  const uniqueArticleSlugs = new Set(articles.map(({ slug }) => slug));
  const uniqueStorySlugs = new Set(stories.map(({ slug }) => slug));
  const uniqueNicknames = new Set(authUsers.map(({ profile }) => profile.nickname));

  const checks = [
    [authUsers.length === 4, 'exactly four Auth users'],
    [userEmails.size === authUsers.length, 'unique Auth user emails'],
    [uniqueNicknames.size === authUsers.length, 'unique profile nicknames'],
    [expectedCategoryCount === 41, 'six main categories and 35 subcategories'],
    [articles.length === 15 && uniqueArticleSlugs.size === articles.length, '15 uniquely slugged articles'],
    [articles.every(({ author, category }) => userEmails.has(author) && categoryNames.has(category)), 'valid article references'],
    [articles.every(({ content }) => content.trim().split(/\s+/).length >= 180), 'expanded article content'],
    [articles.every(({ cover_image_url: coverImageUrl }) => /^\/images\/articles\/[a-z0-9-]+\.jpg$/.test(coverImageUrl)), 'stable local article cover images'],
    [stories.length === 3 && uniqueStorySlugs.size === stories.length, 'exactly three uniquely slugged stories'],
    [stories.every(({ content }) => { const count = content.trim().split(/\s+/).length; return count >= 500 && count <= 900; }), 'story content is 500-900 words'],
    [stories.every(({ image_url: imageUrl }) => /^\/images\/stories\/[a-z0-9-]+\.jpg$/.test(imageUrl)), 'stable local story cover images'],
    [activeComments().length >= 20 && activeComments().length <= 25, '20-25 comments'],
    [activeComments().every(({ comment: [slug, email] }) => uniqueArticleSlugs.has(slug) && userEmails.has(email)), 'valid comment references'],
    [assessmentResults.every(([email]) => email !== 'kaloianh@gmail.com' && userEmails.has(email)), 'normal-user assessment results only'],
  ];
  const failed = checks.filter(([passed]) => !passed).map(([, label]) => label);
  if (failed.length) throw new Error(`Seed definition validation failed: ${failed.join(', ')}`);
  console.log('Seed definition is valid.');
  for (const [, label] of checks) console.log(`  ok: ${label}`);
}

const operation = validationOnly ? Promise.resolve().then(validateSeedDefinition) : main();

operation.catch((error) => {
  console.error(`Seed failed: ${error.message}`);
  process.exitCode = 1;
});
