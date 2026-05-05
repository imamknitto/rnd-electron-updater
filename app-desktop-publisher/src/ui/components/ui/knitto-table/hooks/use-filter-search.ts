import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useOnClickOutside from './use-click-outside';
import { SESSION_STORAGE_KEY } from '../lib';

interface ISearchTable<TDataSource> {
  data: TDataSource[];
  isResetFilter?: boolean;
  useServerSearch?: boolean;
  useSessionFilter?: { tableKey: string };
  onChangeSearch?: (data: Record<keyof TDataSource, string>) => void;
}

export default function useFilterSearch<TDataSource>(props: ISearchTable<TDataSource>) {
  const { data, useServerSearch, onChangeSearch, isResetFilter, useSessionFilter } = props;

  const searchCardRef = useRef<HTMLDivElement | null>(null);
  const [isSearchCardOpen, setIsSearchCardOpen] = useState({ show: false, key: '' });

  const [activeSearch, seActiveSearch] = useState<Record<keyof TDataSource, string>>({} as Record<keyof TDataSource, string>);

  // reset session storage of search per column on reload page
  useEffect(() => {
    if (!useSessionFilter) return;

    window.addEventListener('beforeunload', () => {
      sessionStorage.removeItem('search_per_column');
    });

    return () => {
      window.removeEventListener('beforeunload', () => {});
    };
  }, [useSessionFilter]);

  useEffect(() => {
    if (isResetFilter) seActiveSearch({} as Record<keyof TDataSource, string>);
  }, [isResetFilter]);

  useOnClickOutside([searchCardRef], () => setIsSearchCardOpen({ show: false, key: '' }));

  const setToSessionStorage = useCallback(
    (data: Record<keyof TDataSource, string>) => {
      sessionStorage.setItem(
        SESSION_STORAGE_KEY.SEARCH_PER_COLUMN,
        JSON.stringify({
          ...JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY.SEARCH_PER_COLUMN) || '{}'),
          [useSessionFilter?.tableKey || '']: data,
        })
      );
    },
    [useSessionFilter]
  );

  const searchedData = useMemo(() => {
    if (!activeSearch || Object.keys(activeSearch).length === 0) return data || [];
    if (useServerSearch) return data;

    return (data || []).filter((row) =>
      Object.entries(activeSearch).every(([dataKey, searchValue]) =>
        (searchValue as string).length === 0
          ? true
          : row[dataKey as keyof TDataSource]
              ?.toString()
              ?.toLowerCase()
              ?.includes((searchValue as string).toLowerCase())
      )
    );
  }, [data, activeSearch, useServerSearch]);

  const updateSearch = useCallback(
    (dataKey: keyof TDataSource | string, searchValue: string) => {
      //   gridRef.current?.scrollTo({ scrollTop: 0 });

      seActiveSearch((prev) => {
        const newSearch = { ...prev };

        if (searchValue.length === 0) {
          delete newSearch[dataKey as keyof TDataSource];
        } else {
          newSearch[dataKey as keyof TDataSource] = searchValue;
        }

        onChangeSearch?.(newSearch);
        if (useSessionFilter) setToSessionStorage(newSearch);

        return newSearch;
      });

      setIsSearchCardOpen({ show: false, key: '' });
    },
    [onChangeSearch]
  );

  const resetSearch = useCallback(
    (dataKey: keyof TDataSource | string) => {
      function removeKeyImmutable<K extends keyof TDataSource>(
        source: Record<keyof TDataSource, string>,
        key: K
      ): Record<Exclude<keyof TDataSource, K>, string> {
        const { [key]: _unused, ...rest } = source;
        return rest;
      }

      const newActiveSearch = removeKeyImmutable(activeSearch, dataKey as keyof TDataSource);

      seActiveSearch(newActiveSearch as Record<keyof TDataSource, string>);
      onChangeSearch?.(newActiveSearch as Record<keyof TDataSource, string>);
      if (useSessionFilter) setToSessionStorage(newActiveSearch as Record<keyof TDataSource, string>);

      setIsSearchCardOpen({ show: false, key: '' });
    },
    [onChangeSearch, activeSearch]
  );

  const resetAllSearch = useCallback(() => seActiveSearch({} as Record<keyof TDataSource, string>), []);

  return {
    searchedData,
    searchCardRef,
    isSearchCardOpen,
    updateSearch,
    resetSearch,
    activeSearch,
    resetAllSearch,
  };
}
