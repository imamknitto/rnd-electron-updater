import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import useOnClickOutside from './use-click-outside';
import { SESSION_STORAGE_KEY } from '../lib';

interface IFilterTable<TDataSource> {
  data: TDataSource[];
  isResetFilter?: boolean;
  useServerFilter?: boolean;
  useSessionFilter?: { tableKey: string };
  onChangeFilter?: (data: Record<keyof TDataSource, string[]>) => void;
}

export default function useFilterSelection<TDataSource>(props: IFilterTable<TDataSource>) {
  const { data, isResetFilter, onChangeFilter, useServerFilter = false, useSessionFilter } = props;

  const filterCardRef = useRef<HTMLDivElement | null>(null);
  const [activeFilters, setActiveFilters] = useState<Record<keyof TDataSource, string[]>>({} as Record<keyof TDataSource, string[]>);

  const [isFilterCardOpen, setIsFilterCardOpen] = useState({ show: false, key: '' });

  const resetAllFilter = useCallback(() => setActiveFilters({} as Record<keyof TDataSource, string[]>), []);

  useEffect(() => {
    if (isResetFilter) resetAllFilter();
  }, [isResetFilter]);

  // reset session storage of filter selection per column on reload page
  useEffect(() => {
    if (!useSessionFilter) return;

    window.addEventListener('beforeunload', () => {
      sessionStorage.removeItem(SESSION_STORAGE_KEY.FILTER_SELECTION_PER_COLUMN);
    });

    return () => {
      window.removeEventListener('beforeunload', () => {});
    };
  }, [useSessionFilter]);

  useOnClickOutside([filterCardRef], () => setIsFilterCardOpen({ show: false, key: '' }));

  const setToSessionStorage = useCallback(
    (data: Record<keyof TDataSource, string[]>) => {
      sessionStorage.setItem(
        SESSION_STORAGE_KEY.FILTER_SELECTION_PER_COLUMN,
        JSON.stringify({
          ...JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY.FILTER_SELECTION_PER_COLUMN) || '{}'),
          [useSessionFilter?.tableKey || '']: data,
        })
      );
    },
    [useSessionFilter]
  );

  const filteredData = useMemo(() => {
    if (Object.keys(activeFilters).length === 0) return data;
    if (useServerFilter) return data;

    return data.filter((row) => {
      return Object.entries(activeFilters).every(([columnName, filterValues]) => {
        const rowValue = row[columnName as keyof TDataSource]; // Bisa berupa angka atau string
        const filterValue = (filterValues as (string | number)[]).map((val) => (typeof rowValue === 'number' ? Number(val) : String(val)));

        return filterValue.some((value) => rowValue === value); // Pastikan tipe sama sebelum compare
      });
    });
  }, [data, activeFilters, useServerFilter]);

  const updateFilter = useCallback(
    (dataKey: keyof TDataSource | string, filterValues: string[]) => {
      setActiveFilters((prev) => {
        const newFilters = { ...prev };

        if (filterValues.length === 0) {
          delete newFilters[dataKey as keyof TDataSource];
        } else {
          newFilters[dataKey as keyof TDataSource] = filterValues;
        }

        onChangeFilter?.(newFilters);
        if (useSessionFilter) setToSessionStorage(newFilters);

        return newFilters;
      });

      setIsFilterCardOpen({ show: false, key: '' });
    },
    [onChangeFilter]
  );

  const resetFilter = useCallback(
    (dataKey: keyof TDataSource | string) => {
      setActiveFilters((prev) => {
        const newFilters = { ...prev };
        delete newFilters[dataKey as keyof TDataSource];
        onChangeFilter?.(newFilters);
        if (useSessionFilter) setToSessionStorage(newFilters);
        return newFilters;
      });
      setIsFilterCardOpen({ show: false, key: '' });
    },
    [onChangeFilter]
  );

  return {
    filteredData,
    filterCardRef,
    isFilterCardOpen,
    updateFilter,
    resetFilter,
    activeFilters,
    resetAllFilter,
  };
}
