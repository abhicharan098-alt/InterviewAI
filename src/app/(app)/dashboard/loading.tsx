export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#050814]">
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-5 lg:px-6 py-8 md:py-10">
        {/* Header skeleton */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <div className="skeleton h-4 w-48" />
            <div className="skeleton h-9 w-72" />
            <div className="skeleton h-4 w-56" />
          </div>
          <div className="skeleton h-11 w-40 shrink-0" />
        </div>

        {/* Stat skeletons */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-[104px] rounded-2xl" />
          ))}
        </div>

        {/* Action card skeletons */}
        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="skeleton h-64 rounded-2xl" />
          ))}
        </div>

        {/* Recent interviews + performance skeletons */}
        <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-[1.7fr_1fr]">
          <div className="space-y-3">
            <div className="skeleton h-6 w-48" />
            <div className="overflow-hidden rounded-2xl border border-white/[0.08]">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-4 border-b border-white/[0.06] px-5 py-4">
                  <div className="skeleton h-10 w-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-4 w-1/2" />
                    <div className="skeleton h-3 w-2/3" />
                  </div>
                  <div className="skeleton h-8 w-16 rounded-lg" />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <div className="skeleton h-6 w-48" />
            <div className="skeleton h-72 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}