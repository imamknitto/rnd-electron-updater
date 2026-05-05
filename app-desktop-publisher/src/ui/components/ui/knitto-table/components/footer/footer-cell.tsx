import { memo, useMemo } from 'react';
import clsx from 'clsx';
import { TableCell } from '..';
import type { IAdjustedHeader } from '../../lib';

interface IFooterCell {
  column: IAdjustedHeader;
  isVisible?: boolean;
  isLastIndex?: boolean;
  freezeMode?: 'left' | 'right' | 'none';
  freezeRightColumnsWidth?: number;
  position: {
    left: number;
    width: number;
    height: number;
  };
}

function FooterCell(footerCellProps: IFooterCell) {
  const { column, isVisible = true, isLastIndex = false, freezeMode = 'none', freezeRightColumnsWidth = 0, position } = footerCellProps;

  const classNames = useMemo(() => {
    if (freezeMode === 'left') {
      return clsx('bg-gray-50 border-t border-r truncate !px-0', {
        '!hidden': !isVisible,
      });
    }

    if (freezeMode === 'right') {
      return clsx('bg-gray-50 border-t border-l nth-[1]:!border-l truncate !px-0', {
        '!hidden': !isVisible,
      });
    }

    return clsx('bg-gray-50 table-cell truncate border-t border-r nth-last-[1]:!border-r-transparent !px-0', {
      '!border-r-transparent': isLastIndex && freezeRightColumnsWidth > 0,
      '!hidden': !isVisible,
    });
  }, [freezeMode, isVisible, isLastIndex, freezeRightColumnsWidth]);

  const cellStyle = useMemo(
    () => ({
      position: 'absolute' as const,
      height: position.height,
      transform: `translateX(${position.left}px)`,
      width: position.width,
      top: 0,
    }),
    [position.height, position.left, position.width]
  );

  const cellContent = useMemo(() => column.renderFooter?.(), [column.renderFooter]);

  return (
    <TableCell key={'table-footer-cell-' + String(column.key)} data-col-key={String(column.key)} className={classNames} style={cellStyle}>
      {cellContent}
    </TableCell>
  );
}

export default memo(FooterCell) as (props: IFooterCell) => React.ReactElement;
