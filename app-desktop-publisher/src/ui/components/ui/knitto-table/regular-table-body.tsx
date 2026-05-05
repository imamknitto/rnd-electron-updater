import { Fragment } from 'react/jsx-runtime';
import { memo, type ReactNode, useMemo, useCallback } from 'react';
import clsx from 'clsx';

import NativeTableCell from './components/native-table-cell';
import RowCheckbox from './components/body/row-checkbox';
import RowExpand from './components/body/row-expand';
import RowReorder from './components/body/row-reorder';
import type { IHeader, IKnittoTable, IAdjustedHeader } from './lib';
import { useFlattenColumns, useColumns, useFreezeLeftColumns, useFreezeRightColumns } from './context/header-context';
import { useFilteredData } from './context/filter-context';
import { useRowSpanCalculator } from './hooks/use-rowspan-calculator';
import { useRowReorderDnd } from './hooks';

// Utility functions for freeze position calculations
const getFreezeLeftPosition = (columns: IAdjustedHeader[], currentIndex: number) => {
  const currentColumn = columns[currentIndex];
  if (currentColumn?.freeze !== 'left') return 0;

  let leftPosition = 0;
  for (let i = 0; i < currentIndex; i++) {
    if (columns[i].freeze === 'left') {
      leftPosition += columns[i].width || 0;
    }
  }
  return leftPosition;
};

const getFreezeRightPosition = (columns: IAdjustedHeader[], currentIndex: number) => {
  const currentColumn = columns[currentIndex];
  if (currentColumn?.freeze !== 'right') return 0;

  let rightPosition = 0;
  // Hitung dari kolom saat ini ke kanan
  for (let i = currentIndex + 1; i < columns.length; i++) {
    if (columns[i].freeze === 'right') {
      rightPosition += columns[i].width || 0;
    }
  }
  return rightPosition;
};
import {
  useDeselectedRowKeys,
  useExpandedRowKeys,
  useOnClickRow,
  useSelectAll,
  useSelectedRowKey,
  useSelectedRowKeys,
  useSelectedRowWithSpanKeys,
  useToggleExpandRow,
  useToggleRowSelection,
  useSetSelectedRowWithSpanKeys,
} from './context/selection-context';
import { useClassNameCell, useExpandedContent, useUseDynamicRowHeight } from './context/ui-context';

interface IRegularTableBody<TData> {
  rowKey: keyof TData | ((data: TData, index: number) => string);
  rowHeight: number;
  onClickRowToParent?: IKnittoTable<TData>['onClickRow'];
  onDoubleClickRowToParent?: IKnittoTable<TData>['onDoubleClickRow'];
  onRightClickRowToParent?: IKnittoTable<TData>['onRightClickRow'];
  onReorderRowsToParent?: IKnittoTable<TData>['onReorderRows'];
  reorderOnlyFromToggle?: boolean;
}

function RegularTableBody<TData>({
  rowKey,
  rowHeight,
  onClickRowToParent,
  onDoubleClickRowToParent,
  onRightClickRowToParent,
  onReorderRowsToParent,
  reorderOnlyFromToggle = false,
}: IRegularTableBody<TData>) {
  const flattenColumnsData = useFlattenColumns();
  const filteredData = useFilteredData() as TData[];

  const selectAll = useSelectAll();
  const onClickRow = useOnClickRow();
  const selectedRowKey = useSelectedRowKey();
  const selectedRowWithSpanKeys = useSelectedRowWithSpanKeys();
  const selectedRowKeys = useSelectedRowKeys();
  const deselectedRowKeys = useDeselectedRowKeys();
  const toggleRowSelection = useToggleRowSelection();
  const toggleExpandRow = useToggleExpandRow();
  const expandedRowKeys = useExpandedRowKeys();
  const expandedContent = useExpandedContent();
  const useDynamicRowHeight = useUseDynamicRowHeight();
  const setSelectedRowWithSpanKeys = useSetSelectedRowWithSpanKeys();
  const classNameCell = useClassNameCell();

  // NOTE: Ambil semua leaf columns dari flattened columns data (handle grouped headers)
  const flattenedColumns = useMemo(() => flattenColumnsData.map((item) => item.col), [flattenColumnsData]);

  const getRowKey = useCallback(
    (item: TData, index: number): string => {
      if (typeof rowKey === 'function') {
        return rowKey(item, index);
      }
      return String(item[rowKey]);
    },
    [rowKey]
  );

  // NOTE: Cache row keys untuk performa yang lebih baik
  const rowKeysMap = useMemo(() => {
    const map = new Map<number, string>();
    filteredData.forEach((item, index) => {
      map.set(index, getRowKey(item, index));
    });
    return map;
  }, [filteredData, getRowKey]);

  // Helper function untuk get cached key
  const getCachedRowKey = useCallback(
    (index: number): string => {
      return rowKeysMap.get(index) || getRowKey(filteredData[index], index);
    },
    [rowKeysMap, filteredData, getRowKey]
  );

  const freezeLeftColumns = useFreezeLeftColumns();
  const freezeRightColumns = useFreezeRightColumns();
  const columns = useColumns();

  const flattenedData = useMemo(
    () =>
      filteredData.map((item) => ({
        type: 'row' as const,
        item,
      })),
    [filteredData]
  );

  const { func: dndFunc, state: dndState } = useRowReorderDnd({
    freezeLeftColumns,
    columns,
    freezeRightColumns,
    flattenedData,
    rowHeight,
    onReorderRowsToParent,
    reorderOnlyFromToggle,
  });

  // NOTE: Hitung rowspan untuk kolom yang punya flag enableRowSpan
  // Return Map dengan info cell mana yang harus di-render dan cell mana yang di-skip (merged)
  const rowSpanMap = useRowSpanCalculator(filteredData, flattenedColumns);

  const handleClickRow = useCallback(
    (item: TData, rowIndex: number, columnIndex: number) => {
      const key = getCachedRowKey(rowIndex);

      const column = flattenedColumns[columnIndex] as IHeader<TData>;
      const cellKey = `${String(column.key)}-${rowIndex}`;
      const rowSpanData = rowSpanMap.get(cellKey);

      const keysToAdd: string[] = [];
      const groupOfItems: TData[] = [];

      // NOTE: Jika cell ini punya rowspan, tambahkan semua row yang di-spannya ke selectedRowWithSpanKeys
      if (rowSpanData && rowSpanData.rowSpan > 1 && rowSpanData.shouldRender) {
        for (let i = rowSpanData.spanStartRow; i <= rowSpanData.spanEndRow; i++) {
          const key = getCachedRowKey(i);
          keysToAdd.push(key);
          groupOfItems.push(filteredData[i]);
        }
      } else {
        keysToAdd.push(key);
      }

      if (rowSpanMap.size > 0) {
        setSelectedRowWithSpanKeys(keysToAdd);
        onClickRowToParent?.(item, rowIndex, columnIndex, groupOfItems);
      } else {
        onClickRow?.(key);
        onClickRowToParent?.(item, rowIndex, columnIndex);
      }
    },
    [flattenedColumns, rowSpanMap, setSelectedRowWithSpanKeys, onClickRowToParent, onClickRow, getCachedRowKey, filteredData]
  );

  const handleDoubleClickRow = useCallback(
    (item: TData, rowIndex: number, columnIndex: number) => {
      onDoubleClickRowToParent?.(item, rowIndex, columnIndex);
    },
    [onDoubleClickRowToParent]
  );

  const handleRightClickRow = useCallback(
    (item: TData, e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (!onRightClickRowToParent) return;

      e.preventDefault();
      onRightClickRowToParent?.(item, { x: e.clientX, y: e.clientY });
    },
    [onRightClickRowToParent]
  );

  const handleCheckboxChange = useCallback(
    (_item: TData, rowIndex: number) => {
      const key = getCachedRowKey(rowIndex);
      toggleRowSelection(key);
    },
    [toggleRowSelection, getCachedRowKey]
  );

  const handleExpandToggle = useCallback(
    (_item: TData, rowIndex: number) => {
      const key = getCachedRowKey(rowIndex);
      toggleExpandRow(key);
    },
    [toggleExpandRow, getCachedRowKey]
  );

  // Helper function untuk cek apakah cell ini harus di-highlight
  const checkCellHighlighting = useCallback(
    (_item: TData, rowIndex: number, cellKey: string) => {
      const key = getCachedRowKey(rowIndex);

      if (rowSpanMap.size === 0) {
        // Tidak ada rowspan, gunakan logika biasa
        return key === selectedRowKey;
      }

      // Ada rowspan, cek apakah row ini ada di selectedRowWithSpanKeys
      if (selectedRowWithSpanKeys.includes(key)) {
        return true;
      }

      // Jika cell ini punya rowspan, cek apakah ada row yang di-spannya terpilih
      const rowSpanData = rowSpanMap.get(cellKey);
      if (rowSpanData && rowSpanData.shouldRender && rowSpanData.rowSpan > 1) {
        for (let i = rowSpanData.spanStartRow; i <= rowSpanData.spanEndRow; i++) {
          const spanRowKey = getCachedRowKey(i);
          if (selectedRowWithSpanKeys.includes(spanRowKey)) {
            return true;
          }
        }
      }

      return false;
    },
    [rowSpanMap, selectedRowKey, selectedRowWithSpanKeys, getCachedRowKey]
  );

  const renderCell = (item: TData, column: IHeader<TData>, rowIndex: number, columnIndex: number) => {
    const key = getCachedRowKey(rowIndex);
    const cellKey = `${String(column.key)}-${rowIndex}`;
    const isCheckboxColumn = column.key === 'row-selection';
    const isExpandColumn = column.key === 'expand';
    const isReorderColumn = column.key === 'row-reorder';
    const isRowChecked = selectAll ? !deselectedRowKeys.has(key) : selectedRowKeys.has(key);
    const isRowExpanded = expandedRowKeys.has(key);
    const customClassNameCell = classNameCell ? classNameCell(item, rowIndex, columnIndex) : '';
    const isFreezeLeft = column.freeze === 'left';
    const isFreezeRight = column.freeze === 'right';

    const freezeLeftPosition = getFreezeLeftPosition(flattenedColumns.map((col) => col) as IAdjustedHeader[], columnIndex);
    const freezeRightPosition = getFreezeRightPosition(flattenedColumns.map((col) => col) as IAdjustedHeader[], columnIndex);

    // NOTE: Cek data rowspan untuk cell ini
    const rowSpanData = rowSpanMap.get(cellKey);

    // NOTE: Skip rendering karena cell ini sudah di-merge dengan cell di row atasnya
    if (rowSpanData && !rowSpanData.shouldRender) return null;

    // Cek apakah cell ini harus di-highlight
    const isCellHighlighted = checkCellHighlighting(item, rowIndex, cellKey);

    // classname
    const classNameCellContent = clsx(useDynamicRowHeight ? 'break-words' : 'truncate', {
      '!border-l': isFreezeRight,
      'bg-white dark:bg-black/50 backdrop-blur-2xl': (isFreezeLeft || isFreezeRight) && !isCellHighlighted,
      'bg-[#ECEEFF] dark:bg-blue-900': isCellHighlighted,
      'group-hover/regular-table-row:bg-[#ECEEFF] dark:group-hover/regular-table-row:bg-blue-900': !rowSpanMap.size,
      'transition-colors duration-150 size-full content-center px-1.5 text-xs border-r border-b border-[#D2D2D4]': true,
      [customClassNameCell]: !!customClassNameCell && !isFreezeLeft && !isFreezeRight,
    });

    let cellContent;

    if (isCheckboxColumn) {
      cellContent = (
        <div className={classNameCellContent} onClick={() => handleCheckboxChange(item, rowIndex)}>
          <RowCheckbox checked={isRowChecked} />
        </div>
      );
    } else if (isReorderColumn && onReorderRowsToParent) {
      const reorderProps = dndFunc.getReorderProps(rowIndex);
      cellContent = (
        <div className={classNameCellContent}>
          {reorderProps.enableReorderFromColumnOnly && reorderProps.onReorderDragStart && reorderProps.onReorderDragEnd ? (
            <div
              draggable
              onDragStart={reorderProps.onReorderDragStart}
              onDragEnd={reorderProps.onReorderDragEnd}
              className="flex justify-center items-center w-full h-full"
            >
              <RowReorder />
            </div>
          ) : (
            <RowReorder />
          )}
        </div>
      );
    } else if (isExpandColumn) {
      cellContent = (
        <div className={classNameCellContent} onClick={() => handleExpandToggle(item, rowIndex)}>
          {column.renderExpandToggle?.(item, isRowExpanded) || <RowExpand isExpanded={isRowExpanded} />}
        </div>
      );
    } else if (column.renderCell) {
      cellContent = <div className={classNameCellContent}>{column.renderCell(item)}</div>;
    } else {
      cellContent = <div className={classNameCellContent}>{String(item[column.key as keyof TData] || '')}</div>;
    }

    // NOTE: Untuk cell dengan rowspan yang highlighted, tambahkan border visual feedback
    const hasRowSpan = rowSpanData && rowSpanData.rowSpan > 1;

    return (
      <NativeTableCell
        key={`regular-table-cell-${key}-${String(column.key)}`}
        columnWidth={column.width || 160}
        columnHeight={rowHeight}
        rowSpan={rowSpanData?.rowSpan || 1} // NOTE: Set rowSpan dari hasil kalkulasi (default: 1)
        onClick={() => !isCheckboxColumn && !isExpandColumn && !isReorderColumn && handleClickRow(item, rowIndex, columnIndex)}
        onDoubleClick={() => !isCheckboxColumn && !isExpandColumn && !isReorderColumn && handleDoubleClickRow(item, rowIndex, columnIndex)}
        onContextMenu={(e) => !isCheckboxColumn && !isExpandColumn && !isReorderColumn && handleRightClickRow(item, e)}
        data-has-rowspan={hasRowSpan || undefined} // NOTE: Data attribute untuk tracking rowspan cells
        data-rowspan-start={rowSpanData?.spanStartRow}
        data-rowspan-end={rowSpanData?.spanEndRow}
        style={{
          position: isFreezeLeft || isFreezeRight ? 'sticky' : undefined,
          zIndex: 2,
          ...(isFreezeLeft && { left: freezeLeftPosition }),
          ...(isFreezeRight && { right: freezeRightPosition }),
        }}
        className={clsx({})}
      >
        {cellContent}
      </NativeTableCell>
    );
  };

  return (
    <tbody>
      {filteredData.map((item, rowIndex) => {
        const key = getCachedRowKey(rowIndex);
        const isRowExpanded = expandedRowKeys.has(key);

        return (
          <Fragment key={'regular-table-row-' + key}>
            <tr
              data-row-index={rowIndex}
              data-index={rowIndex}
              className={clsx(
                'group/regular-table-row',
                !!onReorderRowsToParent && !dndState.useToggleOnlyToReorder && 'cursor-grab active:cursor-grabbing'
              )}
              draggable={!!onReorderRowsToParent && !dndState.useToggleOnlyToReorder}
              onDragStart={!dndState.useToggleOnlyToReorder && onReorderRowsToParent ? (e) => dndFunc.handleDragStart(e, rowIndex) : undefined}
              onDragOver={onReorderRowsToParent ? dndFunc.handleDragOver : undefined}
              onDragEnd={!dndState.useToggleOnlyToReorder && onReorderRowsToParent ? dndFunc.handleDragEnd : undefined}
              onDrop={onReorderRowsToParent ? (e) => dndFunc.handleDrop(e, rowIndex) : undefined}
            >
              {flattenedColumns.map((column, columnIndex) => renderCell(item, column as IHeader<TData>, rowIndex, columnIndex))}
            </tr>

            {isRowExpanded && expandedContent && (
              <tr key={`regular-table-row-expanded-${key}`}>
                <td colSpan={flattenedColumns.length} className="p-0">
                  <div className="border-b border-gray-200 p-2">{expandedContent(item)}</div>
                </td>
              </tr>
            )}
          </Fragment>
        );
      })}
    </tbody>
  );
}

export default memo(RegularTableBody) as <TData>(props: IRegularTableBody<TData>) => ReactNode;
