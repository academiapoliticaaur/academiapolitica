export default function CadreLloading() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-12 animate-pulse">
      {/* Header */}
      <div className="mb-10 space-y-3">
        <div className="h-8 bg-gray-200 rounded w-64" />
        <div className="h-4 bg-gray-100 rounded w-80" />
      </div>

      {/* Section label */}
      <div className="h-3 bg-gray-200 rounded w-24 mb-4" />

      {/* Course cards grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white border rounded-2xl overflow-hidden">
            <div className="p-6 space-y-3">
              <div className="flex gap-2">
                <div className="h-5 w-16 bg-gray-200 rounded-full" />
                <div className="h-5 w-12 bg-gray-100 rounded-full" />
              </div>
              <div className="h-5 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-100 rounded w-full" />
              <div className="h-3 bg-gray-100 rounded w-4/5" />
              <div className="h-9 bg-gray-100 rounded-xl mt-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
