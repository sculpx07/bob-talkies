export interface OccasionData {
  slug: string
  label: string
  emoji: string
  heading: string
  subheading: string
  description: string
  heroImage: string
  features: string[]
  recommendedTheatres: string[]
  faqs: Array<{ question: string; answer: string }>
}

const BASE_OCCASIONS: OccasionData[] = [
  {
    slug: 'birthday',
    label: 'Birthday',
    emoji: '🎂',
    heading: 'Make Their Birthday Unforgettable',
    subheading: 'A cinematic birthday celebration they\'ll talk about for years.',
    description: 'Transform an ordinary birthday into an extraordinary memory. At BOB Talkies, we create personalised birthday experiences with stunning decoration, surprise setups, custom cakes and big-screen moments — all in a completely private theatre just for your group.',
    heroImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200',
    features: ['Fully decorated private theatre just for your group', 'Custom birthday backdrop and balloon setup', 'Birthday cake arrangement available', 'Stream any movie or personal videos on the big screen'],
    recommendedTheatres: ['th-delight', 'th-heavens', 'th-filmdom'],
    faqs: [
      { question: 'Can I bring my own cake?', answer: 'Yes, you can bring an external cake. We also offer customised cakes as an add-on.' },
      { question: 'Is there a minimum group size?', answer: 'Our smallest theatre starts from 2 guests, so even an intimate birthday for two is perfect.' },
    ],
  },
  {
    slug: 'anniversary',
    label: 'Anniversary',
    emoji: '💑',
    heading: 'Celebrate Your Love Story',
    subheading: 'An intimate anniversary in your own private cinema.',
    description: 'Your anniversary deserves more than a restaurant dinner. Create a cinematic love story at BOB Talkies — from rose petal trails and champagne service to a custom message on the big screen. Our intimate theatres are designed for couples who want something truly special.',
    heroImage: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=1200',
    features: ['Romantic couple-themed decoration with rose petals', 'Custom anniversary message on the big screen', 'Champagne and cake arrangement available', 'Private theatre exclusively for the two of you'],
    recommendedTheatres: ['th-delight', 'th-heavens'],
    faqs: [
      { question: 'Can you help plan a surprise for my partner?', answer: 'Absolutely! Tell us your plan when booking and our team will coordinate the surprise setup.' },
      { question: 'Do you offer couple decorations?', answer: 'Yes, our Gold and Diamond packages include romantic couple-themed decoration.' },
    ],
  },
  {
    slug: 'date-night',
    label: 'Date Night',
    emoji: '🌹',
    heading: 'The Most Romantic Date in Hyderabad',
    subheading: 'Your own private cinema — no crowds, no strangers.',
    description: 'Imagine watching your favourite film together on a 120" screen, with premium sound, comfortable recliners and no one else in the room. At BOB Talkies, every date night becomes a story worth telling. Add a cake, flowers and champagne to make it truly magical.',
    heroImage: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=1200',
    features: ['Completely private — just the two of you', 'Stream any content via Netflix, Prime, Hotstar', 'Premium recliner seats and Dolby Atmos sound', 'Add-ons: flowers, cake, chocolate platter'],
    recommendedTheatres: ['th-delight'],
    faqs: [
      { question: 'Can I choose the movie we watch?', answer: 'Yes! You can connect your Netflix, Prime, Hotstar or any streaming account via HDMI.' },
      { question: 'Is it really private?', answer: 'Yes, the entire theatre is exclusively yours for the duration of your slot.' },
    ],
  },
  {
    slug: 'proposal',
    label: 'Proposal',
    emoji: '💍',
    heading: 'Pop the Question in Style',
    subheading: 'The most cinematic proposal story she\'ll ever tell.',
    description: 'The most important question of your life deserves the most magical setting. BOB Talkies creates unforgettable proposal moments — with custom messages on screen, rose setups, cold fire effects and photographers to capture every emotion. She\'ll say yes before you even finish the question.',
    heroImage: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=1200',
    features: ['Custom proposal message on the big screen', 'Rose petal aisle and romantic lighting setup', 'Professional photography add-on available', 'Cold fire and confetti effects on request'],
    recommendedTheatres: ['th-delight', 'th-heavens'],
    faqs: [
      { question: 'Can I keep it a surprise?', answer: 'Yes! Just book and share your plan with us. We\'ll set up everything before she arrives.' },
      { question: 'Do you have a photographer?', answer: 'Yes, our photography add-on covers the full proposal moment and beyond.' },
    ],
  },
  {
    slug: 'family',
    label: 'Family',
    emoji: '👨‍👩‍👧‍👦',
    heading: 'Family Time, Bigger Than Ever',
    subheading: 'The whole family, one amazing private cinema.',
    description: 'Create memories with the people who matter most. Whether it\'s a movie marathon, a family birthday or a festival celebration, BOB Talkies gives your family a completely private space to bond, laugh and celebrate together.',
    heroImage: 'https://images.unsplash.com/photo-1536640712-4d4c36ff0e4e?w=1200',
    features: ['Theatres from 2 to 40 guests for any family size', 'Stream any content — movies, family videos, events', 'Child-friendly and family-safe environment', 'Fully private — no other guests to disturb you'],
    recommendedTheatres: ['th-filmdom', 'th-cosmos', 'th-vibe-hall'],
    faqs: [
      { question: 'Is it suitable for children?', answer: 'Absolutely! Our theatres are family-friendly and child-safe.' },
    ],
  },
  {
    slug: 'friends',
    label: 'Friends',
    emoji: '🥳',
    heading: 'Squad Goals: Private Theatre Edition',
    subheading: 'The ultimate hangout — your own cinema, your rules.',
    description: 'No cinema crowds, no strangers and no one judging your snack choices. Book a private theatre for your squad and experience movies, sports, gaming and celebrations the way they\'re meant to be — together, loud and completely in your own world.',
    heroImage: 'https://images.unsplash.com/photo-1529543544282-ea669407fca3?w=1200',
    features: ['Your crew, your rules — full privacy guaranteed', 'Movies, sports, gaming — all on the big screen', 'No outside noise, no strangers', 'Group add-ons: cake, snack platters, photo props'],
    recommendedTheatres: ['th-heavens', 'th-filmdom', 'th-cosmos'],
    faqs: [
      { question: 'Can we connect a gaming console?', answer: 'Yes! You can connect a PlayStation or Xbox via HDMI for a massive gaming experience.' },
    ],
  },
  {
    slug: 'sports-screening',
    label: 'Sports Screening',
    emoji: '⚽',
    heading: 'Watch the Match Like Never Before',
    subheading: 'The biggest screen, the loudest sound, your own crowd.',
    description: 'Watch the match on a screen up to 250 inches with Dolby Atmos sound — exclusively with your crew. No bar noise, no strangers and no fighting over the remote. At BOB Talkies, every goal feels like you\'re in the stadium.',
    heroImage: 'https://images.unsplash.com/photo-1540552566206-50282a66a7f7?w=1200',
    features: ['Up to 250" screen with stadium-level sound', 'Stream live matches via Hotstar, SonyLiv or JioCinema', 'No rowdy strangers — just your crowd', 'Food platters and snack add-ons available'],
    recommendedTheatres: ['th-filmdom', 'th-cosmos', 'th-vibe-hall'],
    faqs: [
      { question: 'Can you stream live sports?', answer: 'Yes! Connect your Hotstar, SonyLiv or any streaming app. We provide HDMI and streaming support.' },
    ],
  },
  {
    slug: 'corporate',
    label: 'Corporate',
    emoji: '💼',
    heading: 'Corporate Events Done Differently',
    subheading: 'Team celebrations, screenings and offsites at BOB Talkies.',
    description: 'Reward your team with a celebration worth remembering. BOB Talkies is perfect for team offsites, award nights, product launches and corporate screenings — with full AV setup, catering and professional photography.',
    heroImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
    features: ['Large theatres for 8–40 team members', 'Full AV setup for presentations and screenings', 'GST invoices for corporate bookings', 'Catering and award ceremony setups available'],
    recommendedTheatres: ['th-cosmos', 'th-vibe-hall'],
    faqs: [
      { question: 'Do you provide invoices for corporate bookings?', answer: 'Yes, GST invoices are provided for all corporate bookings.' },
      { question: 'Can you accommodate presentations?', answer: 'Yes! You can connect your laptop via HDMI for presentations on our massive screens.' },
    ],
  },
]

const base = (slug: string) => BASE_OCCASIONS.find((o) => o.slug === slug)!

/** Builds a page entry for an event type. Copy stays general: no prices or specs are promised. */
function event(
  slug: string, label: string, emoji: string, heading: string, subheading: string,
  description: string, like: string, features: string[], recommendedTheatres: string[],
): OccasionData {
  return {
    slug, label, emoji, heading, subheading, description,
    heroImage: base(like).heroImage,
    features, recommendedTheatres,
    faqs: [
      { question: `How do I book a private theatre for ${label.toLowerCase()}?`, answer: 'Choose your occasion, guest count and date, pick a theatre and time slot, then select a package and add-ons and pay online.' },
      { question: 'Can I customise the setup?', answer: 'Yes. Decoration, cake, photography, food and other add-ons can be selected while booking, subject to availability.' },
    ],
  }
}

const ALL = ['th-delight', 'th-heavens', 'th-filmdom', 'th-cosmos', 'th-vibe-hall']

/** The BOB Talkies event list, in display order. */
export const OCCASIONS: OccasionData[] = [
  { ...base('birthday'), label: 'Birthday Parties' },
  { ...base('sports-screening'), label: 'Sports Nights' },
  event('movie-premieres', 'Movie Premieres', '🎬', 'Premiere Night, Your Way', 'Roll out the red carpet in your own private cinema.',
    'Host a premiere screening for your crowd on a big screen with theatre-grade sound, completely private to your group.', 'friends',
    ['Fully private screening for your guests', 'Big screen and theatre sound', 'Group decoration add-ons'], ['th-filmdom', 'th-cosmos', 'th-vibe-hall']),
  event('fan-screenings', 'Fan Screenings', '⭐', 'Fan Screenings, Fan Energy', 'Watch the first-day show with fellow fans.',
    'Gather your fan club for a first-day or favourite-film screening where the cheering is welcome.', 'friends',
    ['A private room for your fan group', 'Big screen and sound', 'Group setup and add-ons'], ['th-filmdom', 'th-cosmos', 'th-vibe-hall']),
  event('teaser-launches', 'Teaser Launches', '🎞️', 'Launch It on the Big Screen', 'Teasers and trailers deserve a theatre.',
    'Unveil a teaser, trailer or short film to your team and guests on a real cinema screen.', 'corporate',
    ['Private screening space', 'Big screen playback', 'Room for guests and press'], ['th-cosmos', 'th-vibe-hall']),
  event('movie-marathons', 'Movie Marathons', '🍿', 'Back-to-Back, All Yours', 'One film is never enough.',
    'Line up your favourite films and watch them back to back in comfortable seating with no strangers around.', 'friends',
    ['Private theatre for your whole group', 'Choose what you watch', 'Food add-ons available'], ['th-heavens', 'th-filmdom', 'th-cosmos']),
  { ...base('family'), label: 'Family Movie Nights' },
  event('gaming-nights', 'Gaming Nights', '🎮', 'Game on the Big Screen', 'Your console, a cinema-size screen.',
    'Bring your friends for a gaming session on a big screen with cinema sound.', 'friends',
    ['Big screen gaming', 'Private space for your group', 'Snack add-ons available'], ['th-heavens', 'th-filmdom', 'th-cosmos']),
  event('karaoke-nights', 'Karaoke Nights', '🎤', 'Sing It Loud', 'Friends and family, one mic.',
    'Turn the theatre into your own karaoke room with the big screen and sound system.', 'friends',
    ['Private room to sing freely', 'Big screen lyrics and sound', 'Food add-ons available'], ['th-heavens', 'th-filmdom', 'th-cosmos', 'th-vibe-hall']),
  { ...base('date-night'), label: 'Date Nights' },
  { ...base('proposal'), label: 'Proposal Moments' },
  { ...base('friends'), label: "Friends' Reunions" },
  { ...base('corporate'), label: 'Corporate Events' },
  event('private-screenings', 'Private Screenings', '🎟️', 'Your Screening, Your Guest List', 'A film, a room, and only your people.',
    'Book a theatre exclusively for your group and watch what you like.', 'family',
    ['Exclusive use of the theatre', 'Choose your own content', 'Decoration and food add-ons'], ALL),
  event('music-experiences', 'Music Experiences', '🎵', 'Music, Sound and Screen', 'Concerts and playlists in cinema sound.',
    'Enjoy concert films, live performances or your own playlist with theatre-grade sound.', 'friends',
    ['Cinema sound for music', 'Private group space', 'Add-ons available'], ['th-heavens', 'th-filmdom', 'th-cosmos', 'th-vibe-hall']),
  event('grand-gatherings', 'Grand Gatherings', '🥂', 'Gather Everyone', 'For the biggest guest lists.',
    'Bring a large group together for a celebration or event in our largest space.', 'family',
    ['Space for large groups', 'Big screen and sound', 'Catering and decoration add-ons'], ['th-cosmos', 'th-vibe-hall']),
  event('vibe-hall-events', 'Vibe Hall Events', '🏛️', 'Events at Vibe Hall', 'Large celebrations, screenings, seminars and private events.',
    'Vibe Hall is our largest space for big celebrations, sports screenings, seminars and private events.', 'corporate',
    ['Our largest space', 'Large celebrations and sports screenings', 'Seminars and private events'], ['th-vibe-hall']),
]

export function getOccasionBySlug(slug: string): OccasionData | undefined {
  return OCCASIONS.find((o) => o.slug === slug)
}
