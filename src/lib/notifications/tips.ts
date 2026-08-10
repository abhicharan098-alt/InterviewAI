export interface InterviewTip {
  title: string;
  body: string;
}

export const INTERVIEW_TIPS: InterviewTip[] = [
  {
    title: "Today's Interview Tip 💡",
    body: "Use the STAR method for behavioral questions: Situation → Task → Action → Result. Keep each part concise and relevant.",
  },
  {
    title: "Today's Interview Tip 💡",
    body: "Research the company's recent news, products, and culture before any interview. Mentioning specifics shows genuine interest.",
  },
  {
    title: "Today's Interview Tip 💡",
    body: "Pause before answering tough questions. A 2–3 second pause shows confidence, not hesitation.",
  },
  {
    title: "Today's Interview Tip 💡",
    body: "End every answer by connecting back to the value you'll bring. Don't just describe — quantify your impact.",
  },
  {
    title: "Today's Interview Tip 💡",
    body: "When asked 'Tell me about yourself', structure it as: Present role → Past experience → Why this opportunity.",
  },
  {
    title: "Today's Interview Tip 💡",
    body: "Prepare at least 3 questions for the interviewer. Ask about team culture, success metrics, and growth opportunities.",
  },
  {
    title: "Today's Interview Tip 💡",
    body: "For technical roles, think out loud while solving problems. Interviewers value your reasoning process, not just the final answer.",
  },
  {
    title: "Today's Interview Tip 💡",
    body: "Mirror the interviewer's communication style — formal or conversational — to build rapport naturally.",
  },
  {
    title: "Today's Interview Tip 💡",
    body: "When discussing weaknesses, always follow up with what you're actively doing to improve.",
  },
  {
    title: "Today's Interview Tip 💡",
    body: "Use numbers whenever possible: 'I improved load times by 40%' beats 'I improved performance significantly'.",
  },
  {
    title: "Today's Interview Tip 💡",
    body: "Practice your answers aloud, not just in your head. Speaking reveals gaps that reading doesn't.",
  },
  {
    title: "Today's Interview Tip 💡",
    body: "Salary negotiation: always let the employer give the first number. Counter with a specific figure, not a range.",
  },
  {
    title: "Today's Interview Tip 💡",
    body: "Body language matters on video calls too: sit upright, maintain eye contact with the camera, and minimize background distractions.",
  },
  {
    title: "Today's Interview Tip 💡",
    body: "Send a thank-you email within 24 hours. Reference something specific from the conversation to stand out.",
  },
  {
    title: "Today's Interview Tip 💡",
    body: "For 'Why should we hire you?', map your top 3 skills directly to the job description requirements.",
  },
  {
    title: "Today's Interview Tip 💡",
    body: "Handling rejection: always ask for feedback. Each rejection is data that makes your next application stronger.",
  },
  {
    title: "Today's Interview Tip 💡",
    body: "Technical interviews: if you're stuck, explain your thought process and ask clarifying questions — this shows collaboration skills.",
  },
  {
    title: "Today's Interview Tip 💡",
    body: "For leadership questions, highlight decisions you made under uncertainty and what you learned from outcomes.",
  },
  {
    title: "Today's Interview Tip 💡",
    body: "Keep your LinkedIn and resume consistent. Discrepancies raise red flags even before the interview.",
  },
  {
    title: "Today's Interview Tip 💡",
    body: "Practice with a timer — most interviews allow 2–3 minutes per answer. Exceeding this loses the interviewer's attention.",
  },
  {
    title: "Today's Interview Tip 💡",
    body: "When discussing conflicts, always take partial responsibility and focus on what you did to resolve the situation.",
  },
  {
    title: "Today's Interview Tip 💡",
    body: "For system design: start with requirements clarification, then high-level design, then drill into components.",
  },
  {
    title: "Today's Interview Tip 💡",
    body: "Confidence comes from preparation. Mock interviews reduce anxiety by making the unfamiliar feel familiar.",
  },
  {
    title: "Today's Interview Tip 💡",
    body: "Don't bad-mouth previous employers. If asked why you're leaving, focus on growth opportunities, not problems.",
  },
  {
    title: "Today's Interview Tip 💡",
    body: "For fresher roles: highlight academic projects, internships, and any side projects with measurable outcomes.",
  },
  {
    title: "Today's Interview Tip 💡",
    body: "HR round tip: 'Where do you see yourself in 5 years?' — align your answer with the company's growth trajectory.",
  },
  {
    title: "Today's Interview Tip 💡",
    body: "Cognitive load management: write key points before your answer. This keeps you focused and reduces rambling.",
  },
  {
    title: "Today's Interview Tip 💡",
    body: "For aptitude rounds: practice time management. If stuck on a question, skip and return — never let one question derail you.",
  },
  {
    title: "Today's Interview Tip 💡",
    body: "Communication tip: use active listening cues ('That's a great point, building on that...') to show engagement.",
  },
  {
    title: "Today's Interview Tip 💡",
    body: "Closing strong: always reaffirm your enthusiasm at the end — 'I'm really excited about this role and I'd love to contribute to [specific project].'",
  },
];

/** Returns a deterministic tip for today based on UTC day of year */
export function getTodaysTip(): InterviewTip {
  const now = new Date();
  const start = new Date(now.getUTCFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  return INTERVIEW_TIPS[dayOfYear % INTERVIEW_TIPS.length];
}
