import { useCallback, useEffect, useMemo, useState } from 'react';
import type { TSortOrder } from '../lib';

interface ISortTable<TDataSource> {
  data: TDataSource[];
  useServerSort?: boolean;
  isResetFilter?: boolean;
  onChangeSort?: (sortKey: string, sortBy: TSortOrder) => void;
}

export default function useFilterSort<TDataSource>(props: ISortTable<TDataSource>) {
  const { data, useServerSort, onChangeSort, isResetFilter } = props;

  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<TSortOrder>('unset');

  useEffect(() => {
    if (isResetFilter) {
      setSortKey(null);
      setSortBy('unset');
    }
  }, [isResetFilter]);

  const sortedData = useMemo(() => {
    if (!sortKey || sortBy === 'unset') return data;
    if (useServerSort) return data;

    const sorted = [...data].sort((a, b) => {
      const aValue = a[sortKey as keyof TDataSource];
      const bValue = b[sortKey as keyof TDataSource];

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortBy === 'asc' ? -1 : 1;
      if (bValue == null) return sortBy === 'asc' ? 1 : -1;

      // Convert to string and normalize case for comparison
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();

      if (aStr < bStr) return sortBy === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortBy === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [data, sortKey, sortBy, useServerSort]);

  const handleSort = useCallback(
    (key: string) => {
      setSortKey((prevKey) => {
        const newSortBy = prevKey === key ? (sortBy === 'asc' ? 'desc' : sortBy === 'desc' ? 'unset' : 'asc') : 'asc';

        setSortBy(newSortBy);
        onChangeSort?.(key, newSortBy);

        return newSortBy === 'unset' ? null : key;
      });
    },
    [sortBy, onChangeSort]
  );

  const handleSpecificSort = useCallback(
    (key: string, sortBy: TSortOrder) => {
      setSortKey(sortBy === 'unset' ? null : key);
      setSortBy(sortBy);
      onChangeSort?.(key, sortBy);
    },
    [onChangeSort]
  );

  return { sortedData, handleSort, handleSpecificSort, sortKey, sortBy };
}
