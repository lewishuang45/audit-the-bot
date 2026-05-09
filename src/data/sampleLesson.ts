import type { IssueCategory, KnownIssue, MemoStatement } from "../lib/types";

export const issueCategories: IssueCategory[] = [
  "factual error",
  "unsupported claim",
  "budget mismatch",
  "target market mismatch",
  "distribution mismatch",
  "vague recommendation",
  "ethical or tone risk",
  "weak evidence",
  "missing evidence",
  "logical weakness",
  "contradiction with brief",
];

export const sampleBusinessBrief = {
  title: "CampusTea Spark Launch",
  company: "BrightBrew",
  sessionCode: "BTB-7041",
  context:
    "BrightBrew, a Hong Kong beverage startup, plans to launch CampusTea Spark, a lightly carbonated jasmine tea with fruit flavoring. The company wants to test the product with university students before expanding to convenience stores.",
  targetCustomer:
    "University students aged 18-24 in Hong Kong who buy drinks between classes, during study sessions, or on the way to campus activities.",
  productOptions: [
    "Lychee Jasmine Spark",
    "Peach Oolong Spark",
    "Yuzu Green Tea Spark",
  ],
  budget:
    "HKD 80,000 for the first month, covering sampling, student ambassador incentives, social media content, and basic point-of-sale materials.",
  researchFindings: [
    "64% would try a low-sugar sparkling tea if priced below HKD 18.",
    "58% said taste is more important than health claims.",
    "47% discover new drinks through friends or campus events.",
    "36% are influenced by short-form social media videos.",
    "Only 18% regularly buy drinks online for campus delivery.",
    "Yuzu Green Tea scored highest on refreshment; Lychee Jasmine scored highest on uniqueness.",
  ],
  competitorContext: [
    "Bottled tea brands sell at HKD 10-16 in convenience stores.",
    "Bubble tea chains sell at HKD 24-38 and compete on customization and indulgence.",
    "Energy drinks sell at HKD 14-22 and compete on functional benefits.",
  ],
  distribution:
    "For month one, BrightBrew can distribute only through campus pop-up booths and two independent cafes near HKU and CUHK. It does not yet have convenience store access.",
  brand:
    "BrightBrew wants a credible, student-friendly tone and must not make medical or guaranteed performance claims.",
  task:
    "Recommend one launch focus and three concrete first-month actions. Respect budget, target students, available distribution, and research findings.",
};

export const flawedAiMemoStatements: MemoStatement[] = [
  {
    id: "s1",
    text: "BrightBrew should launch Lychee Jasmine Spark as a premium wellness drink for all young professionals in Hong Kong.",
  },
  {
    id: "s2",
    text: "Since 64% of surveyed students said they would buy the drink, the company can expect strong first-month sales if it moves quickly into convenience stores and food delivery platforms.",
  },
  {
    id: "s3",
    text: "The best strategy is to position CampusTea Spark as a productivity booster that helps students stay focused during exams.",
  },
  {
    id: "s4",
    text: "The product should be priced at HKD 24 to signal quality and compete directly with bubble tea.",
  },
  {
    id: "s5",
    text: "BrightBrew should spend most of the HKD 80,000 budget on paid influencer campaigns with citywide lifestyle creators because social media is clearly the strongest discovery channel.",
  },
  {
    id: "s6",
    text: "For launch actions, BrightBrew should first partner with major convenience store chains to secure shelf placement across Hong Kong.",
  },
  {
    id: "s7",
    text: 'Second, it should run a two-week "Drink Better, Study Better" campaign promising that the tea helps students concentrate.',
  },
  {
    id: "s8",
    text: "Third, it should offer free delivery bundles through online platforms so students can order cases to campus.",
  },
  {
    id: "s9",
    text: "This plan is low risk because Hong Kong students are already moving away from sugary drinks, and Lychee Jasmine's unique flavor will guarantee word-of-mouth growth.",
  },
  {
    id: "s10",
    text: "The company should not focus on campus booths because booths are slow and old-fashioned compared with digital marketing.",
  },
];

export const hiddenAnswerKey: KnownIssue[] = [
  {
    id: "K1",
    statementId: "s1",
    category: "target market mismatch",
    expectedFinding:
      "The brief targets university students aged 18-24, not all young professionals.",
  },
  {
    id: "K2",
    statementId: "s2",
    category: "factual error",
    expectedFinding:
      "The survey says 64% would try it if priced below HKD 18, not definitely buy it.",
  },
  {
    id: "K3",
    statementId: "s2",
    category: "distribution mismatch",
    expectedFinding:
      "The company does not yet have convenience store access.",
  },
  {
    id: "K4",
    statementId: "s3",
    category: "ethical or tone risk",
    expectedFinding:
      "The brand constraint forbids medical or guaranteed performance claims.",
  },
  {
    id: "K5",
    statementId: "s4",
    category: "budget mismatch",
    expectedFinding:
      "The HKD 24 price conflicts with the below-HKD 18 trial threshold and bottled-tea competitor range.",
  },
  {
    id: "K6",
    statementId: "s5",
    category: "factual error",
    expectedFinding:
      "Friends and campus events are 47%; short-form social media is 36%.",
  },
  {
    id: "K7",
    statementId: "s5",
    category: "unsupported claim",
    expectedFinding:
      "The brief supports campus and event discovery more strongly than broad citywide influencer spending.",
  },
  {
    id: "K8",
    statementId: "s6",
    category: "distribution mismatch",
    expectedFinding:
      "Convenience store access is unavailable in month one.",
  },
  {
    id: "K9",
    statementId: "s7",
    category: "ethical or tone risk",
    expectedFinding:
      "The campaign makes an unsupported performance claim about concentration.",
  },
  {
    id: "K10",
    statementId: "s8",
    category: "weak evidence",
    expectedFinding:
      "Only 18% regularly buy drinks online for campus delivery.",
  },
  {
    id: "K11",
    statementId: "s9",
    category: "unsupported claim",
    expectedFinding:
      "The brief does not justify guaranteed growth or a low-risk claim.",
  },
  {
    id: "K12",
    statementId: "s10",
    category: "contradiction with brief",
    expectedFinding:
      "Campus pop-up booths are one of the available first-month channels.",
  },
];

export const sampleRevisionPrompt =
  "Rewrite the launch memo using only the facts in the business brief. Fix the unsupported claims and remove any performance or medical promises. The recommendation should target Hong Kong university students aged 18-24, respect the HKD 80,000 first-month budget, and use only campus pop-up booths plus the two cafes near HKU and CUHK as distribution channels. Recommend one launch flavor and three concrete first-month actions. Keep the price below HKD 18 because the survey says 64% would try the drink only under that threshold. Explain tradeoffs between Yuzu Green Tea and Lychee Jasmine using the taste-test results. Use a credible student-friendly tone and avoid claiming guaranteed sales or guaranteed concentration benefits.";

export const sampleRevisedMemo =
  "BrightBrew should launch Yuzu Green Tea Spark as the first-month focus for Hong Kong university students. The strongest reason is that Yuzu Green Tea scored highest on refreshment in the blind taste test, and the product is meant to be consumed between classes, during study breaks, or around campus activities. Lychee Jasmine is distinctive, but uniqueness alone is less directly connected to repeat trial than refreshment for an everyday campus drink.\n\nThe product should be priced at HKD 16-18 to fit the survey finding that 64% of students would try a low-sugar sparkling tea below HKD 18. The launch should avoid medical or performance claims. Instead of promising better concentration, BrightBrew should use a credible message such as \"light, sparkling tea for study breaks.\"\n\nFirst, BrightBrew should run sampling booths at selected campus locations during lunch and late-afternoon periods, when students are likely to buy drinks between classes. Second, it should recruit student ambassadors to bring small tasting groups to the booths and cafes, because 47% of surveyed students discover new drinks through friends or campus events. Third, it should create short-form videos around taste reactions and campus moments, but keep social spending focused because only 36% cited short-form videos as a discovery source.\n\nThis plan fits the first-month distribution limits because it uses campus pop-up booths and the two independent cafes near HKU and CUHK rather than assuming convenience store access. It also keeps the campaign within the brand's student-friendly tone and avoids unsupported claims about guaranteed sales or academic performance.";

export const sampleFinalMemo =
  "BrightBrew should launch Yuzu Green Tea Spark first, priced at HKD 16-18, and position it as a refreshing low-sugar sparkling tea for campus breaks. This choice is better supported than Lychee Jasmine because Yuzu Green Tea scored highest on refreshment, which fits the target use case of students buying drinks between classes or during study sessions. Lychee Jasmine's uniqueness is useful for future rotation, but the first launch should prioritize broad trial and repeatability.\n\nFirst, run campus pop-up sampling during lunch and late-afternoon periods at locations near high student traffic. Second, use student ambassadors to invite friend groups to tasting sessions and collect quick flavor feedback. Third, create short-form campus videos showing taste reactions and booth moments, with limited paid boosting rather than a citywide influencer campaign.\n\nThis plan respects the HKD 80,000 budget by focusing on sampling, ambassadors, and targeted content instead of broad influencer spending. It also follows the available distribution channels: campus booths and two independent cafes near HKU and CUHK. The message should avoid claims about concentration or productivity and instead use a credible line such as \"light sparkling tea for study breaks.\"";

export const rubricAnchors = [
  {
    key: "verifyAccuracy",
    label: "Verify Accuracy",
    max: 3,
    anchors: [
      "0: Does not identify meaningful problems.",
      "1: Identifies one or two obvious problems.",
      "2: Identifies several important problems.",
      "3: Identifies most major factual, evidence, constraint, and tone risks.",
    ],
  },
  {
    key: "modificationQuality",
    label: "Modification Quality",
    max: 3,
    anchors: [
      "0: Final memo is unclear or repeats major AI errors.",
      "1: Better wording, but still weakly aligned.",
      "2: Mostly clear, relevant, and concrete.",
      "3: Clear, evidence-based, feasible, and tied to the brief.",
    ],
  },
  {
    key: "guidanceEffectiveness",
    label: "Guidance Effectiveness",
    max: 2,
    anchors: [
      "0: Prompt is vague or generic.",
      "1: Prompt names some constraints or problems.",
      "2: Prompt names flaws, constraints, structure, evidence, and tone.",
    ],
  },
  {
    key: "argumentationQuality",
    label: "Quality of Argumentation",
    max: 2,
    anchors: [
      "0: Does not explain accept/revise/reject decisions.",
      "1: Some explanation, but thin or disconnected.",
      "2: Clear explanation using case facts and constraints.",
    ],
  },
] as const;

export const instructorNotes = [
  "This pack is original demo content for public review and classroom pilots.",
  "The hidden answer key is intended for instructor review, rubric calibration, and automated progress summaries.",
  "Students should not be graded only on the final memo. The audit notes, targeted prompt, comparison, and rationale reveal whether they can inspect, challenge, and steer AI output.",
  "Live LLM execution is intentionally disabled in the MVP; the revised memo is deterministic so pilots can compare student reasoning consistently.",
  "For classroom use, replace participant names with pseudonyms before exporting or sharing results.",
];

export const sampleLesson = {
  businessBrief: sampleBusinessBrief,
  flawedAiMemo: flawedAiMemoStatements.map((statement) => statement.text).join("\n\n"),
  flawedAiMemoStatements,
  hiddenAnswerKey,
  issueCategories,
  rubricAnchors,
  sampleRevisionPrompt,
  sampleRevisedMemo,
  sampleFinalMemo,
  instructorNotes,
};
