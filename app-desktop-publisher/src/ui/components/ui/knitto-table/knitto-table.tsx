import { useMemo, useRef, forwardRef, type ReactNode } from 'react';
import { AutoSizer } from 'react-virtualized-auto-sizer';

import { HeaderContextProvider } from './context/header-context';
import { VirtualizerContextProvider } from './context/virtualizer-context';
import { FilterContextProvider } from './context/filter-context';
import { SelectionContextProvider } from './context/selection-context';
import { UIContextProvider } from './context/ui-context';

import { useScrollBottomDetection } from './hooks';
import { DEFAULT_SIZE, type IAdjustedHeader, type IKnittoTable, type IVirtualTableRef } from './lib';
import { TypedRegularTable, TypedVirtualTable } from './typed-lazy-components';

import './lib/style.css';
import LoadingIndicator from './components/loading-indicator';
import TableScrollWrapper from './components/table-scroll-wrapper';
import type { Virtualizer } from '@tanstack/react-virtual';

const KnittoTable = forwardRef(<TData,>(props: IKnittoTable<TData>, ref: React.ForwardedRef<IVirtualTableRef>) => {
  const {
    rowKey,
    data,
    headers,
    headerMode = 'double',
    headerHeight = DEFAULT_SIZE.HEADER_HEIGTH,
    filterHeight = DEFAULT_SIZE.FILTER_HEIGHT,
    isLoading = false,
    isResetFilter = false,
    useFooter = false,
    useAutoSizer = true,
    useDynamicRowHeight = false,
    enableColumnVirtualization = true,
    useRegularTable = false,
    useSessionFilter,
    useServerFilter = { sort: false, search: false, selection: false, advance: false },
    classNameOuterTable,
    classNameCell,
    onChangeCheckboxRowSelection,
    onRenderExpandedContent,
    onChangeFilter,
    onScroll,
    onScrollTouchBottom,
  } = props;

  // Local ref for scrollable element
  const scrollElementRef = useRef<HTMLDivElement | null>(null);

  /**
   * Handle ref forwarding
   * - Jika ref adalah function, maka set ref ke scrollElementRef.current
   * - Jika ref adalah mutable ref object, maka set current ke scrollElementRef.current
   */
  const handleScrollElementRef = (element: HTMLDivElement | null) => {
    scrollElementRef.current = element;

    if (element) {
      const refValue = {
        virtualizer: null, // Akan diupdate ketika virtualizer ready
        scrollElement: element,
      };

      if (typeof ref === 'function') {
        ref(refValue);
      } else if (ref) {
        (ref as React.MutableRefObject<IVirtualTableRef>).current = refValue;
      }
    }
  };

  // Handle rowVirtualizer ready callback - update virtualizer saja
  const handleRowVirtualizerReady = (virtualizer: Virtualizer<HTMLDivElement, Element>) => {
    if (ref) {
      if (typeof ref === 'function') {
        // Function ref - set ulang dengan virtualizer
        const refValue = {
          virtualizer,
          scrollElement: scrollElementRef.current,
        };
        ref(refValue);
      } else {
        // Object ref - update virtualizer saja
        if (ref.current) {
          ref.current.virtualizer = virtualizer;
        }
      }
    }
  };

  // Setup scroll bottom detection
  useScrollBottomDetection(scrollElementRef, {
    threshold: 100,
    throttleMs: 100,
    onScrollTouchBottom: onScrollTouchBottom || (() => {}),
  });

  /**
   * Process headers with default values
   * - Set visible to true
   * - Set width to DEFAULT_SIZE.COLUMN_WIDTH
   */
  const modifiedHeaders = useMemo(() => {
    return headers.map((header) => ({
      ...header,
      visible: true,
      width: header.width || DEFAULT_SIZE.COLUMN_WIDTH,
    }));
  }, [headers]);

  /**
   * Render Virtual Table
   * - Menggunakan virtualization untuk performa yang lebih baik
   * - Lebih baik untuk dataset besar atau ketika perlu virtualisasi kolom
   */
  const renderVirtualTable = (width?: number, height?: number) => (
    <VirtualizerContextProvider
      rowKey={rowKey}
      scrollElementRef={scrollElementRef}
      enableColumnVirtualization={enableColumnVirtualization}
      onRowVirtualizerReady={handleRowVirtualizerReady}
    >
      <UIContextProvider
        filterHeight={filterHeight}
        useFooter={useFooter}
        expandedContent={(data) => onRenderExpandedContent?.(data as TData)}
        headerMode={headerMode}
        headerHeight={headerHeight}
        classNameCell={classNameCell}
        useDynamicRowHeight={useDynamicRowHeight}
      >
        <TableScrollWrapper
          handleScrollElementRef={handleScrollElementRef}
          isLoading={isLoading}
          classNameOuterTable={classNameOuterTable || ''}
          useAutoSizer={useAutoSizer}
          width={width}
          height={height}
          onScroll={onScroll || (() => {})}
        >
          <TypedVirtualTable {...props} />
        </TableScrollWrapper>
      </UIContextProvider>
    </VirtualizerContextProvider>
  );

  /**
   * Render Regular Table
   * - Menggunakan native HTML table elements
   * - Tidak menggunakan virtualization
   * - Lebih baik untuk dataset kecil atau ketika perlu standar table semantics
   */
  const renderRegularTable = (width?: number, height?: number) => (
    <UIContextProvider
      filterHeight={filterHeight}
      useFooter={useFooter}
      expandedContent={(data) => onRenderExpandedContent?.(data as TData)}
      headerMode={headerMode}
      headerHeight={headerHeight}
      classNameCell={classNameCell}
      useDynamicRowHeight={useDynamicRowHeight}
    >
      <TableScrollWrapper
        handleScrollElementRef={handleScrollElementRef}
        isLoading={isLoading}
        classNameOuterTable={classNameOuterTable || ''}
        useAutoSizer={useAutoSizer}
        width={width}
        height={height}
        onScroll={onScroll || (() => {})}
      >
        <TypedRegularTable scrollElementRef={scrollElementRef} {...props} />
      </TableScrollWrapper>
    </UIContextProvider>
  );

  /**
   * Render Table Content
   * - Cek apakah menggunakan regular table atau virtual table
   */
  const renderTableContent = (width?: number, height?: number) => (
    <HeaderContextProvider initialColumns={modifiedHeaders as IAdjustedHeader[]} useRegularTable={useRegularTable}>
      <FilterContextProvider
        dataSource={data}
        useServerFilter={useServerFilter}
        onChangeFilter={onChangeFilter}
        isResetFilter={isResetFilter}
        useSessionFilter={useSessionFilter}
      >
        <SelectionContextProvider onChangeCheckboxRowSelection={onChangeCheckboxRowSelection}>
          {useRegularTable ? renderRegularTable(width, height) : renderVirtualTable(width, height)}
        </SelectionContextProvider>
      </FilterContextProvider>
    </HeaderContextProvider>
  );

  // Render with AutoSizer
  if (useAutoSizer) {
    return (
      <div className="w-full h-full relative">
        <AutoSizer
          renderProp={({ width, height }: { width: number | undefined; height: number | undefined }) =>
            renderTableContent(width, height)
          }
        />
        {isLoading && <LoadingIndicator />}
      </div>
    );
  }

  // Render without AutoSizer
  return renderTableContent();
});

export default KnittoTable as <TData>(props: IKnittoTable<TData> & { ref?: React.ForwardedRef<IVirtualTableRef> }) => ReactNode;
