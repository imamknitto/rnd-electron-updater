import type { ReactNode } from 'react';
import RegularTableBody from './regular-table-body';
import RegularTableHeader from './regular-table-header';
import { DEFAULT_SIZE, type IKnittoTable } from './lib';
import { useContainerDimensions } from './hooks/use-container-dimensions';
import EmptyDataIndicator from './components/empty-data-indicator';
import RegularTableFooter from './regular-table-footer';

type TPickKnittoTable<TData> = Pick<
  IKnittoTable<TData>,
  | 'rowKey'
  | 'headerHeight'
  | 'rowHeight'
  | 'onClickRow'
  | 'onDoubleClickRow'
  | 'onRightClickRow'
  | 'onReorderRows'
  | 'reorderOnlyFromToggle'
  | 'useFooter'
  | 'footerHeight'
  | 'isLoading'
>;

export interface IRegularTableProps<TData> extends TPickKnittoTable<TData> {
  scrollElementRef: React.RefObject<HTMLDivElement | null>;
}

function RegularTable<TData>(props: IRegularTableProps<TData>) {
  const {
    scrollElementRef,
    rowKey,
    isLoading = false,
    headerHeight = DEFAULT_SIZE.HEADER_HEIGTH,
    rowHeight = DEFAULT_SIZE.ROW_HEIGHT,
    footerHeight = DEFAULT_SIZE.FOOTER_HEIGHT,
    onClickRow,
    onDoubleClickRow,
    onRightClickRow,
    onReorderRows,
    reorderOnlyFromToggle,
    useFooter,
  } = props;

  const { height: containerHeight } = useContainerDimensions(scrollElementRef);

  return (
    <>
      <table className="w-max" style={{ tableLayout: 'fixed' }}>
        <RegularTableHeader headerHeight={headerHeight} />
        <RegularTableBody
          rowKey={rowKey}
          rowHeight={rowHeight}
          onClickRowToParent={onClickRow}
          onDoubleClickRowToParent={onDoubleClickRow}
          onRightClickRowToParent={onRightClickRow}
          onReorderRowsToParent={onReorderRows}
          reorderOnlyFromToggle={reorderOnlyFromToggle}
        />
        {useFooter && <RegularTableFooter footerHeight={footerHeight} />}
      </table>

      {!isLoading && <EmptyDataIndicator forRegularTable containerHeight={containerHeight} />}
    </>
  );
}

export default RegularTable as <TData>(props: IRegularTableProps<TData>) => ReactNode;
