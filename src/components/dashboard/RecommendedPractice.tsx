import { ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";

export function RecommendedPractice({
  title,
  description,
  actionText,
  href
}: {
  title: string;
  description: string;
  actionText: string;
  href: string;
}) {
  // Dynamic content mapping based on title keywords
  const titleLower = title.toLowerCase();
  
  let whyThisMatters = "Strong fundamentals are not just about knowing the right answer. Interviewers look for structured thinking, confidence, and the ability to explain your decisions clearly.";
  let improvementPlan = [
    "Structure answers logically",
    "Keep responses focused and specific",
    "Support your points with examples"
  ];
  let tip = "Complete one focused practice session today and compare your score with your previous attempt.";

  if (titleLower.includes("communication")) {
    whyThisMatters = "Strong communication is not just about speaking clearly. Interviewers also look for structured thinking, confidence, and the ability to explain your decisions concisely.";
    improvementPlan = [
      "01 Structure answers using STAR",
      "02 Keep responses focused and specific",
      "03 Support answers with real examples"
    ];
  } else if (titleLower.includes("problem") || titleLower.includes("solving")) {
    whyThisMatters = "Problem solving is about the journey, not just the destination. Interviewers want to see how you approach ambiguity, break down complex issues, and explain trade-offs.";
    improvementPlan = [
      "01 State your assumptions clearly",
      "02 Break the problem into small steps",
      "03 Explain trade-offs in your choices"
    ];
  } else if (titleLower.includes("confidence")) {
    whyThisMatters = "Confidence transforms a good answer into a great one. It shows you trust your own experiences and can lead projects without requiring constant validation.";
    improvementPlan = [
      "01 Practice structured delivery",
      "02 Control your pacing (don't rush)",
      "03 Eliminate filler words"
    ];
  } else if (titleLower.includes("technical")) {
    whyThisMatters = "Technical skills validate your resume. Beyond knowing the syntax, interviewers evaluate your deep understanding of fundamentals and why you choose specific solutions.";
    improvementPlan = [
      "01 Review core domain fundamentals",
      "02 Explain the 'why' behind solutions",
      "03 Discuss edge cases proactively"
    ];
  } else if (titleLower.includes("leadership")) {
    whyThisMatters = "Leadership isn't just a title. It's about demonstrating ownership, navigating difficult team dynamics, and proving you can drive measurable impact.";
    improvementPlan = [
      "01 Highlight ownership and initiative",
      "02 Focus on team empowerment",
      "03 Quantify your measurable impact"
    ];
  }

  return (
    <div data-chaos-item="true" className="flex flex-col rounded-2xl border border-white/[0.08] bg-[#0D1424] overflow-hidden">
      <div className="flex items-center gap-4 border-b border-white/[0.04] p-5 shrink-0">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-purple-500/10 text-purple-400">
          <BookOpen className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-semibold text-white">Recommended for you</h3>
      </div>
      
      <div className="flex flex-col p-5 gap-4">
        {/* Main Recommendation */}
        <div>
          <p className="text-[15px] font-bold text-purple-300 truncate mb-1" title={title}>{title}</p>
          <p className="text-sm text-slate-300 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Why this matters */}
        <div className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-4 mt-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Why this matters</p>
          <p className="text-sm text-slate-300 leading-relaxed">
            {whyThisMatters}
          </p>
        </div>

        {/* Your improvement plan */}
        <div className="rounded-xl border border-purple-500/10 bg-purple-500/[0.02] p-4">
          <p className="text-xs font-semibold text-purple-300 uppercase tracking-wider mb-3">Your improvement plan</p>
          <ul className="flex flex-col gap-2">
            {improvementPlan.map((step, idx) => (
              <li key={idx} className="flex items-center gap-3 text-sm text-slate-300 font-medium">
                <span className="text-purple-400/50 shrink-0">{step.split(' ')[0]}</span>
                <span>{step.substring(step.indexOf(' ') + 1)}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actionable tip */}
        <p className="text-[13px] font-medium text-slate-400 leading-relaxed italic mt-1">
          {tip}
        </p>
      </div>

      <div className="p-5 pt-0 shrink-0 border-t border-white/[0.04]">
        <Link 
          href={href}
          className="inline-flex h-11 w-full mt-5 items-center justify-center gap-2 rounded-lg bg-white/[0.04] px-5 text-sm font-semibold text-slate-200 ring-1 ring-inset ring-white/[0.1] transition-all hover:bg-white/[0.08] hover:text-white"
        >
          {actionText} <ArrowRight className="h-4 w-4 text-slate-400" />
        </Link>
      </div>
    </div>
  );
}
