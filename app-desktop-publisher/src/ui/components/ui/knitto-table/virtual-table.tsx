import { type ReactNode } from 'react';
import { DEFAULT_SIZE, type IKnittoTable } from './lib';
import VirtualTableHeader from './virtual-table-header';
import VirtualTableBody from './virtual-table-body';
import VirtualTableFooter from './virtual-table-footer';
import EmptyDataIndicator from './components/empty-data-indicator';
import { useContainerHeight } from './context/virtualizer-context';

export type TPickKnittoTable<TData> = Pick<
  IKnittoTable<TData>,
  | 'headerHeight'
  | 'rowHeight'
  | 'filterHeight'
  | 'footerHeight'
  | 'headerMode'
  | 'onClickRow'
  | 'onDoubleClickRow'
  | 'onRightClickRow'
  | 'onReorderRows'
  | 'reorderOnlyFromToggle'
  | 'useFooter'
  | 'isLoading'
>;

function VirtualTable<TData>(props: TPickKnittoTable<TData>) {
  const {
    isLoading = false,
    rowHeight = DEFAULT_SIZE.ROW_HEIGHT,
    headerHeight = DEFAULT_SIZE.HEADER_HEIGTH,
    filterHeight = DEFAULT_SIZE.FILTER_HEIGHT,
    footerHeight = DEFAULT_SIZE.FOOTER_HEIGHT,
    headerMode = 'double',
    onClickRow,
    onDoubleClickRow,
    onRightClickRow,
    onReorderRows,
    reorderOnlyFromToggle,
    useFooter,
  } = props;

  const containerHeight = useContainerHeight();

  return (
    <>
      <VirtualTableHeader />
      {useFooter && <VirtualTableFooter footerHeight={footerHeight} />}

      <VirtualTableBody
        headerHeight={headerHeight}
        footerHeight={footerHeight}
        filterHeight={filterHeight}
        rowHeight={rowHeight}
        headerMode={headerMode}
        onClickRowToParent={onClickRow}
        onDoubleClickRowToParent={onDoubleClickRow}
        onRightClickRowToParent={onRightClickRow}
        onReorderRowsToParent={onReorderRows}
        reorderOnlyFromToggle={reorderOnlyFromToggle}
      />

      {!isLoading && <EmptyDataIndicator containerHeight={containerHeight} />}
    </>
  );
}

// export default VirtualTable as <TData>(props: TPickKnittoTable<TData>) => ReactNode;
export default VirtualTable as <TData>(props: TPickKnittoTable<TData> & { fallback?: ReactNode }) => ReactNode;
