import { forwardRef, memo, type ReactNode } from 'react';
import clsx from 'clsx';
import { type IAdjustedHeader } from './lib';
import HeaderCell from './components/header/header-cell';
import ResizeLine from './components/resize-line';
import {
  useColumns,
  useFreezeLeftColumns,
  useFreezeLeftColumnsWidth,
  useFreezeRightColumns,
  useFreezeRightColumnsWidth,
} from './context/header-context';
import { useColumnVirtualItems, useContainerWidth, useEnableColumnVirtualization } from './context/virtualizer-context';
import { useSelectAll, useToggleSelectAll } from './context/selection-context';
import { useCalcHeaderTotalHeight, useCalcTotalTableWidth, useFreezeColLeftPositions, useFreezeColRightPositions } from './context/ui-context';

const VirtualTableHeaderV2 = forwardRef((props: React.HTMLAttributes<HTMLDivElement>, ref: React.Ref<HTMLDivElement>) => {
  const { className, ...propRest } = props;

  const columns = useColumns();
  const freezeLeftColumns = useFreezeLeftColumns();
  const freezeRightColumns = useFreezeRightColumns();
  const freezeLeftColumnsWidth = useFreezeLeftColumnsWidth();
  const freezeRightColumnsWidth = useFreezeRightColumnsWidth();

  const columnVirtualItems = useColumnVirtualItems();
  const containerWidth = useContainerWidth();
  const enableColumnVirtualization = useEnableColumnVirtualization();

  const selectAll = useSelectAll();
  const toggleSelectAll = useToggleSelectAll();

  const freezeColLeftPositions = useFreezeColLeftPositions();
  const freezeColRightPositions = useFreezeColRightPositions();
  const calcTotalTableWidth = useCalcTotalTableWidth();
  const calcHeaderTotalHeight = useCalcHeaderTotalHeight();

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLTableSectionElement>): void => {
    const target = e.target as HTMLElement | null;
    const headerCheckbox = (target as HTMLInputElement).closest('[data-name="header-checkbox"]');

    if (!target || !headerCheckbox) return;
    const isCheckbox = (target as HTMLInputElement).type === 'checkbox';

    if (!isCheckbox) return;
    toggleSelectAll(!selectAll);
  };

  const renderFreezeLeftColumns = () => {
    return freezeLeftColumns.map((column, freezeLeftIdx) => {
      const hasChildren = column?.children;

      return (
        <HeaderCell
          key={'table-head-freeze-left-' + column.key}
          freezeType="left"
          headData={column}
          headVirtualIndex={freezeLeftIdx}
          cellStyles={{
            position: 'absolute',
            transform: `translateX(${freezeColLeftPositions[freezeLeftIdx]}px)`,
            height: calcHeaderTotalHeight,
            width: column.width!,
            top: 0,
          }}
          cellClassName={clsx(!hasChildren && 'border-r')}
        />
      );
    });
  };

  const renderFreezeRightColumns = () => {
    return freezeRightColumns.map((column, freezeRightIdx) => {
      const hasChildren = column?.children;
      const isLastColumn = freezeRightIdx === freezeRightColumns.length - 1;

      return (
        <HeaderCell
          key={'table-head-freeze-right-' + column.key}
          headData={column}
          headVirtualIndex={freezeRightIdx}
          freezeType="right"
          cellStyles={{
            position: 'absolute',
            transform: `translateX(${freezeColRightPositions[freezeRightIdx]}px)`,
            height: calcHeaderTotalHeight,
            width: column.width!,
            top: 0,
          }}
          cellClassName={clsx(!hasChildren && 'border-l', isLastColumn && 'border-r')}
        />
      );
    });
  };

  const renderVirtualizedColumns = () => {
    return columnVirtualItems?.map((column) => {
      const header = columns[column.index];
      const hasChildren = header?.children;

      return (
        <HeaderCell
          key={'table-head-' + column.key}
          headData={header as IAdjustedHeader}
          headVirtualIndex={column.index}
          cellStyles={{
            position: 'absolute',
            transform: `translateX(${column.start + freezeLeftColumnsWidth}px)`,
            height: calcHeaderTotalHeight,
            width: column.size,
            top: 0,
          }}
          cellClassName={clsx(!hasChildren && 'border-r')}
        />
      );
    });
  };

  const renderRegularColumns = () => {
    let accumulatedLeft = freezeLeftColumnsWidth;

    return columns.flatMap((column, columnIndex) => {
      const hasChildren = column?.children;
      const isGroupHeader = column.key.startsWith('group-header-');

      if (isGroupHeader && hasChildren) {
        const left = accumulatedLeft;
        const columnWidth = column.width || 0;
        accumulatedLeft += columnWidth;

        return [
          <HeaderCell
            key={'table-head-regular-group-' + String(column.key)}
            headData={column as IAdjustedHeader}
            headVirtualIndex={columnIndex}
            cellStyles={{
              position: 'absolute',
              transform: `translateX(${left}px)`,
              height: calcHeaderTotalHeight,
              width: columnWidth,
              top: 0,
            }}
            cellClassName={clsx('border-r')}
          />,
        ];
      }

      const left = accumulatedLeft;
      const columnWidth = column.width || 0;
      accumulatedLeft += columnWidth;

      return [
        <HeaderCell
          key={'table-head-regular-' + String(column.key)}
          headData={column as IAdjustedHeader}
          headVirtualIndex={columnIndex}
          cellStyles={{
            position: 'absolute',
            transform: `translateX(${left}px)`,
            height: calcHeaderTotalHeight,
            width: columnWidth,
            top: 0,
          }}
          cellClassName={clsx(!hasChildren && 'border-r')}
        />,
      ];
    });
  };

  return (
    <div className={clsx('sticky top-0 z-10', className)} onChange={handleCheckboxChange} ref={ref as React.Ref<HTMLDivElement>} {...propRest}>
      <div className="table-header relative flex h-full" style={{ width: calcTotalTableWidth }}>
        <div className="sticky left-0 z-20 h-full" style={{ width: freezeLeftColumnsWidth }}>
          {renderFreezeLeftColumns()}
        </div>

        <div className="sticky z-20 h-full" style={{ left: containerWidth - freezeRightColumnsWidth }}>
          {renderFreezeRightColumns()}
        </div>

        {enableColumnVirtualization ? renderVirtualizedColumns() : renderRegularColumns()}

        <ResizeLine />
      </div>
    </div>
  );
});

export default memo(VirtualTableHeaderV2) as (props: React.HTMLAttributes<HTMLDivElement>) => ReactNode;
