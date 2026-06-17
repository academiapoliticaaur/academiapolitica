export default function CourseDetailLoading() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-10 animate-pulse">
      {/* Breadcrumb */}
      <div className="h-4 w-32 bg-gray-200 rounded mb-8" />

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title + badges */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="h-6 w-20 bg-gray-200 rounded-full" />
              <div className="h-6 w-16 bg-gray-200 rounded-full" />
            </div>
            <div className="h-9 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-5/6" />
          </div>

          {/* Module list */}
          {[0, 1, 2].map((m) => (
            <div key={m} className="border rounded-xl overflow-hidden bg-white">
              <div className="px-5 py-4 bg-gray-50 flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-lg" />
                <div className="h-5 bg-gray-200 rounded w-40" />
              </div>
              <div className="divide-y">
                {[0, 1, 2].map((l) => (
                  <div key={l} className="px-5 py-3 flex items-center gap-3">
                    <div className="w-7 h-7 bg-gray-100 rounded-lg flex-shrink-0" />
                    <div className="flex-1 h-4 bg-gray-100 rounded w-48" />
                    <div className="w-4 h-4 bg-gray-200 rounded-full flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar CTA */}
        <div className="space-y-4">
          <div className="border rounded-2xl p-6 bg-white space-y-4">
            <div className="h-6 bg-gray-200 rounded w-32" />
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-4/5" />
            <div className="h-11 bg-gray-200 rounded-xl w-full" />
            <div className="h-4 bg-gray-100 rounded w-24 mx-auto" />
          </div>
          <div className="border rounded-2xl p-5 bg-white space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-200 rounded" />
                <div className="h-3 bg-gray-100 rounded flex-1" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
