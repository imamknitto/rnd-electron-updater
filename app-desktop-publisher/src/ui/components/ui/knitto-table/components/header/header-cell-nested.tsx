import { memo, type CSSProperties } from 'react';
import clsx from 'clsx';
import { DEFAULT_SIZE, findChildRecursive, type IHeader, type IAdjustedHeader } from '../../lib';
import ResizeIndicator from '../resize-indicator';
import HeaderCaption from './header-caption';
import HeaderFilter from './header-filter';
import {
  useColumns,
  useFreezeLeftColumns,
  useFreezeRightColumns,
  useIsFilterVisible,
  useUpdateChildColumn,
  useUpdateFreezeChildColumn,
} from '../../context/header-context';
import { useColumnVirtualizer } from '../../context/virtualizer-context';
import { useHeaderMode } from '../../context/ui-context';

interface INestedHeaderCell {
  headData: IAdjustedHeader;
  parentKey: string;
  parentVirtualIndex: number;
  cellClassName?: string;
  cellStyles?: CSSProperties;
  freezeType?: 'left' | 'right';
}

interface IResizeChildColumnArgs {
  parentKey: string;
  childKey: string;
  parentVirtualIndex?: number;
  freezeType?: 'left' | 'right';
}

function HeaderCellNested(props: INestedHeaderCell) {
  const { headData, parentKey, parentVirtualIndex, cellClassName, cellStyles, freezeType } = props;

  const isFilterVisible = useIsFilterVisible();
  const freezeLeftColumns = useFreezeLeftColumns();
  const freezeRightColumns = useFreezeRightColumns();
  const columns = useColumns();
  const updateFreezeChildColumn = useUpdateFreezeChildColumn();
  const updateChildColumn = useUpdateChildColumn();

  const columnVirtualizer = useColumnVirtualizer();
  const headerMode = useHeaderMode();

  const handleResizeChildColumn = (e: React.MouseEvent, args: IResizeChildColumnArgs) => {
    e.preventDefault();

    const { parentKey, childKey, parentVirtualIndex, freezeType } = args;
    const startX = e.clientX;

    const parent =
      freezeType === 'left'
        ? freezeLeftColumns.find((c: IHeader<unknown>) => c.key === parentKey)
        : freezeType === 'right'
          ? freezeRightColumns.find((c: IHeader<unknown>) => c.key === parentKey)
          : columns.find((c: IHeader<unknown>) => c.key === parentKey);

    if (!parent) return;

    // fungsi rekursif untuk mencari child
    const child = findChildRecursive(parent, childKey);

    if (!child) return;

    const startChildWidth = child.width ?? 0;
    const startParentWidth = parent.width ?? 0;

    const resizeLine = document.getElementById('resize-line')!;
    resizeLine.style.display = 'block';
    resizeLine.style.left = `${e.clientX}px`;

    const onMouseMove = (ev: MouseEvent) => {
      resizeLine.style.left = `${ev.clientX}px`;
    };

    const onMouseUp = (ev: MouseEvent) => {
      resizeLine.style.display = 'none';
      const delta = ev.clientX - startX;
      const newChildWidth = Math.max(50, startChildWidth + delta);

      if (freezeType) {
        updateFreezeChildColumn(parentKey as string, childKey as string, freezeType, {
          width: newChildWidth,
        });
      } else {
        const newParentWidth = Math.max(50, startParentWidth - startChildWidth + newChildWidth);
        updateChildColumn(parentKey as string, childKey as string, { width: newChildWidth });
        if (typeof parentVirtualIndex === 'number') {
          columnVirtualizer?.resizeItem(parentVirtualIndex, newParentWidth);
        }
      }

      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const isSingleHeader = headerMode === 'single';
  const renderHeader = headData?.renderHeader;
  const isLeaf = !headData.children || headData.children.length === 0;

  const getScaledWidth = (parentKey: string, parentVirtualIndex: number, childWidth: number = 0) => {
    if (!childWidth) return 0;

    const parent =
      freezeType === 'left'
        ? freezeLeftColumns.find((col: IHeader<unknown>) => col.key === parentKey)
        : freezeType === 'right'
          ? freezeRightColumns.find((col: IHeader<unknown>) => col.key === parentKey)
          : columns.find((col: IHeader<unknown>) => col.key === parentKey);

    if (!parent?.width) return childWidth;

    // Get virtual items and find the correct parent item
    const virtualItems = typeof parentVirtualIndex === 'number' ? columnVirtualizer?.getVirtualItems() : null;
    const virtualParent = virtualItems?.find((item) => columns[item.index]?.key === parentKey);

    // Use virtual size if available, otherwise fallback to original width
    const parentSize = virtualParent?.size ?? parent.width;
    const originalParentWidth = parent.width;

    // Calculate scale factor based on current virtual size vs original width
    const scaleFactor = parentSize / originalParentWidth;

    // Apply scale factor to child width
    return childWidth * scaleFactor;
  };

  if (isLeaf) {
    const scaledWidth = getScaledWidth(parentKey, parentVirtualIndex, headData.width);

    return (
      <div
        className={clsx(
          'group/outer relative border-[#D2D2D4] flex h-full',
          freezeType === 'right' ? 'border-l' : 'border-r',
          isSingleHeader ? 'flex-row justify-between items-center px-1' : 'flex-col justify-between items-start',
          cellClassName
        )}
        style={{ minWidth: scaledWidth, width: scaledWidth, ...cellStyles }}
      >
        {!renderHeader && (
          <>
            <HeaderCaption
              isSingleHeader={isSingleHeader}
              isFilterVisible={isFilterVisible}
              headerKey={headData.key}
              caption={headData?.caption}
              hideFilterSort={headData?.hideFilter?.sort || false}
              hideHeaderAction={headData?.hideHeaderAction || false}
            />

            {isFilterVisible && (
              <HeaderFilter
                headerMode={headerMode}
                headerKey={headData?.key}
                filterSelectionOptions={headData?.filterSelectionOptions || []}
                hideFilter={headData?.hideFilter}
              />
            )}

            <ResizeIndicator
              handleMouseDown={(e) => {
                handleResizeChildColumn(e, {
                  parentKey,
                  freezeType,
                  parentVirtualIndex,
                  childKey: headData.key,
                });
              }}
            />
          </>
        )}

        {renderHeader && renderHeader()}
      </div>
    );
  }

  return (
    <div
      key={'table-head-group-node-' + headData.key}
      className={clsx('relative border-[#D2D2D4] !px-0 flex flex-col h-full', {
        'group/outer': !headData.children,
        'border-r': freezeType !== 'right',
        'border-l': freezeType === 'right' && !headData.children,
      })}
      style={{ minWidth: headData.width! }}
    >
      <div
        style={{ minHeight: DEFAULT_SIZE.GROUP_HEADER_HEIGHT }}
        className={clsx(
          'w-full border-b border-[#D2D2D4] text-center content-center flex items-center justify-center',
          freezeType === 'right' && 'border-l'
        )}
      >
        {headData.caption}
      </div>

      <div className="flex-1 w-full flex min-h-0">
        {headData.children?.map((child) => (
          <HeaderCellNested
            key={'nested-header-cell-' + child.key}
            headData={child}
            parentKey={parentKey}
            parentVirtualIndex={parentVirtualIndex}
            freezeType={freezeType}
          />
        ))}
      </div>
    </div>
  );
}

export default memo(HeaderCellNested);
