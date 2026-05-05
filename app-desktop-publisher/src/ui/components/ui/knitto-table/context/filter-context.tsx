import { createContext, useContextSelector } from 'use-context-selector';
import { useMemo } from 'react';
import type { TFilterAdvanceConfig, TSortOrder } from '../lib';
import { useFilterAdvance, useFilterSearch, useFilterSelection, useFilterSort } from '../hooks';

// ==================== Types ====================
type IFilterContext = {
  tableKey?: string;
  filteredData: unknown[];
  isResetFilter?: boolean;
  sort: {
    sortKey: string | null;
    sortBy: TSortOrder;
    onChangeSort: (columnKey: string) => void;
    onChangeSpecificSort: (columnKey: string, sortBy: TSortOrder) => void;
  };
  search: {
    activeSearch: Record<string, string>;
    updateSearch: (columnkey: string, value: string) => void;
    resetSearch: (columnKey: string) => void;
  };
  selection: {
    updateFilter: (key: keyof unknown, value: string[]) => void;
    resetFilter: (key: keyof unknown) => void;
  };
  advance: {
    updateAdvanceFilter: (key: keyof unknown, config: TFilterAdvanceConfig, value: string) => void;
    resetAdvanceFilter: (key: keyof unknown) => void;
  };
};

type IFilterContextProvider<T> = {
  children: React.ReactNode;
  useSessionFilter?: { tableKey: string };
  dataSource: T[];
  isResetFilter?: boolean;
  useServerFilter?: {
    sort?: boolean;
    search?: boolean;
    selection?: boolean;
    advance?: boolean;
  };
  onChangeFilter?: {
    sort?: (key: keyof T, sortBy: TSortOrder) => void;
    search?: (data: Record<keyof T, string>) => void;
    selection?: (data: Record<keyof T, string[]>) => void;
    advance?: (data: Record<keyof T, { config_name: TFilterAdvanceConfig; value: string }>) => void;
  };
};

// ==================== Context ====================
const FilterCtx = createContext<IFilterContext | null>(null);

// ==================== Hooks ====================
export const useFilteredData = () => useContextSelector(FilterCtx, (ctx) => ctx?.filteredData ?? []);

export const useTableKey = () => useContextSelector(FilterCtx, (ctx) => ctx?.tableKey);

export const useIsResetFilter = () => useContextSelector(FilterCtx, (ctx) => ctx?.isResetFilter);

export const useSort = () => useContextSelector(FilterCtx, (ctx) => ctx?.sort)!;

export const useSortKey = () => useContextSelector(FilterCtx, (ctx) => ctx?.sort.sortKey ?? null);

export const useSortBy = () => useContextSelector(FilterCtx, (ctx) => ctx?.sort.sortBy)!;

export const useOnChangeSort = () => useContextSelector(FilterCtx, (ctx) => ctx?.sort.onChangeSort)!;

export const useOnChangeSpecificSort = () => useContextSelector(FilterCtx, (ctx) => ctx?.sort.onChangeSpecificSort)!;

export const useSearch = () => useContextSelector(FilterCtx, (ctx) => ctx?.search)!;

export const useActiveSearch = () => useContextSelector(FilterCtx, (ctx) => ctx?.search.activeSearch ?? {});

export const useUpdateSearch = () => useContextSelector(FilterCtx, (ctx) => ctx?.search.updateSearch)!;

export const useResetSearch = () => useContextSelector(FilterCtx, (ctx) => ctx?.search.resetSearch)!;

export const useSelection = () => useContextSelector(FilterCtx, (ctx) => ctx?.selection)!;

export const useUpdateFilter = () => useContextSelector(FilterCtx, (ctx) => ctx?.selection.updateFilter)!;

export const useResetFilter = () => useContextSelector(FilterCtx, (ctx) => ctx?.selection.resetFilter)!;

export const useAdvance = () => useContextSelector(FilterCtx, (ctx) => ctx?.advance)!;

export const useUpdateAdvanceFilter = () => useContextSelector(FilterCtx, (ctx) => ctx?.advance.updateAdvanceFilter)!;

export const useResetAdvanceFilter = () => useContextSelector(FilterCtx, (ctx) => ctx?.advance.resetAdvanceFilter)!;

// ==================== Provider ====================
export const FilterContextProvider = <T,>(props: IFilterContextProvider<T>): React.ReactElement => {
  const { children, dataSource, isResetFilter, useServerFilter, onChangeFilter, useSessionFilter } = props;

  const { sortKey, sortBy, handleSort, sortedData, handleSpecificSort } = useFilterSort({
    data: dataSource || [],
    isResetFilter,
    useServerSort: useServerFilter?.sort,
    onChangeSort: onChangeFilter?.sort as (key: string, sortBy: TSortOrder) => void,
  });

  const { searchedData, activeSearch, updateSearch, resetSearch } = useFilterSearch({
    data: sortedData || [],
    isResetFilter,
    useSessionFilter,
    useServerSearch: useServerFilter?.search,
    onChangeSearch: onChangeFilter?.search,
  });

  const { filteredData, updateFilter, resetFilter } = useFilterSelection({
    data: searchedData || [],
    isResetFilter,
    useSessionFilter,
    useServerFilter: useServerFilter?.selection,
    onChangeFilter: onChangeFilter?.selection,
  });

  const { filteredAdvanceData, updateAdvanceFilter, resetAdvanceFilter } = useFilterAdvance({
    data: filteredData || [],
    isResetFilter,
    useSessionFilter,
    useServerAdvanceFilter: useServerFilter?.advance,
    onChangeAdvanceFilter: onChangeFilter?.advance,
  });

  // Memoize sort object
  const sortValue = useMemo(
    () => ({
      sortBy,
      sortKey,
      onChangeSort: handleSort,
      onChangeSpecificSort: handleSpecificSort,
    }),
    [sortBy, sortKey, handleSort, handleSpecificSort]
  );

  // Memoize search object
  const searchValue = useMemo(
    () => ({
      activeSearch,
      updateSearch,
      resetSearch,
    }),
    [activeSearch, updateSearch, resetSearch]
  );

  // Memoize selection object
  const selectionValue = useMemo(
    () => ({
      updateFilter,
      resetFilter,
    }),
    [updateFilter, resetFilter]
  );

  // Memoize advance object
  const advanceValue = useMemo(
    () => ({
      updateAdvanceFilter,
      resetAdvanceFilter,
    }),
    [updateAdvanceFilter, resetAdvanceFilter]
  );

  // Memoize context value
  const contextValue = useMemo<IFilterContext>(
    () => ({
      tableKey: useSessionFilter?.tableKey,
      isResetFilter,
      filteredData: filteredAdvanceData,
      sort: sortValue,
      search: searchValue,
      selection: selectionValue,
      advance: advanceValue,
    }),
    [useSessionFilter?.tableKey, isResetFilter, filteredAdvanceData, sortValue, searchValue, selectionValue, advanceValue]
  );

  return <FilterCtx.Provider value={contextValue}>{children}</FilterCtx.Provider>;
};
