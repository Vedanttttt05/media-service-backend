import type { ReactNode } from "react";

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`size-6 animate-spin rounded-full border-2 border-border border-t-accent ${className}`}
    />
  );
}

export function PageLoader() {
  return (
    <div className="flex justify-center py-20">
      <Spinner className="size-8" />
    </div>
  );
}

export function ErrorMessage({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="card mx-auto my-10 max-w-md p-6 text-center">
      <p className="text-sm text-danger">{message}</p>
      {onRetry && (
        <button className="btn-secondary mt-4" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="mx-auto my-16 max-w-sm text-center">
      <p className="font-medium">{title}</p>
      {children && <div className="mt-2 text-sm text-muted">{children}</div>}
    </div>
  );
}

export function PageHeader({ title, actions }: { title: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-semibold">{title}</h1>
      {actions}
    </div>
  );
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
      {message}
    </p>
  );
}

export function Avatar({ src, name, size = 36 }: { src?: string; name: string; size?: number }) {
  const style = { width: size, height: size };
  if (src) {
    return <img src={src} alt={name} style={style} className="shrink-0 rounded-full bg-surface-2 object-cover" />;
  }
  return (
    <div
      style={{ ...style, fontSize: size * 0.4 }}
      className="flex shrink-0 items-center justify-center rounded-full bg-accent font-semibold text-white"
      aria-label={name}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
