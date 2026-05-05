import { useEffect, useState, useCallback } from 'react';

type FlattenedItem<T> = {
  type: 'row' | 'expanded';
  item: T;
  key: string;
};

export default function useFlattenedDataIncremental<T>(data: T[] | undefined, rowKey: keyof T | ((data: T, index: number) => string)) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [flattenedData, setFlattenedData] = useState<FlattenedItem<T>[]>([]);

  const getRowKey = useCallback((item: T, index: number) => (typeof rowKey === 'function' ? rowKey(item, index) : String(item[rowKey])), [rowKey]);

  useEffect(() => {
    if (!data) {
      setFlattenedData([]);
      return;
    }

    const initial: FlattenedItem<T>[] = [];
    data.forEach((item, idx) => {
      const key = getRowKey(item, idx);
      initial.push({ type: 'row', item, key });
      if (expandedRows.has(key)) {
        initial.push({ type: 'expanded', item, key });
      }
    });

    setFlattenedData(initial);
    setExpandedRows(new Set(expandedRows));
  }, [data, getRowKey]);

  const toggleExpand = useCallback((rowKey: string) => {
    setFlattenedData((prev) => {
      const rowIndexByKey = prev.findIndex((d) => d.type === 'row' && d.key === rowKey);
      if (rowIndexByKey === -1) return prev;

      const nextRow = prev[rowIndexByKey + 1];
      const isExpanded = nextRow?.type === 'expanded';

      // Collapse:
      if (isExpanded) {
        // Hapus baris expanded dari Set<string>
        setExpandedRows((prevExpanded) => {
          const next = new Set(prevExpanded);
          next.delete(rowKey);
          return next;
        });

        // Hapus baris expanded dari FlattenedData
        return [...prev.slice(0, rowIndexByKey + 1), ...prev.slice(rowIndexByKey + 2)];
      } else {
        // Expand
        // Tambahkan baris expanded ke Set<string>
        setExpandedRows((prevExpanded) => {
          const next = new Set(prevExpanded);
          next.add(rowKey);
          return next;
        });

        // Sisipkan baris expanded ke FlattenedData
        return [
          ...prev.slice(0, rowIndexByKey + 1),
          { type: 'expanded', item: prev[rowIndexByKey].item, key: rowKey },
          ...prev.slice(rowIndexByKey + 1),
        ];
      }
    });
  }, []);

  return {
    flattenedData,
    toggleExpand,
    expandedKeys: expandedRows,
  };
}
