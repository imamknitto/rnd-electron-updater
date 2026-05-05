// src/components/knitto-table/regular-table-footer.tsx
import { memo } from 'react';
import clsx from 'clsx';
import { useFlattenColumns } from './context/header-context';
import { useUseFooter } from './context/ui-context';
import NativeTableCell from './components/native-table-cell';
import type { IHeader, IAdjustedHeader } from './lib';

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

interface IRegularTableFooter {
  footerHeight: number;
}

function RegularTableFooter<TData>({ footerHeight }: IRegularTableFooter) {
  const useFooter = useUseFooter();
  const flattenColumns = useFlattenColumns();

  // Don't render if footer is disabled
  if (!useFooter) return null;

  const renderFooterCell = (column: IHeader<TData>, columnIndex: number) => {
    const isLastIndex = columnIndex === flattenColumns.length - 1;
    const isFreezeRight = column.freeze === 'right';
    const isFreezeLeft = column.freeze === 'left';

    const freezeLeftPosition = getFreezeLeftPosition(flattenColumns.map((col) => col.col) as IAdjustedHeader[], columnIndex);
    const freezeRightPosition = getFreezeRightPosition(flattenColumns.map((col) => col.col) as IAdjustedHeader[], columnIndex);

    const classNameCellContent = clsx('truncate', {
      'border-r': !isLastIndex,
      '!border-l': isFreezeRight,
      'transition-colors duration-150 size-full content-center px-1.5 text-xs border-b': true,
      'border-[#D2D2D4] bg-[#EFF0F6] dark:bg-black': true,
    });

    const cellContent = <div className={classNameCellContent}>{column.renderFooter?.() || ''}</div>;

    return (
      <NativeTableCell
        key={`regular-table-footer-cell-${String(column.key)}`}
        data-col-key={String(column.key)}
        columnWidth={column.width || 0}
        columnHeight={footerHeight}
        cellValue={cellContent}
        style={{
          position: isFreezeLeft || isFreezeRight ? 'sticky' : undefined,
          zIndex: 2,
          ...(isFreezeLeft && { left: freezeLeftPosition }),
          ...(isFreezeRight && { right: freezeRightPosition }),
        }}
        className={clsx({})}
      />
    );
  };

  return (
    <tfoot className="sticky-footer">
      <tr className="group/regular-table-footer">{flattenColumns.map((column, columnIndex) => renderFooterCell(column.col, columnIndex))}</tr>
    </tfoot>
  );
}

export default memo(RegularTableFooter);
