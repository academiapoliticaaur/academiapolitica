export default function DashboardLoading() {
  return (
    <div className="max-w-4xl animate-pulse">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-gray-200 rounded" />
          <div className="h-4 w-80 bg-gray-200 rounded" />
        </div>
      </div>

      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-48 bg-gray-200 rounded" />
          <div className="h-9 w-32 bg-gray-200 rounded-lg" />
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-xl border p-5 space-y-3 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gray-200" />
                <div className="space-y-2 flex-1">
                  <div className="h-5 w-24 bg-gray-200 rounded" />
                  <div className="h-3 w-16 bg-gray-200 rounded" />
                </div>
              </div>
              <div className="h-2 w-full bg-gray-200 rounded-full" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
