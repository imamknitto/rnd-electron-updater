import { useCallback, type CSSProperties } from 'react';
import clsx from 'clsx';
import { DEFAULT_SIZE, type IAdjustedHeader } from '../../lib';
import ResizeIndicator from '../resize-indicator';
import RowCheckbox from '../body/row-checkbox';
import HeaderFilter from './header-filter';
import TableHead from '../table-head';
import HeaderCellNested from './header-cell-nested';
import HeaderCaption from './header-caption';
import {
  useColumns,
  useFreezeLeftColumns,
  useFreezeRightColumns,
  useIsFilterVisible,
  useUpdateColumn,
  useUpdateFreezeColumn,
} from '../../context/header-context';
import { useColumnVirtualizer } from '../../context/virtualizer-context';
import { useDeselectedRowKeys, useSelectAll } from '../../context/selection-context';
import { useHeaderMode } from '../../context/ui-context';

interface IHeaderCell {
  headData: IAdjustedHeader;
  headVirtualIndex: number;
  cellClassName?: string;
  cellStyles?: CSSProperties;
  freezeType?: 'left' | 'right';
}

function HeaderCell(props: IHeaderCell) {
  const { headData, headVirtualIndex, cellStyles, cellClassName, freezeType } = props;

  const isFilterVisible = useIsFilterVisible();
  const freezeLeftColumns = useFreezeLeftColumns();
  const freezeRightColumns = useFreezeRightColumns();
  const columns = useColumns();
  const updateColumn = useUpdateColumn();
  const updateFreezeColumn = useUpdateFreezeColumn();

  const selectAll = useSelectAll();
  const deselectedRowKeys = useDeselectedRowKeys();

  const columnVirtualizer = useColumnVirtualizer();
  const headerMode = useHeaderMode();

  const isCheckboxHeader = headData?.key === 'row-selection';
  const isExpandHeader = headData?.key === 'expand';
  const isActionHeader = headData?.key === 'action';
  const isSingleHeader = headerMode === 'single';
  const isGroupHeader = headData?.key.startsWith('group-header-');
  const isShowNormalCell = !isCheckboxHeader && !isExpandHeader && !isActionHeader && !isGroupHeader;
  const renderHeader = headData?.renderHeader;
  const hideFilter = headData?.hideFilter;
  const hideHeaderAction = headData?.hideHeaderAction;
  const disableResizeColumn = headData?.disableResizeColumn;

  const handleResizeColumn = useCallback(
    (e: React.MouseEvent, index: number, freezeType?: 'left' | 'right') => {
      e.preventDefault();
      const startX = e.clientX;
      let startWidth: number;

      if (freezeType === 'left') {
        startWidth = freezeLeftColumns[index].width!;
      } else if (freezeType === 'right') {
        startWidth = freezeRightColumns[index].width!;
      } else {
        startWidth = columns[index].width!;
      }

      const resizeLine = document.getElementById('resize-line')!;
      resizeLine.style.display = 'block';
      resizeLine.style.left = `${e.clientX}px`;

      const onMouseMove = (ev: MouseEvent) => {
        requestAnimationFrame(() => {
          resizeLine.style.left = `${ev.clientX}px`;
        });
      };

      const onMouseUp = (ev: MouseEvent) => {
        resizeLine.style.display = 'none';
        const delta = ev.clientX - startX;
        const newWidth = Math.max(50, startWidth + delta);

        requestAnimationFrame(() => {
          if (freezeType === 'left') {
            updateFreezeColumn(freezeLeftColumns[index].key, 'left', { width: newWidth });
          } else if (freezeType === 'right') {
            updateFreezeColumn(freezeRightColumns[index].key, 'right', { width: newWidth });
          } else {
            updateColumn(columns[index].key, { width: newWidth });
            columnVirtualizer?.resizeItem(index, newWidth);
          }
        });

        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    },
    [freezeLeftColumns, freezeRightColumns, columns, updateFreezeColumn, updateColumn, columnVirtualizer]
  );

  return (
    <TableHead
      style={cellStyles}
      className={clsx(
        'flex size-full relative',
        {
          'group/outer': !isGroupHeader,
          '!px-0 flex flex-col': isGroupHeader,
          'flex-row justify-between items-center': isSingleHeader && !isGroupHeader,
          'flex-col justify-between items-start !px-0': !isSingleHeader && !isGroupHeader,
        },
        cellClassName
      )}
    >
      {isGroupHeader && (
        <>
          <div
            style={{ height: DEFAULT_SIZE.GROUP_HEADER_HEIGHT }}
            className={clsx('w-full border-b border-[#D2D2D4] text-center content-center', freezeType === 'right' ? 'border-l' : 'border-r')}
          >
            {headData?.caption}
          </div>

          <div className="flex-1 w-full flex min-h-0">
            {headData?.children?.map((child) => (
              <HeaderCellNested
                key={'header-cell-nested-' + freezeType + '-' + child.key}
                headData={child}
                parentKey={headData.key}
                parentVirtualIndex={headVirtualIndex}
                freezeType={freezeType}
              />
            ))}
          </div>
        </>
      )}

      {renderHeader && renderHeader()}

      {!renderHeader && isShowNormalCell && (
        <>
          <HeaderCaption
            isSingleHeader={isSingleHeader}
            isFilterVisible={isFilterVisible}
            headerKey={headData?.key}
            caption={headData?.caption}
            hideFilterSort={hideFilter?.sort || false}
            hideHeaderAction={hideHeaderAction || false}
          />

          {isFilterVisible && (
            <HeaderFilter
              headerMode={headerMode}
              headerKey={headData?.key}
              hideFilter={hideFilter}
              filterSelectionOptions={headData?.filterSelectionOptions || []}
            />
          )}

          {!disableResizeColumn && <ResizeIndicator handleMouseDown={(e) => handleResizeColumn(e, headVirtualIndex, freezeType)} />}
        </>
      )}

      {!renderHeader && isCheckboxHeader && <RowCheckbox checked={selectAll && !deselectedRowKeys.size} />}
    </TableHead>
  );
}

export default HeaderCell;
