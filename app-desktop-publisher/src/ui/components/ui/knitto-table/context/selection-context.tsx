import { createContext, useContextSelector } from 'use-context-selector';
import { useCallback, useState, useMemo } from 'react';

// ==================== Types ====================
export type ISelectionContext = {
  selectedRowKey: string | null;
  selectedRowKeys: Set<string>;
  deselectedRowKeys: Set<string>;
  expandedRowKeys: Set<string>;
  selectAll: boolean;
  selectedRowWithSpanKeys: string[];
  toggleExpandRow: (key: string) => void;
  onClickRow: (key: string | null) => void;
  setSelectedRowKey: (key: string | null) => void;
  toggleRowSelection: (key: string) => void;
  toggleSelectAll: (mode: boolean) => void;
  setSelectedRowWithSpanKeys: (keys: string[]) => void;
};

type ISelectionContextProvider = {
  children: React.ReactNode;
  onChangeCheckboxRowSelection?: (selectedRows: (string | number)[], deselectedRows: (string | number)[], isSelectAll: boolean) => void;
};

// ==================== Context ====================
const SelectionCtx = createContext<ISelectionContext | null>(null);

// ==================== Hooks ====================
export const useSetSelectedRowWithSpanKeys = () => useContextSelector(SelectionCtx, (ctx) => ctx?.setSelectedRowWithSpanKeys)!;

export const useSelectedRowWithSpanKeys = () => useContextSelector(SelectionCtx, (ctx) => ctx?.selectedRowWithSpanKeys ?? []);

export const useSelectedRowKey = () => useContextSelector(SelectionCtx, (ctx) => ctx?.selectedRowKey ?? null);

export const useSelectedRowKeys = () => useContextSelector(SelectionCtx, (ctx) => ctx?.selectedRowKeys ?? new Set<string>());

export const useDeselectedRowKeys = () => useContextSelector(SelectionCtx, (ctx) => ctx?.deselectedRowKeys ?? new Set<string>());

export const useExpandedRowKeys = () => useContextSelector(SelectionCtx, (ctx) => ctx?.expandedRowKeys ?? new Set<string>());

export const useSelectAll = () => useContextSelector(SelectionCtx, (ctx) => ctx?.selectAll ?? false);

export const useToggleExpandRow = () => useContextSelector(SelectionCtx, (ctx) => ctx?.toggleExpandRow)!;

export const useOnClickRow = () => useContextSelector(SelectionCtx, (ctx) => ctx?.onClickRow)!;

export const useSetSelectedRowKey = () => useContextSelector(SelectionCtx, (ctx) => ctx?.setSelectedRowKey)!;

export const useToggleRowSelection = () => useContextSelector(SelectionCtx, (ctx) => ctx?.toggleRowSelection)!;

export const useToggleSelectAll = () => useContextSelector(SelectionCtx, (ctx) => ctx?.toggleSelectAll)!;

// ==================== Provider ====================
export const SelectionContextProvider = (props: ISelectionContextProvider): React.ReactElement => {
  const { children, onChangeCheckboxRowSelection } = props;

  const [selectedRowWithSpanKeys, setSelectedRowWithSpanKeys] = useState<string[]>([]);
  const [selectedRowKey, setSelectedRowKey] = useState<string | null>(null);
  const [expandedRowKeys, setExpandedRowKeys] = useState<Set<string>>(new Set());
  const [selectedRowKeys, setSelectedRowKeys] = useState<Set<string>>(new Set());
  const [deselectedRowKeys, setDeselectedRowKeys] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState<boolean>(false);

  const onClickRow = useCallback((key: string | null) => {
    setSelectedRowKey(key);
  }, []);

  const toggleRowSelection = useCallback(
    (key: string): void => {
      if (selectAll) {
        setDeselectedRowKeys((prev) => {
          if (prev.has(key)) {
            const next = new Set(prev);
            next.delete(key);
            onChangeCheckboxRowSelection?.([], Array.from(next), false);
            return next;
          }
          const finalData = new Set(prev).add(key);
          onChangeCheckboxRowSelection?.([], Array.from(finalData), false);

          return finalData;
        });
        return;
      }

      setSelectedRowKeys((prev) => {
        if (prev.has(key)) {
          const next = new Set(prev);
          next.delete(key);
          onChangeCheckboxRowSelection?.(Array.from(next), [], false);
          return next;
        }
        const finalData = new Set(prev).add(key);
        onChangeCheckboxRowSelection?.(Array.from(finalData), [], false);

        return finalData;
      });
    },
    [selectAll, onChangeCheckboxRowSelection]
  );

  const toggleSelectAll = useCallback(
    (mode: boolean): void => {
      onChangeCheckboxRowSelection?.([], [], mode);

      setSelectAll(mode);
      setSelectedRowKeys(new Set());
      setDeselectedRowKeys(new Set());
    },
    [onChangeCheckboxRowSelection]
  );

  const toggleExpandRow = useCallback((key: string): void => {
    setExpandedRowKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  // Memoize context value
  const contextValue = useMemo<ISelectionContext>(
    () => ({
      selectedRowKey,
      selectedRowKeys,
      deselectedRowKeys,
      selectAll,
      expandedRowKeys,
      toggleExpandRow,
      selectedRowWithSpanKeys,
      setSelectedRowKey,
      onClickRow,
      toggleRowSelection,
      toggleSelectAll,
      setSelectedRowWithSpanKeys,
    }),
    [
      selectedRowKey,
      selectedRowKeys,
      deselectedRowKeys,
      selectAll,
      expandedRowKeys,
      toggleExpandRow,
      selectedRowWithSpanKeys,
      onClickRow,
      toggleRowSelection,
      toggleSelectAll,
      setSelectedRowWithSpanKeys,
    ]
  );

  return <SelectionCtx.Provider value={contextValue}>{children}</SelectionCtx.Provider>;
};
