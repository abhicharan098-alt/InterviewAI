/**
 * ReadinessEngine — Deterministic readiness score calculator.
 * NO OpenRouter calls. All calculations are pure math + lookup tables.
 *
 * Formula:
 *   baseScore = 0.30×technical + 0.25×communication + 0.20×confidence + 0.15×relevance + 0.10×clarity
 *   Recency bias: last 3 interviews = 70% weight, older = 30%
 *   Role alignment bonus: +5 if recent interviews match targetRole (capped at 100)
 */

export interface ReportSnapshot {
  technicalScore: number;
  communicationScore: number;
  confidenceScore: number;
  relevanceScore: number;
  clarityScore: number;
  overallScore: number;
  strengths?: string[] | null;
  weaknesses?: string[] | null;
  role?: string; // interview role
}

export interface ReadinessResult {
  score: number; // 0–100
  label: ReadinessLabel;
  technicalAvg: number;
  communicationAvg: number;
  confidenceAvg: number;
  relevanceAvg: number;
  clarityAvg: number;
  overallAvg: number;
  weakestDimension: string;
  strongestDimension: string;
  recommendations: PersonalizedRecommendation[];
  interviewCount: number;
}

export interface PersonalizedRecommendation {
  title: string;
  description: string;
  action: string; // e.g. "Practice a Behavioral interview"
  href: string; // e.g. "/practice?type=BEHAVIORAL"
  priority: "HIGH" | "MEDIUM" | "LOW";
}

export type ReadinessLabel =
  | "Needs Preparation"
  | "Developing"
  | "Getting Ready"
  | "Interview Ready"
  | "Highly Prepared";

/* ─── Label Lookup ─── */
export function getReadinessLabel(score: number): ReadinessLabel {
  if (score >= 90) return "Highly Prepared";
  if (score >= 75) return "Interview Ready";
  if (score >= 60) return "Getting Ready";
  if (score >= 40) return "Developing";
  return "Needs Preparation";
}

/* ─── Score Color ─── */
export function getReadinessColor(score: number): string {
  if (score >= 75) return "emerald";
  if (score >= 60) return "sky";
  if (score >= 40) return "amber";
  return "rose";
}

/* ─── Weighted average helper ─── */
function weightedAvg(values: number[], weights: number[]): number {
  if (values.length === 0) return 0;
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const sum = values.reduce((acc, v, i) => acc + v * weights[i], 0);
  return totalWeight > 0 ? sum / totalWeight : 0;
}

/* ─── Main Calculation ─── */
export function calculateReadiness(
  reports: ReportSnapshot[],
  targetRole?: string | null
): ReadinessResult {
  if (reports.length === 0) {
    return {
      score: 0,
      label: "Needs Preparation",
      technicalAvg: 0,
      communicationAvg: 0,
      confidenceAvg: 0,
      relevanceAvg: 0,
      clarityAvg: 0,
      overallAvg: 0,
      weakestDimension: "Technical",
      strongestDimension: "Technical",
      recommendations: getDefaultRecommendations(),
      interviewCount: 0,
    };
  }

  // Split into recent (last 3) and older
  const sorted = [...reports]; // already sorted newest first by caller
  const recent = sorted.slice(0, 3);
  const older = sorted.slice(3);

  // Assign recency weights per-report
  const recentWeightPer = older.length > 0 ? 70 / recent.length : 100 / recent.length;
  const olderWeightPer = older.length > 0 ? 30 / older.length : 0;

  const allWeightedReports = [
    ...recent.map((r) => ({ r, w: recentWeightPer })),
    ...older.map((r) => ({ r, w: olderWeightPer })),
  ];

  const wa = (key: keyof ReportSnapshot) =>
    Math.round(
      weightedAvg(
        allWeightedReports.map(({ r }) => (r[key] as number) ?? 0),
        allWeightedReports.map(({ w }) => w)
      )
    );

  const technicalAvg = wa("technicalScore");
  const communicationAvg = wa("communicationScore");
  const confidenceAvg = wa("confidenceScore");
  const relevanceAvg = wa("relevanceScore");
  const clarityAvg = wa("clarityScore");
  const overallAvg = wa("overallScore");

  // Base readiness score with dimension weights
  let baseScore =
    technicalAvg * 0.30 +
    communicationAvg * 0.25 +
    confidenceAvg * 0.20 +
    relevanceAvg * 0.15 +
    clarityAvg * 0.10;

  // Role alignment bonus: +5 if recent interviews used same role
  if (targetRole && recent.length > 0) {
    const matchCount = recent.filter(
      (r) => r.role?.toLowerCase().includes(targetRole.toLowerCase().split(" ")[0])
    ).length;
    if (matchCount >= 1) baseScore = Math.min(100, baseScore + 5);
  }

  const score = Math.round(Math.min(100, Math.max(0, baseScore)));

  // Identify weakest / strongest dimension
  const dimensions: [string, number][] = [
    ["Technical", technicalAvg],
    ["Communication", communicationAvg],
    ["Confidence", confidenceAvg],
    ["Relevance", relevanceAvg],
    ["Clarity", clarityAvg],
  ];

  dimensions.sort((a, b) => a[1] - b[1]);
  const weakestDimension = dimensions[0][0];
  const strongestDimension = dimensions[dimensions.length - 1][0];

  // Build recommendations
  const recommendations = buildRecommendations(
    weakestDimension,
    communicationAvg,
    confidenceAvg,
    technicalAvg,
    score
  );

  return {
    score,
    label: getReadinessLabel(score),
    technicalAvg,
    communicationAvg,
    confidenceAvg,
    relevanceAvg,
    clarityAvg,
    overallAvg,
    weakestDimension,
    strongestDimension,
    recommendations,
    interviewCount: reports.length,
  };
}

/* ─── Recommendation Builder (Deterministic) ─── */
function buildRecommendations(
  weakest: string,
  communication: number,
  confidence: number,
  technical: number,
  score: number
): PersonalizedRecommendation[] {
  const recs: PersonalizedRecommendation[] = [];

  // Primary: target weakest area
  if (weakest === "Communication" || communication < 65) {
    recs.push({
      title: "Improve Communication",
      description:
        "Your recent interviews show weaker communication scores. Practice concise STAR-style answers to articulate your experiences clearly.",
      action: "Practice a Behavioral Interview",
      href: "/practice",
      priority: "HIGH",
    });
  }

  if (weakest === "Confidence" || confidence < 65) {
    recs.push({
      title: "Build Confidence",
      description:
        "Speaking under pressure is key. Voice interviews simulate the real experience and help you get comfortable with live answering.",
      action: "Try a Voice Interview",
      href: "/practice",
      priority: "HIGH",
    });
  }

  if (weakest === "Technical" || technical < 65) {
    recs.push({
      title: "Deepen Technical Knowledge",
      description:
        "Your technical scores suggest room for improvement. Practice deeper role-specific technical questions.",
      action: "Practice a Technical Interview",
      href: "/practice",
      priority: "HIGH",
    });
  }

  // Secondary: general recommendations if score is high
  if (score >= 75) {
    recs.push({
      title: "Challenge Yourself",
      description: "You're performing well. Push to Expert difficulty to stress-test your knowledge.",
      action: "Try an Expert Interview",
      href: "/practice",
      priority: "MEDIUM",
    });
  }

  if (recs.length === 0) {
    recs.push({
      title: "Start Practicing",
      description: "Complete your first interview to unlock personalized recommendations.",
      action: "Start Your First Interview",
      href: "/practice",
      priority: "HIGH",
    });
  }

  return recs.slice(0, 3);
}

function getDefaultRecommendations(): PersonalizedRecommendation[] {
  return [
    {
      title: "Start Practicing",
      description: "Complete your first interview to unlock personalized recommendations.",
      action: "Start Your First Interview",
      href: "/practice",
      priority: "HIGH",
    },
  ];
}
