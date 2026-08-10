import { Award } from "lucide-react";

export default function RecommendationsPage() {
  return (
    <div className="min-h-screen bg-gray-950 p-8 flex items-center justify-center">
      <div className="max-w-2xl text-center">
        <div className="mx-auto bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-xl">
          <Award className="h-16 w-16 text-purple-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-white mb-4">Recommendations</h1>
          <p className="text-gray-400 mb-8">
            Personalized learning plans and resources tailored from your interview performance. (Feature coming soon).
          </p>
          <div className="inline-block px-4 py-2 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full font-medium">
            Coming Soon
          </div>
        </div>
      </div>
    </div>
  );
}
