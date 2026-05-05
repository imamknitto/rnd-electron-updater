import { useMemo, type ReactNode } from 'react';
import { createContext, useContextSelector } from 'use-context-selector';
import { DEFAULT_SIZE } from '../lib';
import {
  useColumns,
  useFreezeLeftColumns,
  useFreezeLeftColumnsWidth,
  useFreezeRightColumns,
  useFreezeRightColumnsWidth,
  useGetDepth,
} from './header-context';
import { useColumnVirtualItems, useColumnVirtualizer, useContainerWidth, useEnableColumnVirtualization } from './virtualizer-context';

// ==================== Types ====================
export type IUIContext = {
  freezeColLeftPositions: number[];
  freezeColRightPositions: number[];
  calcTotalTableWidth: number;
  useFooter: boolean;
  filterHeight: number;
  headerMode: 'single' | 'double';
  calcHeaderTotalHeight: number;
  useDynamicRowHeight: boolean;
  expandedContent: (rowData: unknown) => ReactNode;
  classNameCell?: (
    data: unknown,
    rowIndex: number,
    columnIndex: number,
    opts?: {
      isRowHighlighted?: boolean;
      isFirstIndex?: boolean;
      isLastIndex?: boolean;
      hasFreezeLeft?: boolean;
      hasFreezeRight?: boolean;
      isFreezeLeft?: boolean;
      isFreezeRight?: boolean;
    }
  ) => string;
};

type IUIContextProviderProps<TData = unknown> = {
  children: ReactNode;
  filterHeight: number;
  useFooter: boolean;
  headerMode: 'single' | 'double';
  headerHeight: number;
  isFilterVisible?: boolean;
  useDynamicRowHeight?: boolean;
  expandedContent?: (rowData: unknown) => ReactNode;
  classNameCell?: (
    data: TData,
    rowIndex: number,
    columnIndex: number,
    opts?: {
      isRowHighlighted?: boolean;
      isFirstIndex?: boolean;
      isLastIndex?: boolean;
      hasFreezeLeft?: boolean;
      hasFreezeRight?: boolean;
      isFreezeLeft?: boolean;
      isFreezeRight?: boolean;
    }
  ) => string;
};

// ==================== Context ====================
const UICtx = createContext<IUIContext | null>(null);

// ==================== Hooks ====================
export const useFreezeColLeftPositions = () => useContextSelector(UICtx, (ctx) => ctx?.freezeColLeftPositions ?? []);

export const useFreezeColRightPositions = () => useContextSelector(UICtx, (ctx) => ctx?.freezeColRightPositions ?? []);

export const useCalcTotalTableWidth = () => useContextSelector(UICtx, (ctx) => ctx?.calcTotalTableWidth ?? 0);

export const useUseFooter = () => useContextSelector(UICtx, (ctx) => ctx?.useFooter ?? false);

export const useFilterHeight = () => useContextSelector(UICtx, (ctx) => ctx?.filterHeight ?? DEFAULT_SIZE.FILTER_HEIGHT);

export const useHeaderMode = () => useContextSelector(UICtx, (ctx) => ctx?.headerMode ?? 'double');

export const useExpandedContent = () => useContextSelector(UICtx, (ctx) => ctx?.expandedContent ?? (() => null));

export const useCalcHeaderTotalHeight = () => useContextSelector(UICtx, (ctx) => ctx?.calcHeaderTotalHeight ?? 0);

export const useClassNameCell = () => useContextSelector(UICtx, (ctx) => ctx?.classNameCell);

export const useUseDynamicRowHeight = () => useContextSelector(UICtx, (ctx) => ctx?.useDynamicRowHeight ?? false);

// ==================== Provider ====================
export const UIContextProvider = <TData = unknown,>(props: IUIContextProviderProps<TData>): React.ReactElement => {
  const {
    children,
    filterHeight,
    useDynamicRowHeight = false,
    expandedContent,
    useFooter = false,
    headerMode,
    headerHeight,
    isFilterVisible = true,
    classNameCell,
  } = props;

  const columns = useColumns();
  const freezeLeftColumns = useFreezeLeftColumns();
  const freezeRightColumns = useFreezeRightColumns();
  const freezeLeftColumnsWidth = useFreezeLeftColumnsWidth();
  const freezeRightColumnsWidth = useFreezeRightColumnsWidth();
  const getDepth = useGetDepth();

  const columnVirtualizer = useColumnVirtualizer();
  const enableColumnVirtualization = useEnableColumnVirtualization();
  const columnVirtualItems = useColumnVirtualItems();
  const containerWidth = useContainerWidth();

  // Calculate virtualized columns width
  // Tambahkan columnVirtualItems dan containerWidth sebagai dependency
  // agar selalu ter-update ketika kolom di-resize oleh useAutoStretchColumn
  const virtualizedColumnsWidth = useMemo(() => {
    if (enableColumnVirtualization && columnVirtualizer) {
      return columnVirtualizer.getTotalSize();
    }

    // For non-virtualized mode, calculate manually from columns
    return columns.reduce((sum, col) => sum + (col.width || 0), 0);
  }, [enableColumnVirtualization, columnVirtualizer, columns, columnVirtualItems, containerWidth]);

  // Note: Hitung posisi left absolute dari kolom yang freeze di kiri.
  const freezeColLeftPositions = useMemo<number[]>(() => {
    return freezeLeftColumns.reduce<number[]>((acc, _column, idx) => {
      const left = idx === 0 ? 0 : acc[idx - 1] + (freezeLeftColumns[idx - 1].width || 0);
      return [...acc, left];
    }, []);
  }, [freezeLeftColumns]);

  // Note: Hitung posisi right absolute dari kolom yang freeze di kanan.
  const freezeColRightPositions = useMemo<number[]>(() => {
    return freezeRightColumns.reduce<number[]>((acc, _column, idx) => {
      const right = idx === 0 ? 0 : acc[idx - 1] + (freezeRightColumns[idx - 1].width || 0);
      return [...acc, right];
    }, []);
  }, [freezeRightColumns]);

  // Note: Hitung total lebar dari semua jenis kolom.
  const calcTotalTableWidth = useMemo(() => {
    return virtualizedColumnsWidth + freezeLeftColumnsWidth + freezeRightColumnsWidth;
  }, [virtualizedColumnsWidth, freezeLeftColumnsWidth, freezeRightColumnsWidth]);

  type HeaderNode = (typeof columns)[number];

  // Hitung total tinggi header berdasarkan mode, filter, dan depth
  const calcHeaderTotalHeight = useMemo(() => {
    // Hitung kedalaman maksimum dari semua kolom top-level
    const maxDepthTopLevel = Math.max(
      0,
      ...columns.map((c) => getDepth(c as HeaderNode)),
      ...freezeLeftColumns.map((c) => getDepth(c as HeaderNode)),
      ...freezeRightColumns.map((c) => getDepth(c as HeaderNode))
    );

    // Hitung tinggi header berdasarkan mode dan filter
    const calcFilterHeight = isFilterVisible ? filterHeight : 0;
    const baseHeaderHeight = headerMode === 'single' ? headerHeight : headerHeight + calcFilterHeight;

    // Total tinggi termasuk group headers
    return baseHeaderHeight + DEFAULT_SIZE.GROUP_HEADER_HEIGHT * maxDepthTopLevel;
  }, [headerMode, headerHeight, filterHeight, isFilterVisible, columns, freezeLeftColumns, freezeRightColumns, getDepth]);

  // Memoize expandedContent function
  const memoizedExpandedContent = useMemo(() => expandedContent || (() => null), [expandedContent]);

  // Memoize classNameCell function
  const memoizedClassNameCell = useMemo(
    () => classNameCell as ((data: unknown, rowIndex: number, columnIndex: number) => string) | undefined,
    [classNameCell]
  );

  // Memoize context value
  const contextValue = useMemo<IUIContext>(
    () => ({
      freezeColLeftPositions,
      freezeColRightPositions,
      calcTotalTableWidth,
      useFooter,
      filterHeight,
      headerMode,
      calcHeaderTotalHeight,
      useDynamicRowHeight,
      expandedContent: memoizedExpandedContent,
      classNameCell: memoizedClassNameCell,
    }),
    [
      freezeColLeftPositions,
      freezeColRightPositions,
      calcTotalTableWidth,
      useFooter,
      filterHeight,
      headerMode,
      calcHeaderTotalHeight,
      useDynamicRowHeight,
      memoizedExpandedContent,
      memoizedClassNameCell,
    ]
  );

  return <UICtx.Provider value={contextValue}>{children}</UICtx.Provider>;
};
