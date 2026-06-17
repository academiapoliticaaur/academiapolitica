export default function ParentsLoading() {
  return (
    <div className="max-w-5xl space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-8 w-40 bg-gray-200 rounded-lg" />
        <div className="h-9 w-36 bg-gray-200 rounded-lg" />
      </div>
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="bg-gray-50 border-b px-4 py-3 flex gap-4">
          {[120, 80, 100, 80].map((w, i) => (
            <div key={i} className={`h-4 bg-gray-200 rounded`} style={{ width: w }} />
          ))}
        </div>
        <div className="divide-y">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="px-4 py-3 flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 w-40 bg-gray-200 rounded" />
                <div className="h-3 w-56 bg-gray-100 rounded" />
              </div>
              <div className="h-6 w-16 bg-gray-200 rounded-full hidden sm:block" />
              <div className="h-7 w-20 bg-gray-100 rounded-lg hidden md:block" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
