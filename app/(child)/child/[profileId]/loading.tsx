export default function ChildDashboardLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-pulse">
      {/* Header skeleton */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm border">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gray-200 flex-shrink-0" />
          <div className="space-y-2">
            <div className="h-3 w-16 bg-gray-200 rounded" />
            <div className="h-7 w-32 bg-gray-200 rounded" />
            <div className="h-3 w-24 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="flex gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-xl px-4 py-3 min-w-[72px] space-y-1">
              <div className="h-7 w-10 bg-gray-200 rounded mx-auto" />
              <div className="h-3 w-12 bg-gray-200 rounded mx-auto" />
            </div>
          ))}
        </div>
      </div>

      {/* Active course skeleton */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border shadow-sm">
        <div className="h-3 w-40 bg-gray-200 rounded mb-4" />
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gray-200 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-48 bg-gray-200 rounded" />
            <div className="h-3 w-32 bg-gray-200 rounded" />
            <div className="h-2 w-full bg-gray-200 rounded-full" />
          </div>
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b space-y-1">
          <div className="h-5 w-32 bg-gray-200 rounded" />
          <div className="h-3 w-48 bg-gray-200 rounded" />
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 divide-x">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="px-3 py-5 text-center space-y-2">
              <div className="h-5 w-5 bg-gray-200 rounded mx-auto" />
              <div className="h-7 w-10 bg-gray-200 rounded mx-auto" />
              <div className="h-3 w-14 bg-gray-200 rounded mx-auto" />
            </div>
          ))}
        </div>
      </div>

      {/* Courses skeleton */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b">
          <div className="h-5 w-32 bg-gray-200 rounded" />
        </div>
        <div className="px-5 py-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <div className="w-10 h-10 rounded-xl bg-gray-200 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 bg-gray-200 rounded" />
                <div className="h-2 w-full bg-gray-200 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
