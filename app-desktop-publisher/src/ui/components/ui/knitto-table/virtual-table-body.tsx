import { forwardRef, memo, useMemo, type ReactNode } from 'react';
import BodyCell from './components/body/body-cell';
import RowExpandedContent from './components/body/row-expanded-content';
import type { IAdjustedHeader, IKnittoTable } from './lib';
import clsx from 'clsx';
import {
  useColumns,
  useFreezeLeftColumns,
  useFreezeLeftColumnsWidth,
  useFreezeRightColumns,
  useFreezeRightColumnsWidth,
  useGetLeaves,
} from './context/header-context';
import {
  useContainerWidth,
  useColumnVirtualItems,
  useFlattenedData,
  useRowVirtualItems,
  useRowVirtualizer,
  useEnableColumnVirtualization,
} from './context/virtualizer-context';
import {
  useDeselectedRowKeys,
  useExpandedRowKeys,
  useOnClickRow,
  useSelectAll,
  useSelectedRowKey,
  useSelectedRowKeys,
  useToggleExpandRow,
  useToggleRowSelection,
} from './context/selection-context';
import {
  useFreezeColLeftPositions,
  useCalcTotalTableWidth,
  useExpandedContent,
  useUseFooter,
  useFreezeColRightPositions,
  useCalcHeaderTotalHeight,
  useUseDynamicRowHeight,
} from './context/ui-context';
import { useRowReorderDnd } from './hooks';

interface IVirtualTableBody<TData> {
  headerHeight: number;
  footerHeight: number;
  filterHeight: number;
  rowHeight: number;
  headerMode: 'single' | 'double';
  onClickRowToParent?: (item: TData, rowIndex: number, columnIndex: number) => void;
  onDoubleClickRowToParent?: (item: TData, rowIndex: number, columnIndex: number) => void;
  onRightClickRowToParent?: (item: TData, position: { x: number; y: number }) => void;
  onReorderRowsToParent?: IKnittoTable<TData>['onReorderRows'];
  reorderOnlyFromToggle?: boolean;
}

const VirtualTableBody = forwardRef(<TData,>(props: IVirtualTableBody<TData>, ref: React.Ref<HTMLDivElement>) => {
  const {
    footerHeight,
    rowHeight,
    onClickRowToParent,
    onDoubleClickRowToParent,
    onRightClickRowToParent,
    onReorderRowsToParent,
    reorderOnlyFromToggle = false,
  } = props;

  const freezeLeftColumns = useFreezeLeftColumns();
  const freezeRightColumns = useFreezeRightColumns();
  const freezeRightColumnsWidth = useFreezeRightColumnsWidth();
  const freezeLeftColumnsWidth = useFreezeLeftColumnsWidth();
  const columns = useColumns();
  const getLeaves = useGetLeaves();

  const useDynamicRowHeight = useUseDynamicRowHeight();
  const flattenedData = useFlattenedData();
  const rowVirtualizer = useRowVirtualizer();
  const rowVirtualItems = useRowVirtualItems();
  const columnVirtualItems = useColumnVirtualItems();
  const containerWidth = useContainerWidth();
  const enableColumnVirtualization = useEnableColumnVirtualization();

  const selectAll = useSelectAll();
  const onClickRow = useOnClickRow();
  const selectedRowKey = useSelectedRowKey();
  const selectedRowKeys = useSelectedRowKeys();
  const deselectedRowKeys = useDeselectedRowKeys();
  const toggleRowSelection = useToggleRowSelection();
  const toggleExpandRow = useToggleExpandRow();
  const expandedRowKeys = useExpandedRowKeys();

  const useFooter = useUseFooter();
  const expandedContent = useExpandedContent();
  const calcTotalTableWidth = useCalcTotalTableWidth();
  const freezeColLeftPositions = useFreezeColLeftPositions();
  const freezeColRightPositions = useFreezeColRightPositions();
  const calcHeaderTotalHeight = useCalcHeaderTotalHeight();

  // NOTE: Membuat map untuk row key
  const rowMap = useMemo(() => {
    const map = new Map<string | number, TData>();

    flattenedData.forEach((d) => {
      if (d.type === 'row') {
        map.set(String((d as unknown as { key: string }).key), d.item as TData);
      }
    });

    return map;
  }, [flattenedData]);

  // NOTE: Menangani klik pada row
  const handleClickRow = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const cell = (e.target as HTMLElement).closest('div.table-cell');
    const btnExpand = (e.target as HTMLElement).closest('[data-action="expand"]');

    // NOTE: Jika klik pada cell dan bukan pada button expand
    if (cell && !btnExpand && onClickRowToParent) {
      const rowKeyAttr = cell.getAttribute('data-row-key');
      const rowIndex = Number(cell.getAttribute('data-row-index'));
      const columnIndex = Number(cell.getAttribute('data-cell-index'));
      const rowData = rowMap.get(rowKeyAttr || '');

      onClickRow?.(rowKeyAttr);
      onClickRowToParent?.(rowData as TData, rowIndex, columnIndex);
    }

    // NOTE: Jika klik pada button expand
    if (btnExpand) {
      e.preventDefault();
      e.stopPropagation();

      const cell = btnExpand.closest('div.table-cell');
      if (!cell) return;

      const rowKeyAttr = cell?.getAttribute('data-row-key');
      if (rowKeyAttr) toggleExpandRow(rowKeyAttr);
    }
  };

  // NOTE: Menangani klik double pada row
  const handleDoubleClickRow = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const btnExpand = (e.target as HTMLElement).closest('[data-action="expand"]');

    if (btnExpand || !onDoubleClickRowToParent) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    const cell = (e.target as HTMLElement).closest('div');
    if (!cell) return;

    const rowKeyAttr = cell.getAttribute('data-row-key');
    const rowIndex = Number(cell.getAttribute('data-row-index'));
    const columnIndex = Number(cell.getAttribute('data-cell-index'));
    const rowData = rowMap.get(rowKeyAttr || '');
    onDoubleClickRowToParent?.(rowData as TData, rowIndex, columnIndex);
  };

  // NOTE: Menangani klik kanan pada row
  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault();

    if (!onRightClickRowToParent) return;

    const cell = (e.target as HTMLElement).closest('div');
    if (!cell) return;

    const rowKeyAttr = cell.getAttribute('data-row-key');
    const rowData = rowMap.get(rowKeyAttr || '');
    onClickRow?.(rowKeyAttr);
    onRightClickRowToParent?.(rowData as TData, { x: e.clientX, y: e.clientY });
  };

  const { func: dndFunc, state: dndState } = useRowReorderDnd({
    freezeLeftColumns,
    columns,
    freezeRightColumns,
    flattenedData,
    rowHeight,
    onReorderRowsToParent,
    reorderOnlyFromToggle,
  });

  // NOTE: Menangani perubahan pada checkbox selection
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLDivElement>): void => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    const isCheckbox = (target as HTMLInputElement).type === 'checkbox';

    if (isCheckbox) {
      const cell = target.closest('div.table-cell');

      if (!cell) return;

      const rowKeyAttr = cell.getAttribute('data-row-key');
      if (rowKeyAttr) toggleRowSelection(rowKeyAttr);
      return;
    }
  };

  const calcBodyHeight = (rowVirtualizer?.getTotalSize() ?? 0) + (useFooter ? footerHeight : 0);

  const renderFreezeLeftColumns = (rowKey: string, rowData: TData, isRowChecked: boolean, isRowExpanded: boolean, rowIndex: number) => {
    const reorderProps = dndFunc.getReorderProps(rowIndex);

    return freezeLeftColumns.flatMap((column, freezeLeftIdx) => {
      const isRowHighlighted = rowKey === String(selectedRowKey);
      const isGroupColumn = column.key.startsWith('group-header-');

      if (isGroupColumn) {
        let childOffset = 0;

        return getLeaves(column).map((child, childIdx) => {
          const left = freezeColLeftPositions[freezeLeftIdx] + childOffset;
          childOffset += child.width || 0;

          return (
            <BodyCell
              freezeMode="left"
              key={'table-cell-freeze-left-group-' + String(child.key)}
              rowKey={rowKey}
              rowData={rowData}
              isRowChecked={isRowChecked}
              isRowExpanded={isRowExpanded}
              column={child}
              isVisible={child.visible}
              isRowHighlighted={isRowHighlighted}
              rowIndex={rowIndex}
              columnIndex={childIdx}
              position={{
                left,
                width: child.width!,
                height: rowHeight,
              }}
              {...(child?.key === 'row-reorder' ? reorderProps : {})}
            />
          );
        });
      }

      return [
        <BodyCell
          freezeMode="left"
          key={'table-cell-freeze-left-' + String(column.key)}
          rowKey={rowKey}
          rowData={rowData}
          isRowChecked={isRowChecked}
          isRowExpanded={isRowExpanded}
          column={column}
          isVisible={column.visible}
          isRowHighlighted={isRowHighlighted}
          rowIndex={rowIndex}
          columnIndex={freezeLeftIdx}
          position={{
            left: freezeColLeftPositions[freezeLeftIdx],
            width: column.width!,
            height: rowHeight,
          }}
          {...(column?.key === 'row-reorder' ? reorderProps : {})}
        />,
      ];
    });
  };

  const renderFreezeRightColumns = (rowKey: string, rowData: TData, isRowChecked: boolean, isRowExpanded: boolean, rowIndex: number) => {
    const reorderProps = dndFunc.getReorderProps(rowIndex);

    return freezeRightColumns.flatMap((column, freezeRightIdx) => {
      const isRowHighlighted = rowKey === String(selectedRowKey);
      const isGroupColumn = column.key.startsWith('group-header-');
      const isLastIndex = freezeRightIdx === freezeRightColumns.length - 1;

      if (isGroupColumn) {
        let childOffset = 0;

        return getLeaves(column).map((child, childIdx) => {
          const left = freezeColRightPositions[freezeRightIdx] + childOffset;
          childOffset += child.width || 0;

          return (
            <BodyCell
              freezeMode="right"
              key={'table-cell-freeze-right-group-' + String(child.key)}
              rowKey={rowKey}
              rowData={rowData}
              isRowChecked={isRowChecked}
              isRowExpanded={isRowExpanded}
              column={child}
              isVisible={child.visible}
              isRowHighlighted={isRowHighlighted}
              isLastIndex={isLastIndex}
              rowIndex={rowIndex}
              columnIndex={childIdx}
              position={{
                left,
                width: child.width!,
                height: rowHeight,
              }}
              {...(child?.key === 'row-reorder' ? reorderProps : {})}
            />
          );
        });
      }

      return [
        <BodyCell
          freezeMode="right"
          key={'table-cell-freeze-right-' + String(column.key)}
          rowKey={rowKey}
          rowData={rowData}
          isRowChecked={isRowChecked}
          isRowExpanded={isRowExpanded}
          column={column}
          isVisible={column.visible}
          isRowHighlighted={isRowHighlighted}
          isLastIndex={isLastIndex}
          rowIndex={rowIndex}
          columnIndex={freezeRightIdx}
          position={{
            left: freezeColRightPositions[freezeRightIdx],
            width: column.width!,
            height: rowHeight,
          }}
          {...(column?.key === 'row-reorder' ? reorderProps : {})}
        />,
      ];
    });
  };

  const renderVirtualizedColumns = (rowKey: string, rowData: TData, isRowChecked: boolean, isRowExpanded: boolean, rowIndex: number) => {
    const reorderProps = dndFunc.getReorderProps(rowIndex);
    // Flatten all columns (including grouped children) to calculate proper first/last indices
    const allFlattenedColumns: { header: IAdjustedHeader; isGroupChild: boolean; groupIndex?: number }[] = [];

    columnVirtualItems.forEach((column) => {
      const header = columns?.[column.index];
      const isGroupHeader = header?.key.startsWith('group-header-');

      if (isGroupHeader) {
        const leaves = getLeaves(header);
        leaves.forEach((child) => {
          allFlattenedColumns.push({ header: child, isGroupChild: true });
        });
      } else {
        allFlattenedColumns.push({ header: header!, isGroupChild: false });
      }
    });

    return columnVirtualItems.flatMap((column, columnIndex) => {
      const header = columns?.[column.index];
      const isRowHighlighted = rowKey === String(selectedRowKey);
      const isGroupHeader = header?.key.startsWith('group-header-');

      if (isGroupHeader) {
        const baseLeft = column.start + freezeLeftColumnsWidth;
        let childOffset = 0;
        const leaves = getLeaves(header);

        return leaves.map((child, childIdx) => {
          const childWidth = (child.width || 0) * (header.width ? column.size / header.width : 1);
          const left = baseLeft + childOffset;
          childOffset += childWidth;

          // Find the index of this child in the flattened columns array
          const flattenedIndex = allFlattenedColumns.findIndex((item) => item.header.key === child.key && item.isGroupChild);
          const isFirstIndex = flattenedIndex === 0;
          const isLastIndex = flattenedIndex === allFlattenedColumns.length - 1;

          return (
            <BodyCell
              key={'table-cell-group-child-' + column.key + '-' + String(child.key)}
              rowKey={rowKey}
              rowData={rowData}
              isRowChecked={isRowChecked}
              isRowExpanded={isRowExpanded}
              column={child}
              isVisible={child.visible}
              isRowHighlighted={isRowHighlighted}
              isFirstIndex={isFirstIndex}
              isLastIndex={isLastIndex}
              rowIndex={rowIndex}
              columnIndex={childIdx}
              position={{ left, width: childWidth, height: rowHeight }}
              freezeLeftColumnsWidth={freezeLeftColumnsWidth}
              freezeRightColumnsWidth={freezeRightColumnsWidth}
              {...(child?.key === 'row-reorder' ? reorderProps : {})}
            />
          );
        });
      }

      // Find the index of this column in the flattened columns array
      const flattenedIndex = allFlattenedColumns.findIndex((item) => item.header?.key === header?.key && !item.isGroupChild);
      const isFirstIndex = flattenedIndex === 0;
      const isLastIndex = flattenedIndex === allFlattenedColumns.length - 1;

      return [
        <BodyCell
          key={'table-cell-' + column.key}
          rowKey={rowKey}
          rowData={rowData}
          isRowChecked={isRowChecked}
          isRowExpanded={isRowExpanded}
          column={header}
          isVisible={header?.visible}
          isRowHighlighted={isRowHighlighted}
          isFirstIndex={isFirstIndex}
          isLastIndex={isLastIndex}
          rowIndex={rowIndex}
          columnIndex={columnIndex}
          position={{
            left: column.start + freezeLeftColumnsWidth,
            width: column.size,
            height: rowHeight,
          }}
          freezeLeftColumnsWidth={freezeLeftColumnsWidth}
          freezeRightColumnsWidth={freezeRightColumnsWidth}
          {...(header?.key === 'row-reorder' ? reorderProps : {})}
        />,
      ];
    });
  };

  const renderRegularColumns = (rowKey: string, rowData: TData, isRowChecked: boolean, isRowExpanded: boolean, rowIndex: number) => {
    const reorderProps = dndFunc.getReorderProps(rowIndex);
    let accumulatedLeft = freezeLeftColumnsWidth;

    return columns.flatMap((column, columnIndex) => {
      const isRowHighlighted = rowKey === String(selectedRowKey);
      const isGroupHeader = column.key.startsWith('group-header-');

      if (isGroupHeader) {
        const baseLeft = accumulatedLeft;
        let childOffset = 0;
        const leaves = getLeaves(column);

        const groupChildren = leaves.map((child, childIdx) => {
          const childWidth = child.width || 0;
          const left = baseLeft + childOffset;
          childOffset += childWidth;

          const result = (
            <BodyCell
              key={'table-cell-regular-group-child-' + String(column.key) + '-' + String(child.key)}
              rowKey={rowKey}
              rowData={rowData}
              isRowChecked={isRowChecked}
              isRowExpanded={isRowExpanded}
              column={child}
              isVisible={child.visible}
              isRowHighlighted={isRowHighlighted}
              isFirstIndex={columnIndex === 0 && childIdx === 0}
              isLastIndex={columnIndex === columns.length - 1 && childIdx === leaves.length - 1}
              rowIndex={rowIndex}
              columnIndex={childIdx}
              position={{ left, width: childWidth, height: rowHeight }}
              {...(child?.key === 'row-reorder' ? reorderProps : {})}
            />
          );

          return result;
        });

        accumulatedLeft += column.width || 0;
        return groupChildren;
      }

      const left = accumulatedLeft;
      const columnWidth = column.width || 0;
      accumulatedLeft += columnWidth;

      return [
        <BodyCell
          key={'table-cell-regular-' + String(column.key)}
          rowKey={rowKey}
          rowData={rowData}
          isRowChecked={isRowChecked}
          isRowExpanded={isRowExpanded}
          column={column}
          isVisible={column.visible}
          isRowHighlighted={isRowHighlighted}
          isFirstIndex={columnIndex === 0}
          isLastIndex={columnIndex === columns.length - 1}
          rowIndex={rowIndex}
          columnIndex={columnIndex}
          position={{ left, width: columnWidth, height: rowHeight }}
          {...(column?.key === 'row-reorder' ? reorderProps : {})}
        />,
      ];
    });
  };

  return (
    <div
      ref={ref}
      onClick={handleClickRow}
      onDoubleClick={handleDoubleClickRow}
      onContextMenu={handleContextMenu}
      onChange={handleCheckboxChange}
      style={{ position: 'relative', top: calcHeaderTotalHeight, height: calcBodyHeight, minHeight: calcBodyHeight }}
    >
      <div className="absolute top-0 left-0 w-full" style={{ transform: `translateY(${rowVirtualItems?.[0]?.start || 0}px)` }}>
        {rowVirtualItems.map((row) => {
          const rowItem = flattenedData[row.index];
          const rowData = rowItem.item as TData;
          const resolvedRowKey = String((rowItem as unknown as { key: string }).key);

          const isRowExpanded = expandedRowKeys.has(resolvedRowKey);
          const isRowChecked = selectAll ? !deselectedRowKeys.has(resolvedRowKey) : selectedRowKeys.has(resolvedRowKey);

          const isRowType = rowItem.type === 'row';
          const isDraggable = !!onReorderRowsToParent && isRowType && !dndState.useToggleOnlyToReorder;

          return (
            <div
              key={row.key}
              data-index={row.index}
              ref={rowVirtualizer?.measureElement}
              className={clsx('group/row', isDraggable && 'cursor-grab active:cursor-grabbing')}
              draggable={isDraggable}
              onDragStart={(e) => isDraggable && dndFunc.handleDragStart(e, row.index)}
              onDragOver={onReorderRowsToParent ? dndFunc.handleDragOver : undefined}
              onDragEnd={isDraggable ? dndFunc.handleDragEnd : undefined}
              onDrop={onReorderRowsToParent ? (e) => dndFunc.handleDrop(e, row.index) : undefined}
            >
              <div style={{ minHeight: rowHeight, width: calcTotalTableWidth }}>
                <div className="relative h-full w-full flex group/row-cells">
                  <div className={clsx('sticky left-0 z-20', useDynamicRowHeight && 'flex')} style={{ width: freezeLeftColumnsWidth }}>
                    {renderFreezeLeftColumns(resolvedRowKey, rowData, isRowChecked, isRowExpanded, row.index)}
                  </div>

                  <div className={clsx('sticky z-20', useDynamicRowHeight && 'flex')} style={{ left: containerWidth - freezeRightColumnsWidth }}>
                    {renderFreezeRightColumns(resolvedRowKey, rowData, isRowChecked, isRowExpanded, row.index)}
                  </div>

                  {enableColumnVirtualization ? (
                    renderVirtualizedColumns(resolvedRowKey, rowData, isRowChecked, isRowExpanded, row.index)
                  ) : useDynamicRowHeight ? (
                    <div className="flex" style={{ marginLeft: -freezeRightColumnsWidth }}>
                      {renderRegularColumns(resolvedRowKey, rowData, isRowChecked, isRowExpanded, row.index)}
                    </div>
                  ) : (
                    renderRegularColumns(resolvedRowKey, rowData, isRowChecked, isRowExpanded, row.index)
                  )}
                </div>
              </div>

              {isRowExpanded && (
                <RowExpandedContent width={calcTotalTableWidth} emptyPadding={!expandedContent}>
                  {expandedContent?.(rowData) || 'No expanded content available.'}
                </RowExpandedContent>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default memo(VirtualTableBody) as <TData>(props: IVirtualTableBody<TData>) => ReactNode;
