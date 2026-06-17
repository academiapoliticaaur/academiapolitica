export default function LessonLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
      {/* Nav prev/next */}
      <div className="flex items-center justify-between">
        <div className="h-9 w-28 bg-gray-200 rounded-lg" />
        <div className="h-4 w-32 bg-gray-100 rounded" />
        <div className="h-9 w-28 bg-gray-200 rounded-lg" />
      </div>

      {/* Video/content placeholder */}
      <div className="bg-gray-200 rounded-2xl aspect-video w-full" />

      {/* Lesson title */}
      <div className="bg-white rounded-2xl p-6 space-y-3">
        <div className="h-3 w-20 bg-gray-100 rounded" />
        <div className="h-6 bg-gray-200 rounded w-2/3" />
        <div className="h-4 bg-gray-100 rounded w-full" />
        <div className="h-4 bg-gray-100 rounded w-5/6" />
      </div>

      {/* Resources row */}
      <div className="flex gap-3">
        {[0, 1].map((i) => (
          <div key={i} className="h-10 w-36 bg-gray-200 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
