import { useMemo } from 'react';
import type { IHeader } from '../lib';

export type RowSpanData = {
  rowSpan: number;
  shouldRender: boolean;
  spanStartRow: number; // NOTE: Row pertama dari span
  spanEndRow: number; // NOTE: Row terakhir dari span (inclusive)
};

/**
 * Hook untuk menghitung rowspan pada cell yang punya nilai duplicate secara berurutan.
 * Return Map dengan format key: `${columnKey}-${rowIndex}` dan value: { rowSpan, shouldRender }
 *
 * @example
 * // Data:
 * [
 *   { category: 'A', name: 'X' },
 *   { category: 'A', name: 'Y' },  // Same category
 *   { category: 'B', name: 'Z' },
 * ]
 *
 * // Result Map:
 * {
 *   'category-0': { rowSpan: 2, shouldRender: true },   // Render dengan rowspan=2
 *   'category-1': { rowSpan: 0, shouldRender: false },  // Skip (sudah di-merge)
 *   'category-2': { rowSpan: 1, shouldRender: true },   // Render normal
 * }
 */
export const useRowSpanCalculator = <TData>(data: TData[], columns: IHeader<unknown>[]): Map<string, RowSpanData> => {
  return useMemo(() => {
    const rowSpanMap = new Map<string, RowSpanData>();

    if (!data || data.length === 0) return rowSpanMap;

    // NOTE: Process setiap kolom yang punya flag enableRowSpan
    columns.forEach((column) => {
      if (!column.enableRowSpan) return;

      // NOTE: Skip kolom khusus yang tidak boleh di-rowspan
      const isSpecialColumn = column.key === 'row-selection' || column.key === 'expand' || column.key === 'action' || column.key === 'row-reorder';

      if (isSpecialColumn) return;

      let currentValue: unknown = null;
      let spanStartRow = 0;
      let spanCount = 0;

      data.forEach((item, rowIndex) => {
        const cellKey = `${String(column.key)}-${rowIndex}`;
        const cellValue = item[column.key as keyof TData];

        // NOTE: Convert ke string untuk comparison (handle null/undefined dengan baik)
        const cellValueStr = cellValue === null || cellValue === undefined ? '' : String(cellValue);
        const currentValueStr = currentValue === null || currentValue === undefined ? '' : String(currentValue);

        if (cellValueStr === currentValueStr && rowIndex > 0) {
          // NOTE: Value sama dengan row sebelumnya, increment span count
          spanCount++;
          // Tandai cell ini sebagai "skip render" karena akan di-merge dengan cell di atasnya
          rowSpanMap.set(cellKey, {
            rowSpan: 0,
            shouldRender: false,
            spanStartRow,
            spanEndRow: rowIndex, // NOTE: Update end row terus menerus
          });
        } else {
          // NOTE: Value berbeda, finalize span sebelumnya
          if (spanCount > 1) {
            const startKey = `${String(column.key)}-${spanStartRow}`;
            // Update cell pertama dengan rowSpan yang sebenarnya dan range info
            rowSpanMap.set(startKey, {
              rowSpan: spanCount,
              shouldRender: true,
              spanStartRow,
              spanEndRow: rowIndex - 1,
            });
          }

          // NOTE: Mulai span baru
          currentValue = cellValue;
          spanStartRow = rowIndex;
          spanCount = 1;
          rowSpanMap.set(cellKey, {
            rowSpan: 1,
            shouldRender: true,
            spanStartRow: rowIndex,
            spanEndRow: rowIndex,
          });
        }

        // NOTE: Handle row terakhir - finalize span jika masih ada yang pending
        if (rowIndex === data.length - 1 && spanCount > 1) {
          const startKey = `${String(column.key)}-${spanStartRow}`;
          rowSpanMap.set(startKey, {
            rowSpan: spanCount,
            shouldRender: true,
            spanStartRow,
            spanEndRow: rowIndex,
          });
        }
      });
    });

    return rowSpanMap;
  }, [data, columns]);
};

export default useRowSpanCalculator;
