export default function CityMindLoading() {
  return (
    <main className="min-h-screen bg-background p-4 md:p-6" aria-busy="true">
      <div className="mx-auto max-w-[1680px] space-y-5">
        <div className="h-28 animate-pulse rounded-lg border bg-card" />
        <div className="grid gap-5 xl:grid-cols-[340px_minmax(0,1fr)_430px]">
          <div className="h-[560px] animate-pulse rounded-lg border bg-card" />
          <div className="space-y-5">
            <div className="h-44 animate-pulse rounded-lg border bg-card" />
            <div className="h-72 animate-pulse rounded-lg border bg-card" />
          </div>
          <div className="h-[600px] animate-pulse rounded-lg border bg-card" />
        </div>
        <p className="sr-only" role="status">
          Loading CityMind.
        </p>
      </div>
    </main>
  );
}
