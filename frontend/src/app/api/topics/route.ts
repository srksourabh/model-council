export const dynamic = "force-dynamic";

const TOPICS_POOL = [
  // India
  "Should India ban single-use plastics nationwide by 2027?",
  "Is UPI making India a global leader in digital payments?",
  "Should Indian cities prioritize metro rail over road expansion?",
  "Will India overtake China as the world's manufacturing hub?",
  "Should India adopt a uniform civil code?",
  "Is the Indian education system preparing students for AI-era jobs?",
  "Should India invest more in semiconductor fabs or software?",
  "Is India's startup ecosystem in a healthy correction or a crisis?",
  "Should Indian farmers switch to organic farming at scale?",
  "Will India's renewable energy targets be met by 2030?",
  "Should India allow private players in space launches?",
  "Is Hindi imposition hurting national unity?",
  "Should Indian cities implement congestion pricing?",
  "Is India's healthcare system ready for the next pandemic?",
  "Should India raise the minimum marriage age to 21 for all?",

  // Global — Tech & AI
  "Should AI-generated content be legally required to carry labels?",
  "Will AI replace 50% of white-collar jobs by 2035?",
  "Should social media platforms pay news publishers for content?",
  "Is open-source AI safer than closed-source AI?",
  "Should governments ban facial recognition in public spaces?",
  "Will quantum computing break current encryption within 10 years?",
  "Should there be a global AI safety treaty?",
  "Is TikTok a national security threat or just a social app?",
  "Should tech companies be broken up for being too powerful?",
  "Will self-driving cars be mainstream by 2030?",

  // Global — Economy & Politics
  "Is universal basic income the answer to automation job losses?",
  "Should the US dollar remain the world's reserve currency?",
  "Will remote work permanently reshape cities and real estate?",
  "Should billionaires be taxed on unrealized capital gains?",
  "Is deglobalization the new normal?",
  "Should countries adopt a four-day work week?",
  "Is cryptocurrency a bubble or the future of finance?",
  "Should voting be mandatory in democracies?",
  "Will the BRICS currency challenge the US dollar?",
  "Is nuclear energy essential for combating climate change?",

  // Global — Society & Culture
  "Should college education be free for everyone?",
  "Is social media doing more harm than good to democracy?",
  "Should the legal drinking age be lowered to 18 worldwide?",
  "Is cancel culture protecting the vulnerable or silencing dissent?",
  "Should athletes be allowed to use performance-enhancing AI coaching?",
  "Is the metaverse dead or just getting started?",
  "Should parents be held legally responsible for children's online activity?",
  "Will lab-grown meat replace traditional farming?",
  "Should space colonization be a priority for humanity?",
  "Is the global birth rate decline a crisis or a correction?",
];

export async function GET() {
  // Shuffle and pick 5 random topics
  const shuffled = [...TOPICS_POOL].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 5);
  return Response.json({ topics: selected });
}
