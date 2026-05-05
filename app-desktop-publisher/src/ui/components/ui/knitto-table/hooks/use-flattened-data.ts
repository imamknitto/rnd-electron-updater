import { useMemo } from 'react';

export default function useFlattenedData<T>(
  data: T[] | undefined,
  expanded: Set<string | number>,
  rowKey: keyof T | ((data: T, index: number) => string)
) {
  return useMemo(() => {
    if (!data) return [];

    return data.flatMap((item) => {
      const key = rowKey;
      return expanded.has(key.toString())
        ? [
            { type: 'row', item },
            { type: 'expanded', item },
          ]
        : [{ type: 'row', item }];
    });
  }, [data, expanded, rowKey]);
}
