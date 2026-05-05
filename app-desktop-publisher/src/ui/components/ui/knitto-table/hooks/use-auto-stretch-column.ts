import type { Virtualizer } from '@tanstack/react-virtual';
import { useEffect } from 'react';
import { DEFAULT_SIZE, type IAdjustedHeader, type IHeader } from '../lib';

interface IAutoStretchColumn {
  containerWidth: number;
  columns: IHeader<unknown>[];
  columnVirtualizer: Virtualizer<HTMLDivElement, Element> | null;
  freezeLeftColumnsWidth?: number;
  freezeRightColumnsWidth?: number;
  updateColumn?: (key: string, update: Partial<IAdjustedHeader>) => void;
  updateChildColumn?: (parentKey: string, childKey: string, update: Partial<IAdjustedHeader>) => void;
}

export function useAutoStretchColumn(props: IAutoStretchColumn) {
  const {
    containerWidth,
    columns,
    columnVirtualizer,
    freezeLeftColumnsWidth = 0,
    freezeRightColumnsWidth = 0,
    updateColumn,
    updateChildColumn,
  } = props;

  const availableWidth = containerWidth - freezeLeftColumnsWidth - freezeRightColumnsWidth;

  useEffect(() => {
    if (availableWidth <= 0) return;

    const hasVirtualizer = !!columnVirtualizer;
    const hasContextUpdaters = !!updateColumn;

    if (!hasVirtualizer && !hasContextUpdaters) return;

    // Get all visible columns that can be stretched (exclude columns with children)
    const visibleColumns = columns.filter((column) => column.visible && !column.noStretch && !column.children?.length);

    // Pakai default size kalau ga ada width
    const getColumnWidth = (column: IHeader<unknown>): number => column.width ?? DEFAULT_SIZE.COLUMN_WIDTH;

    // Total width kolom yang bisa di-stretch (tanpa children)
    const totalWidth = visibleColumns.reduce((sum, column) => sum + getColumnWidth(column), 0);

    // Total width kolom yang tidak di-stretch: punya children ATAU noStretch
    const totalNonStretchWidth = columns
      .filter((c) => c.visible && (c.children?.length || c.noStretch))
      .reduce((sum, c) => sum + getColumnWidth(c), 0);

    // Available width untuk stretch
    const availableForStretch = availableWidth - totalNonStretchWidth;

    // Only stretch if total width is less than available width
    if (totalWidth >= availableForStretch || totalWidth <= 0) return;

    const scale = availableForStretch / totalWidth;

    visibleColumns.forEach((column) => {
      const newWidth = getColumnWidth(column) * scale;
      const finalWidth = Math.max(50, newWidth);

      if (hasVirtualizer && columnVirtualizer) {
        const columnIndex = columns.indexOf(column);
        columnVirtualizer.resizeItem(columnIndex, finalWidth);
      } else if (hasContextUpdaters && updateColumn) {
        updateColumn(column.key, { width: finalWidth });
      }
    });
  }, [availableWidth, columns, columnVirtualizer, updateColumn, updateChildColumn]);
}
