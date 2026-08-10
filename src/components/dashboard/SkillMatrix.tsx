import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function SkillMatrix({
  technical,
  communication,
  confidence,
  relevance
}: {
  technical: number;
  communication: number;
  confidence: number;
  relevance: number;
}) {
  const skills = [
    { name: "Technical", score: technical, color: "bg-purple-500" },
    { name: "Communication", score: communication, color: "bg-sky-400" },
    { name: "Confidence", score: confidence, color: "bg-emerald-400" },
    { name: "Relevance", score: relevance, color: "bg-purple-400" },
  ];

  return (
    <div data-chaos-item="true" className="rounded-2xl border border-white/[0.08] bg-[#0D1424] flex flex-col overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b border-white/[0.04] shrink-0">
        <h3 className="text-lg font-semibold text-white">Skill Performance</h3>
      </div>
      
      <div className="flex flex-col p-6 gap-6">
        {skills.map((skill) => (
          <div key={skill.name}>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-300">{skill.name}</span>
              <span className="text-white font-medium tabular-nums">{skill.score}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.05]">
              <div className={`h-full rounded-full ${skill.color} transition-all duration-1000 ease-out`} style={{ width: `${skill.score}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 pt-0 shrink-0 border-t border-white/[0.04]">
        <Link href="/progress" className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-white/[0.02] mt-6 px-4 text-sm font-medium text-slate-300 ring-1 ring-inset ring-white/[0.08] transition-all hover:bg-white/[0.05] hover:text-white hover:ring-white/[0.15]">
          View Detailed Analysis <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
