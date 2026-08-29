export function CardSkeleton() {
  return (
    <div className="glass rounded-3xl p-3">
      <div className="shimmer h-36 w-full rounded-2xl bg-muted" />
      <div className="space-y-3 p-3">
        <div className="shimmer h-5 w-2/3 rounded bg-muted" />
        <div className="shimmer h-4 w-1/2 rounded bg-muted" />
        <div className="shimmer h-6 w-full rounded-full bg-muted" />
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function BlockSkeleton({ className = "h-40" }: { className?: string }) {
  return <div className={`shimmer glass rounded-3xl ${className}`} />;
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="glass rounded-3xl p-8 text-center">
      <p className="font-semibold">Something went wrong</p>
      <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground"
        >
          Try again
        </button>
      )}
    </div>
  );
}
