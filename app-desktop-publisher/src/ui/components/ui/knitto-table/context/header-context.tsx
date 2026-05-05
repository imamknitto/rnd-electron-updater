import { createContext, useContextSelector } from 'use-context-selector';
import { useReducer, useMemo, useCallback, useEffect } from 'react';
import type { IAdjustedHeader } from '../lib';
import { DEFAULT_SIZE } from '../lib';

// ==================== Types ====================
type IHeaderContext = {
  columns: IAdjustedHeader[];
  flattenColumns: { col: IAdjustedHeader; depth: number; parentKey?: string }[];
  freezeLeftColumns: IAdjustedHeader[];
  freezeRightColumns: IAdjustedHeader[];
  freezeLeftColumnsWidth: number;
  freezeRightColumnsWidth: number;
  isFilterVisible: boolean;
  toggleColumnVisibility: (key: string) => void;
  toggleFilterVisibility: () => void;
  getLeaves: (node: IAdjustedHeader) => IAdjustedHeader[];
  getDepth: (node: IAdjustedHeader) => number;
  updateColumn: (key: string, update: Partial<IAdjustedHeader>) => void;
  updateFreezeColumn: (key: string, freezeType: 'left' | 'right', update: Partial<IAdjustedHeader>) => void;
  updateChildColumn: (parentKey: string, childKey: string, update: Partial<IAdjustedHeader>) => void;
  updateFreezeChildColumn: (parentKey: string, childKey: string, freezeType: 'left' | 'right', update: Partial<IAdjustedHeader>) => void;
};

type IHeaderContextProvider = {
  initialColumns: IAdjustedHeader[];
  children: React.ReactNode;
  useRegularTable: boolean;
};

type HeaderState = {
  columns: IAdjustedHeader[];
  freezeLeftColumns: IAdjustedHeader[];
  freezeRightColumns: IAdjustedHeader[];
  isFilterVisible: boolean;
};

type HeaderAction =
  | {
      type: 'INITIALIZE';
      payload: { columns: IAdjustedHeader[]; freezeLeft: IAdjustedHeader[]; freezeRight: IAdjustedHeader[] };
    }
  | { type: 'UPDATE_COLUMN'; payload: { key: string; update: Partial<IAdjustedHeader> } }
  | { type: 'UPDATE_CHILD_COLUMN'; payload: { parentKey: string; childKey: string; update: Partial<IAdjustedHeader> } }
  | {
      type: 'UPDATE_FREEZE_COLUMN';
      payload: { key: string; freezeType: 'left' | 'right'; update: Partial<IAdjustedHeader> };
    }
  | {
      type: 'UPDATE_FREEZE_CHILD_COLUMN';
      payload: { parentKey: string; childKey: string; freezeType: 'left' | 'right'; update: Partial<IAdjustedHeader> };
    }
  | { type: 'TOGGLE_FILTER_VISIBILITY' };

// ==================== Utils ====================
const flattenHeaderLeaves = (
  columns: IAdjustedHeader[],
  depth = 0,
  parentKey?: string
): { col: IAdjustedHeader; depth: number; parentKey?: string }[] => {
  let rows: { col: IAdjustedHeader; depth: number; parentKey?: string }[] = [];

  columns.forEach((col) => {
    if (col.children?.length) {
      rows = rows.concat(flattenHeaderLeaves(col.children, depth + 1, col.key));
    } else {
      rows.push({ col, depth, parentKey });
    }
  });

  return rows;
};

const getLeavesOfNode = (node: IAdjustedHeader): IAdjustedHeader[] => {
  if (!node.children || node.children.length === 0) return [node];
  return node.children.flatMap((c) => getLeavesOfNode(c));
};

const getDepthOfNode = (node: IAdjustedHeader): number => {
  if (!node.children || node.children.length === 0) return 0;
  return 1 + Math.max(...node.children.map((c) => getDepthOfNode(c)));
};

const calculateWidthFromLeaves = (node: IAdjustedHeader): number => {
  return getLeavesOfNode(node).reduce((sum, leaf) => sum + (leaf.width || DEFAULT_SIZE.COLUMN_WIDTH), 0);
};

const normalizeColumnsRecursive = (cols: IAdjustedHeader[]): IAdjustedHeader[] => {
  return cols.map((col) => {
    const visible = col.visible ?? true;

    if (col.children && col.children.length > 0) {
      const normalizedChildren = normalizeColumnsRecursive(col.children).map((child) => ({
        ...child,
        parentKey: col.key,
      }));

      const widthFromLeaves = calculateWidthFromLeaves({ ...col, children: normalizedChildren });

      return { ...col, visible, children: normalizedChildren, width: widthFromLeaves };
    }

    return { ...col, visible, width: col.width || DEFAULT_SIZE.COLUMN_WIDTH };
  });
};

const updateChildDeep = (col: IAdjustedHeader, childKey: string, update: Partial<IAdjustedHeader>): IAdjustedHeader => {
  if (!col.children || col.children.length === 0) return col;

  const nextChildren = col.children.map((child) => {
    if (child.key === childKey) {
      return { ...child, ...update } as IAdjustedHeader;
    }
    return updateChildDeep(child, childKey, update);
  });

  const widthFromLeaves = nextChildren.reduce((sum, child) => {
    if (!child.children || child.children.length === 0) {
      return sum + (child.width || DEFAULT_SIZE.COLUMN_WIDTH);
    }
    return sum + calculateWidthFromLeaves(child);
  }, 0);

  return {
    ...col,
    children: nextChildren,
    width: widthFromLeaves,
  } as IAdjustedHeader;
};

const calculateTotalWidth = (columns: IAdjustedHeader[]): number => {
  return columns.reduce((acc, col) => acc + (col.width || 0), 0);
};

// ==================== Reducer ====================
const headerReducer = (state: HeaderState, action: HeaderAction): HeaderState => {
  switch (action.type) {
    case 'INITIALIZE': {
      const { columns, freezeLeft, freezeRight } = action.payload;
      return { ...state, columns, freezeLeftColumns: freezeLeft, freezeRightColumns: freezeRight };
    }

    case 'UPDATE_COLUMN': {
      const { key, update } = action.payload;
      return {
        ...state,
        columns: state.columns.map((col) => (col.key === key ? { ...col, ...update } : col)),
      };
    }

    case 'UPDATE_CHILD_COLUMN': {
      const { parentKey, childKey, update } = action.payload;
      return {
        ...state,
        columns: state.columns.map((col) => {
          if (col.key !== parentKey) return col;
          return updateChildDeep(col, childKey, update);
        }),
      };
    }

    case 'UPDATE_FREEZE_COLUMN': {
      const { key, freezeType, update } = action.payload;
      if (freezeType === 'left') {
        return {
          ...state,
          freezeLeftColumns: state.freezeLeftColumns.map((col) => (col.key === key ? { ...col, ...update } : col)),
        };
      }
      return {
        ...state,
        freezeRightColumns: state.freezeRightColumns.map((col) => (col.key === key ? { ...col, ...update } : col)),
      };
    }

    case 'UPDATE_FREEZE_CHILD_COLUMN': {
      const { parentKey, childKey, freezeType, update } = action.payload;
      const updateFn = (cols: IAdjustedHeader[]) =>
        cols.map((col) => {
          if (col.key !== parentKey) return col;
          return updateChildDeep(col, childKey, update);
        });

      if (freezeType === 'left') {
        return {
          ...state,
          freezeLeftColumns: updateFn(state.freezeLeftColumns),
        };
      }
      return {
        ...state,
        freezeRightColumns: updateFn(state.freezeRightColumns),
      };
    }

    case 'TOGGLE_FILTER_VISIBILITY':
      return {
        ...state,
        isFilterVisible: !state.isFilterVisible,
      };

    default:
      return state;
  }
};

// ==================== Context ====================
const HeaderCtx = createContext<IHeaderContext | null>(null);

export const useColumns = () => useContextSelector(HeaderCtx, (ctx) => ctx?.columns ?? []);
export const useFlattenColumns = () => useContextSelector(HeaderCtx, (ctx) => ctx?.flattenColumns ?? []);
export const useFreezeLeftColumns = () => useContextSelector(HeaderCtx, (ctx) => ctx?.freezeLeftColumns ?? []);
export const useFreezeRightColumns = () => useContextSelector(HeaderCtx, (ctx) => ctx?.freezeRightColumns ?? []);
export const useFreezeLeftColumnsWidth = () => useContextSelector(HeaderCtx, (ctx) => ctx?.freezeLeftColumnsWidth ?? 0);
export const useFreezeRightColumnsWidth = () => useContextSelector(HeaderCtx, (ctx) => ctx?.freezeRightColumnsWidth ?? 0);
export const useGetDepth = () => useContextSelector(HeaderCtx, (ctx) => ctx?.getDepth)!;
export const useGetLeaves = () => useContextSelector(HeaderCtx, (ctx) => ctx?.getLeaves)!;
export const useIsFilterVisible = () => useContextSelector(HeaderCtx, (ctx) => ctx?.isFilterVisible)!;
export const useToggleColumnVisibility = () => useContextSelector(HeaderCtx, (ctx) => ctx?.toggleColumnVisibility)!;
export const useToggleFilterVisibility = () => useContextSelector(HeaderCtx, (ctx) => ctx?.toggleFilterVisibility)!;
export const useUpdateColumn = () => useContextSelector(HeaderCtx, (ctx) => ctx?.updateColumn)!;
export const useUpdateFreezeColumn = () => useContextSelector(HeaderCtx, (ctx) => ctx?.updateFreezeColumn)!;
export const useUpdateChildColumn = () => useContextSelector(HeaderCtx, (ctx) => ctx?.updateChildColumn)!;
export const useUpdateFreezeChildColumn = () => useContextSelector(HeaderCtx, (ctx) => ctx?.updateFreezeChildColumn)!;

// ==================== Provider ====================
export const HeaderContextProvider = ({ initialColumns, useRegularTable, children }: IHeaderContextProvider): React.ReactElement => {
  const [state, dispatch] = useReducer(headerReducer, {
    columns: [],
    freezeLeftColumns: [],
    freezeRightColumns: [],
    isFilterVisible: true,
  });

  // Initialize columns when initialColumns change
  useEffect(() => {
    if (!initialColumns.length) return;

    const processedColumns = normalizeColumnsRecursive(initialColumns);

    if (useRegularTable) {
      // Untuk regular table: columns tidak perlu freeze separation
      dispatch({
        type: 'INITIALIZE',
        payload: { columns: processedColumns, freezeLeft: [], freezeRight: [] },
      });
    } else {
      // Untuk virtual table: separate freeze left/right/virtualized
      const virtualized = processedColumns.filter((col) => !col.freeze);
      const freezeLeft = processedColumns.filter((col) => col.freeze === 'left');
      const freezeRight = processedColumns.filter((col) => col.freeze === 'right');

      dispatch({
        type: 'INITIALIZE',
        payload: { columns: virtualized, freezeLeft, freezeRight },
      });
    }
  }, [initialColumns, useRegularTable]);

  // Memoized flatten columns
  const flattenColumns = useMemo(() => flattenHeaderLeaves(state.columns), [state.columns]);

  // Memoized freeze widths
  const freezeLeftColumnsWidth = useMemo(() => calculateTotalWidth(state.freezeLeftColumns), [state.freezeLeftColumns]);

  const freezeRightColumnsWidth = useMemo(() => calculateTotalWidth(state.freezeRightColumns), [state.freezeRightColumns]);

  // Memoized utility functions (static)
  const getLeaves = useCallback(getLeavesOfNode, []);
  const getDepth = useCallback(getDepthOfNode, []);

  // Memoized action dispatchers
  const updateColumn = useCallback((key: string, update: Partial<IAdjustedHeader>) => {
    dispatch({ type: 'UPDATE_COLUMN', payload: { key, update } });
  }, []);

  const updateChildColumn = useCallback((parentKey: string, childKey: string, update: Partial<IAdjustedHeader>) => {
    dispatch({ type: 'UPDATE_CHILD_COLUMN', payload: { parentKey, childKey, update } });
  }, []);

  const updateFreezeColumn = useCallback((key: string, freezeType: 'left' | 'right', update: Partial<IAdjustedHeader>) => {
    dispatch({ type: 'UPDATE_FREEZE_COLUMN', payload: { key, freezeType, update } });
  }, []);

  const updateFreezeChildColumn = useCallback(
    (parentKey: string, childKey: string, freezeType: 'left' | 'right', update: Partial<IAdjustedHeader>) => {
      dispatch({
        type: 'UPDATE_FREEZE_CHILD_COLUMN',
        payload: { parentKey, childKey, freezeType, update },
      });
    },
    []
  );

  const toggleColumnVisibility = useCallback(
    (key: string) => {
      const column = state.columns.find((col) => col.key === key);
      if (column) {
        updateColumn(key, { visible: !column.visible });
      }
    },
    [state.columns, updateColumn]
  );

  const toggleFilterVisibility = useCallback(() => {
    dispatch({ type: 'TOGGLE_FILTER_VISIBILITY' });
  }, []);

  // Memoized context value
  const contextValue = useMemo<IHeaderContext>(
    () => ({
      columns: state.columns,
      flattenColumns,
      freezeLeftColumns: state.freezeLeftColumns,
      freezeRightColumns: state.freezeRightColumns,
      freezeLeftColumnsWidth,
      freezeRightColumnsWidth,
      isFilterVisible: state.isFilterVisible,
      getLeaves,
      getDepth,
      updateColumn,
      updateChildColumn,
      updateFreezeChildColumn,
      updateFreezeColumn,
      toggleColumnVisibility,
      toggleFilterVisibility,
    }),
    [
      state.columns,
      state.freezeLeftColumns,
      state.freezeRightColumns,
      state.isFilterVisible,
      flattenColumns,
      freezeLeftColumnsWidth,
      freezeRightColumnsWidth,
      getLeaves,
      getDepth,
      updateColumn,
      updateChildColumn,
      updateFreezeChildColumn,
      updateFreezeColumn,
      toggleColumnVisibility,
      toggleFilterVisibility,
    ]
  );

  return <HeaderCtx.Provider value={contextValue}>{children}</HeaderCtx.Provider>;
};
