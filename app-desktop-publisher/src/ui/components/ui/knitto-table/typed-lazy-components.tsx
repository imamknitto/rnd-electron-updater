import { lazy, Suspense, type ReactNode } from 'react';
import type { IRegularTableProps } from './regular-table';
import type { TPickKnittoTable } from './virtual-table';
import LoadingIndicator from './components/loading-indicator';

// Lazy load table components with proper type assertions
const RegularTableLazy = lazy(() => import('./regular-table')) as React.LazyExoticComponent<<TData>(props: IRegularTableProps<TData>) => ReactNode>;
const VirtualTableLazy = lazy(() => import('./virtual-table')) as React.LazyExoticComponent<<TData>(props: TPickKnittoTable<TData>) => ReactNode>;

/**
 * Typed wrapper for RegularTable with generic type support
 * Eliminates the need for type casting in parent components
 */
export const TypedRegularTable = <TData,>(props: IRegularTableProps<TData>): ReactNode => (
  <Suspense fallback={<LoadingIndicator />}>
    <RegularTableLazy {...(props as IRegularTableProps<unknown>)} />
  </Suspense>
);

/**
 * Typed wrapper for VirtualTable with generic type support
 * Eliminates the need for type casting in parent components
 */
export const TypedVirtualTable = <TData,>(props: TPickKnittoTable<TData>): ReactNode => (
  <Suspense fallback={<LoadingIndicator />}>
    <VirtualTableLazy {...(props as TPickKnittoTable<unknown>)} />
  </Suspense>
);
