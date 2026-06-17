export default function CoursesLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-8 w-40 bg-gray-200 rounded-lg" />
        <div className="h-9 w-32 bg-gray-200 rounded-lg" />
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border p-5 space-y-3">
            <div className="h-5 w-3/4 bg-gray-200 rounded" />
            <div className="h-3 w-full bg-gray-100 rounded" />
            <div className="h-3 w-2/3 bg-gray-100 rounded" />
            <div className="flex gap-2 pt-1">
              <div className="h-6 w-16 bg-gray-100 rounded-full" />
              <div className="h-6 w-20 bg-gray-100 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
