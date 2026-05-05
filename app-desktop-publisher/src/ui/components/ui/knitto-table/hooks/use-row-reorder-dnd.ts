import { useCallback, useMemo, useRef } from 'react';
import { IAdjustedHeader, IFlattenedData } from '../lib';

interface IUseRowReorderDndProps<TData> {
  freezeLeftColumns: IAdjustedHeader[];
  columns: IAdjustedHeader[];
  freezeRightColumns: IAdjustedHeader[];
  flattenedData: IFlattenedData<TData>[];
  rowHeight: number;
  reorderOnlyFromToggle?: boolean;
  onReorderRowsToParent?: (fromIndex: number, toIndex: number) => void;
}

export function useRowReorderDnd<TData>(props: IUseRowReorderDndProps<TData>) {
  const { freezeLeftColumns, columns, freezeRightColumns, flattenedData, rowHeight, reorderOnlyFromToggle, onReorderRowsToParent } = props;

  const dragImageRef = useRef<HTMLElement | null>(null);

  const getDataRowIndex = useCallback(
    (flattenedIndex: number): number => flattenedData.slice(0, flattenedIndex).filter((x) => x.type === 'row').length,
    [flattenedData]
  );
  const hasReorderColumn = useMemo(() => {
    const checkColumns = (cols: IAdjustedHeader[]): boolean =>
      cols.some((col) => (col?.key === 'row-reorder' ? true : col.children ? checkColumns(col.children) : false));
    return checkColumns(freezeLeftColumns) || checkColumns(columns || []) || checkColumns(freezeRightColumns);
  }, [freezeLeftColumns, columns, freezeRightColumns]);

  const createRowDragImage = useCallback((e: React.DragEvent): HTMLElement | null => {
    const rowEl = (e.target as HTMLElement).closest('[data-index]') as HTMLElement | null;
    if (!rowEl) return null;

    const rect = rowEl.getBoundingClientRect();
    const isDark = document.documentElement.classList.contains('dark');
    const clone = rowEl.cloneNode(true) as HTMLElement;

    clone.style.cssText = `
      position: fixed;
      left: -9999px;
      top: 0;
      width: ${rect.width}px;
      min-width: ${rect.width}px;
      max-width: min(500px, ${rect.width}px);
      box-shadow: 0 10px 40px rgba(0,0,0,${isDark ? 0.4 : 0.15});
      border-radius: 8px;
      opacity: 0.95;
      pointer-events: none;
      background: ${isDark ? 'rgb(0 0 0 / 0.5)' : 'white'};
      overflow: hidden;
    `;

    document.body.appendChild(clone);
    dragImageRef.current = clone;
    return clone;
  }, []);

  const cleanupDragImage = useCallback(() => {
    if (dragImageRef.current?.parentNode) {
      dragImageRef.current.parentNode.removeChild(dragImageRef.current);
      dragImageRef.current = null;
    }
  }, []);

  const handleReorderDragStart = useCallback(
    (e: React.DragEvent, flattenedIndex: number) => {
      const rowItem = flattenedData[flattenedIndex];
      if (rowItem?.type !== 'row') return;
      (e.target as HTMLElement).style.opacity = '0.5';
      e.dataTransfer.setData('text/plain', String(getDataRowIndex(flattenedIndex)));
      e.dataTransfer.effectAllowed = 'move';

      const dragImage = createRowDragImage(e);
      if (dragImage) {
        const rect = (e.target as HTMLElement).closest('[data-index]')?.getBoundingClientRect();
        const offsetX = rect ? Math.min(20, rect.width / 2) : 20;
        const offsetY = rect ? rect.height / 2 : rowHeight / 2;
        e.dataTransfer.setDragImage(dragImage, offsetX, offsetY);
      }
    },
    [flattenedData, getDataRowIndex, createRowDragImage, rowHeight]
  );

  const handleReorderDragEnd = useCallback(
    (e: React.DragEvent) => {
      (e.target as HTMLElement).style.opacity = '1';
      cleanupDragImage();
    },
    [cleanupDragImage]
  );

  const handleDragStart = useCallback(
    (e: React.DragEvent, flattenedIndex: number) => {
      const rowItem = flattenedData[flattenedIndex];
      if (rowItem?.type !== 'row') return;
      (e.target as HTMLElement).style.opacity = '0.5';
      e.dataTransfer.setData('text/plain', String(getDataRowIndex(flattenedIndex)));
      e.dataTransfer.effectAllowed = 'move';
    },
    [flattenedData, getDataRowIndex, createRowDragImage]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDragEnd = useCallback(
    (e: React.DragEvent) => {
      (e.target as HTMLElement).style.opacity = '1';
      cleanupDragImage();
    },
    [cleanupDragImage]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent, flattenedIndex: number) => {
      e.preventDefault();
      const rowItem = flattenedData[flattenedIndex];
      if (rowItem?.type !== 'row') return;
      const toDataIndex = getDataRowIndex(flattenedIndex);
      const fromDataIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
      if (fromDataIndex !== toDataIndex) onReorderRowsToParent?.(fromDataIndex, toDataIndex);
    },
    [flattenedData, getDataRowIndex, onReorderRowsToParent]
  );

  const useToggleOnlyToReorder = reorderOnlyFromToggle && hasReorderColumn && !!onReorderRowsToParent;

  const getReorderProps = useCallback(
    (flattenedIndex: number) =>
      useToggleOnlyToReorder
        ? {
            enableReorderFromColumnOnly: true,
            onReorderDragStart: (e: React.DragEvent) => handleReorderDragStart(e, flattenedIndex),
            onReorderDragEnd: handleReorderDragEnd,
            onReorderRowsToParent: !!onReorderRowsToParent,
          }
        : {
            enableReorderFromColumnOnly: false,
            onReorderRowsToParent: !!onReorderRowsToParent,
          },
    [useToggleOnlyToReorder, handleReorderDragStart, handleReorderDragEnd, onReorderRowsToParent]
  );

  const state = { hasReorderColumn, useToggleOnlyToReorder };
  const func = { handleReorderDragStart, handleReorderDragEnd, handleDragStart, handleDragOver, handleDragEnd, handleDrop, getReorderProps };

  return { state, func };
}
