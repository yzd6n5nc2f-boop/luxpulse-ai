import type { PropsWithChildren } from 'react';

type Status = 'OK' | 'Warning' | 'Critical' | 'Offline';

export function StatusBadge({ status }: { status: Status }) {
  const className = `status-badge status-${status.toLowerCase()}`;
  return <span className={className}>{status}</span>;
}

export function Tag({ children }: PropsWithChildren) {
  return <span className="tag">{children}</span>;
}
