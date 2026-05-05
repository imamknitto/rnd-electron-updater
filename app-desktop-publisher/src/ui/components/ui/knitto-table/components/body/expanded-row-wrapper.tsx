import type { ReactNode } from 'react';

export default function ExpandedRowWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="border-b border-r border-gray-300 h-full overflow-hidden">
      <div className="h-full">{children}</div>
    </div>
  );
}
