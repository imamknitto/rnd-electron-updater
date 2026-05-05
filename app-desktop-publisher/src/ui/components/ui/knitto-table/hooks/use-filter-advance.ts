import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import useOnClickOutside from './use-click-outside';
import { SESSION_STORAGE_KEY, type TFilterAdvanceConfig } from '../lib';

type IActiveAdvanceFilters<T> = Record<keyof T, { config_name: TFilterAdvanceConfig; value: string }>;

interface IAdvanceFilterTable<TDataSource> {
  data: TDataSource[];
  useServerAdvanceFilter?: boolean;
  isResetFilter?: boolean;
  useSessionFilter?: { tableKey: string };
  onChangeAdvanceFilter?: (data: IActiveAdvanceFilters<TDataSource>) => void;
}

export default function useFilterAdvance<TDataSource>(props: IAdvanceFilterTable<TDataSource>) {
  const { data, isResetFilter, onChangeAdvanceFilter, useServerAdvanceFilter = false, useSessionFilter } = props;

  const filterAdvanceCardRef = useRef<HTMLDivElement | null>(null);
  const [isFilterAdvanceCardOpen, setIsFilterAdvanceCardOpen] = useState({ show: false, key: '' });
  const [activeAdvanceFilters, setActiveAdvanceFilters] = useState<IActiveAdvanceFilters<TDataSource>>({} as IActiveAdvanceFilters<TDataSource>);

  useEffect(() => {
    if (isResetFilter) setActiveAdvanceFilters({} as IActiveAdvanceFilters<TDataSource>);
  }, [isResetFilter]);

  // reset session storage of filter advance per column on reload page
  useEffect(() => {
    if (!useSessionFilter) return;

    window.addEventListener('beforeunload', () => {
      sessionStorage.removeItem(SESSION_STORAGE_KEY.FILTER_ADVANCE_PER_COLUMN);
    });

    return () => {
      window.removeEventListener('beforeunload', () => {});
    };
  }, [useSessionFilter]);

  useOnClickOutside([filterAdvanceCardRef], () => setIsFilterAdvanceCardOpen({ show: false, key: '' }));

  const setToSessionStorage = useCallback(
    (data: Record<keyof TDataSource, { config_name: TFilterAdvanceConfig; value: string }>) => {
      sessionStorage.setItem(
        SESSION_STORAGE_KEY.FILTER_ADVANCE_PER_COLUMN,
        JSON.stringify({
          ...JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY.FILTER_ADVANCE_PER_COLUMN) || '{}'),
          [useSessionFilter?.tableKey || '']: data,
        })
      );
    },
    [useSessionFilter]
  );

  const filteredAdvanceData = useMemo(() => {
    if (Object.keys(activeAdvanceFilters).length === 0) return data;
    if (useServerAdvanceFilter) return data;

    return data.filter((item) => {
      return Object.entries(activeAdvanceFilters).every(([key, filter]) => {
        const itemValue = String(item[key as keyof TDataSource]).toLowerCase();
        const filterValue = (filter as { value: string })?.value?.toLowerCase();

        switch ((filter as { config_name: TFilterAdvanceConfig })?.config_name) {
          case 'equal':
            return itemValue === filterValue;
          case 'notEqual':
            return itemValue !== filterValue;
          case 'startsWith':
            return itemValue.startsWith(filterValue);
          case 'endsWith':
            return itemValue.endsWith(filterValue);
          case 'contains':
            return itemValue.includes(filterValue);
          case 'notContains':
            return !itemValue.includes(filterValue);
          default:
            return true;
        }
      });
    });
  }, [data, activeAdvanceFilters, useServerAdvanceFilter]);

  const updateAdvanceFilter = useCallback(
    (dataKey: keyof TDataSource | string, config_name: TFilterAdvanceConfig, value: string) => {
      setActiveAdvanceFilters((prev) => {
        const newFilters = {
          ...prev,
          [dataKey]: { config_name, value },
        };

        onChangeAdvanceFilter?.(newFilters);
        if (useSessionFilter) setToSessionStorage(newFilters);

        return newFilters;
      });
      setIsFilterAdvanceCardOpen({ show: false, key: '' });
    },
    [onChangeAdvanceFilter]
  );

  const resetAdvanceFilter = useCallback(
    (dataKey: keyof TDataSource | string) => {
      setActiveAdvanceFilters((prev) => {
        const newFilters = { ...prev };
        delete newFilters[dataKey as keyof TDataSource];

        onChangeAdvanceFilter?.(newFilters);
        if (useSessionFilter) setToSessionStorage(newFilters);

        return newFilters;
      });
      setIsFilterAdvanceCardOpen({ show: false, key: '' });
    },
    [onChangeAdvanceFilter]
  );

  return {
    filteredAdvanceData,
    filterAdvanceCardRef,
    isFilterAdvanceCardOpen,
    setIsFilterAdvanceCardOpen,
    updateAdvanceFilter,
    resetAdvanceFilter,
    activeAdvanceFilters,
  };
}
