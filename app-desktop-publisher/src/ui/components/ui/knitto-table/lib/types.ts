import type { Virtualizer } from '@tanstack/react-virtual';
import type { ReactNode } from 'react';
import { FILTER_ADVANCE_CONFIG } from './constants';

export interface IKnittoTable<TData> {
  /**
   * Array of column definitions for the table headers.
   * Each header defines a column's key, caption, width, filters, and custom renderers.
   *
   * @example
   * ```tsx
   * headers={[
   *   { key: 'id', caption: 'ID', width: 80 },
   *   { key: 'name', caption: 'Name', width: 200 }
   * ]}
   * ```
   */
  headers: IHeader<TData>[];

  /**
   * Array of data items to be displayed in the table.
   * Each item represents a row in the table.
   *
   * @example
   * ```tsx
   * data={[
   *   { id: 1, name: 'John Doe', email: 'john@example.com' },
   *   { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
   * ]}
   * ```
   */
  data: TData[];

  /**
   * Determines the header display mode.
   * - 'single': Single row header
   * - 'double': Header with grouping support (parent-child headers)
   *
   * @default 'double'
   * @example
   * ```tsx
   * headerMode="double"
   * ```
   */
  headerMode?: 'single' | 'double';

  /**
   * Unique key identifier for each row.
   * Can be a property key of TData or a function that returns a unique string.
   *
   * @example
   * ```tsx
   * // Using property key
   * rowKey="id"
   *
   * // Using function
   * rowKey={(item, index) => `${item.id}-${index}`}
   * ```
   */
  rowKey: keyof TData | ((data: TData, index: number) => string);

  /**
   * Custom CSS class name for the outer table container.
   *
   * @example
   * ```tsx
   * classNameOuterTable="rounded-lg shadow-md border border-gray-200"
   * ```
   */
  classNameOuterTable?: string;

  /**
   * Shows a loading indicator overlay when true.
   *
   * @default false
   * @example
   * ```tsx
   * isLoading={isFetchingData}
   * ```
   */
  isLoading?: boolean;

  /**
   * When true, resets all active filters to their initial state.
   *
   * @default false
   * @example
   * ```tsx
   * isResetFilter={shouldResetFilters}
   * ```
   */
  isResetFilter?: boolean;

  /**
   * Enables the table footer with summary or pagination controls.
   *
   * @default false
   * @example
   * ```tsx
   * useFooter={true}
   * ```
   */
  useFooter?: boolean;

  /**
   * Automatically adjusts table size to fit the parent container.
   *
   * @default true
   * @example
   * ```tsx
   * useAutoSizer={true}
   * ```
   */
  useAutoSizer?: boolean;

  /**
   * Enables filter state persistence in session storage.
   * Requires a unique table key to store and retrieve filter state.
   *
   * @example
   * ```tsx
   * useSessionFilter={{ tableKey: 'users-table' }}
   * ```
   */
  useSessionFilter?: { tableKey: string };

  /**
   * Configures server-side filtering options.
   * When enabled, filter changes trigger callbacks instead of client-side filtering.
   *
   * @example
   * ```tsx
   * useServerFilter={{
   *   sort: true,
   *   search: true,
   *   selection: true,
   *   advance: true
   * }}
   * ```
   */
  useServerFilter?: {
    /** Enable server-side sorting */
    sort?: boolean;
    /** Enable server-side search */
    search?: boolean;
    /** Enable server-side selection filtering */
    selection?: boolean;
    /** Enable server-side advanced filtering */
    advance?: boolean;
  };

  /**
   * Enables dynamic row height calculation based on content.
   * Useful for rows with variable content heights.
   *
   * enableColumnVirtualization must be false due to dynamic row
   * height requires all columns to be rendered for proper measurement.
   *
   * @default false
   * @example
   * ```tsx
   * enableColumnVirtualization={false}
   * useDynamicRowHeight={true}
   * ```
   */
  useDynamicRowHeight?: boolean;

  /**
   * Enables horizontal column virtualization for performance with many columns.
   *
   * @default true
   * @example
   * ```tsx
   * enableColumnVirtualization={true}
   * ```
   */
  enableColumnVirtualization?: boolean;

  /**
   * Use native HTML table elements instead of virtualized divs.
   * When true, disables virtualization and renders using <table>, <thead>, <tbody>, <tr>, <td>.
   * Better for small datasets or when you need standard table semantics.
   *
   * @default false
   * @example
   * ```tsx
   * useRegularTable={true}
   * ```
   */
  useRegularTable?: boolean;

  /**
   * Fixed height for each row in pixels.
   *
   * @default 28
   * @example
   * ```tsx
   * rowHeight={60}
   * ```
   */
  rowHeight?: number;

  /**
   * Height of the header row in pixels.
   *
   * @default 32
   * @example
   * ```tsx
   * headerHeight={56}
   * ```
   */
  headerHeight?: number;

  /**
   * Height of the filter row in pixels.
   *
   * @default 28
   * @example
   * ```tsx
   * filterHeight={52}
   * ```
   */
  filterHeight?: number;

  /**
   * Height of the footer row in pixels.
   *
   * @default 32
   * @example
   * ```tsx
   * footerHeight={64}
   * ```
   */
  footerHeight?: number;

  /**
   * Hides the table header when true.
   *
   * @default false
   * @example
   * ```tsx
   * hideHeader={true}
   * ```
   */
  hideHeader?: boolean;

  /**
   * Function to dynamically generate CSS class names for table cells.
   * Useful for conditional styling based on cell data.
   *
   * @example
   * ```tsx
   * classNameCell={(data, rowIndex, columnIndex) =>
   *   data.status === 'active' ? 'bg-green-50' : 'bg-red-50'
   * }
   * ```
   *
   * * * @example
   * Highlight row with blue border
   * ```tsx
   * classNameCell={(data, rowIndex, columnIndex, opts) => {
   *   return clsx({
   *     '!border-l !border-l-blue-950': opts?.isFirstIndex && opts?.isRowHighlighted,
   *     '!border-r !border-r-blue-950': opts?.isLastIndex && opts?.isRowHighlighted,
   *     '!border-y !border-y-blue-950 bg-[#ECEEFF]': opts?.isRowHighlighted,
   *   });
   * }}
   */
  classNameCell?: (
    data: TData,
    rowIndex: number,
    columnIndex: number,
    opts?: {
      isRowHighlighted?: boolean;
      isFirstIndex?: boolean;
      isLastIndex?: boolean;
      hasFreezeLeft?: boolean;
      hasFreezeRight?: boolean;
      isFreezeLeft?: boolean;
      isFreezeRight?: boolean;
    }
  ) => string;

  /**
   * Custom render function for expanded row content.
   *
   * @deprecated Use `onRenderExpandedContent` instead
   * @example
   * ```tsx
   * renderExpandedRow={(item) => <div>Details for {item.name}</div>}
   * ```
   */
  renderExpandedRow?: (item: TData) => React.ReactNode;

  /**
   * Callback fired when a row is expanded or collapsed.
   *
   * @example
   * ```tsx
   * onRowExpand={(item) => console.log('Expanded:', item)}
   * ```
   */
  onRowExpand?: (item: TData) => void;

  /**
   * Callback fired when a row is clicked.
   *
   * @param item - The data item of the clicked row.
   * @param rowIndex - The index of the clicked row.
   * @param columnIndex - The index of the clicked column.
   * @param groupOfItems - The group of items that are clicked (only available if the row has rowspan)
   *
   * @example
   * ```tsx
   * onClickRow={(item, rowIndex, columnIndex, groupOfItems) => {
   *   console.log('Clicked row:', item, 'at', rowIndex, columnIndex, 'with group of items:', groupOfItems);
   * }}
   * ```
   */
  onClickRow?: (item: TData, rowIndex: number, columnIndex: number, groupOfItems?: TData[]) => void;

  /**
   * Callbacks for filter change events.
   * Used in server-side filtering mode to handle filter updates.
   *
   * @example
   * ```tsx
   * onChangeFilter={{
   *   sort: (key, sortBy) => fetchData({ sortKey: key, sortOrder: sortBy }),
   *   search: (searchData) => fetchData({ search: searchData }),
   *   selection: (selectionData) => fetchData({ filters: selectionData }),
   *   advance: (advanceData) => fetchData({ advancedFilters: advanceData })
   * }}
   * ```
   */
  onChangeFilter?: {
    /** Callback when sort changes */
    sort?: (key: keyof TData, sortBy: TSortOrder) => void;
    /** Callback when search changes */
    search?: (data: Record<keyof TData, string>) => void;
    /** Callback when selection filter changes */
    selection?: (data: Record<keyof TData, string[]>) => void;
    /** Callback when advanced filter changes */
    advance?: (data: Record<keyof TData, { config_name: TFilterAdvanceConfig; value: string }>) => void;
  };

  /**
   * Callback fired when a row is double-clicked.
   *
   * @param item - The data item of the double-clicked row.
   * @param rowIndex - The index of the double-clicked row.
   * @param columnIndex - The index of the double-clicked column.
   *
   * @example
   * ```tsx
   * onDoubleClickRow={(item, rowIndex, columnIndex) => {
   *   console.log('Double clicked row:', item, 'at', rowIndex, columnIndex);
   * }}
   * ```
   */
  onDoubleClickRow?: (item: TData, rowIndex: number, columnIndex: number) => void;

  /**
   * Callback fired when a row is right-clicked.
   * Provides the clicked item and mouse position for context menu display.
   *
   * @param item - The data item of the right-clicked row.
   * @param position - The position of the right-clicked row.
   *
   * @example
   * ```tsx
   * onRightClickRow={(item, position) => {
   *   console.log('Right clicked row:', item, 'at', position.x, position.y);
   * }}
   * ```
   */
  onRightClickRow?: (item: TData, position: { x: number; y: number }) => void;

  /**
   * Callback when row order changes via drag-drop.
   * When provided, rows become draggable for reordering.
   * Indices refer to displayed (filtered) data.
   *
   * @example
   * ```tsx
   * onReorderRows={(fromIndex, toIndex) => {
   *   setData((prev) => {
   *     const next = [...prev];
   *     [next[fromIndex], next[toIndex]] = [next[toIndex], next[fromIndex]];
   *     return next;
   *   });
   * }}
   * ```
   */
  onReorderRows?: (fromIndex: number, toIndex: number) => void;

  /**
   * When true, reorder can only be initiated from the row-reorder column (key: 'row-reorder').
   * When false, the entire row is draggable (default behavior).
   * Requires a column with key 'row-reorder' in headers.
   *
   * @default false
   * @example
   * ```tsx
   * reorderOnlyFromToggle={true}
   * headers={[
   *   { key: 'row-reorder', caption: '', width: 40 },
   *   { key: 'id', caption: 'ID', width: 80 },
   *   ...
   * ]}
   * ```
   */
  reorderOnlyFromToggle?: boolean;

  /**
   * Custom render function for expanded row content.
   * Replaces deprecated `renderExpandedRow`.
   *
   * @example
   * ```tsx
   * onRenderExpandedContent={(item) => (
   *   <div className="p-4 bg-gray-50">
   *     <h3>Details</h3>
   *     <p>{item.description}</p>
   *   </div>
   * )}
   * ```
   */
  onRenderExpandedContent?: (item: TData) => ReactNode;

  /**
   * Callback fired when checkbox row selection changes.
   * Provides arrays of selected and deselected row keys, and select-all status.
   *
   * @example
   * ```tsx
   * onChangeCheckboxRowSelection={(selected, deselected, isSelectAll) => {
   *   console.log('Selected:', selected);
   *   console.log('Deselected:', deselected);
   *   console.log('Select All:', isSelectAll);
   * }}
   * ```
   */
  onChangeCheckboxRowSelection?: (selectedRows: (string | number)[], deselectedRows: (string | number)[], isSelectAll: boolean) => void;

  /**
   * Callback fired when user scrolls to the bottom of the table.
   * Useful for implementing infinite scroll or lazy loading.
   *
   * @example
   * ```tsx
   * onScrollTouchBottom={() => {
   *   loadMoreData();
   * }}
   * ```
   */
  onScrollTouchBottom?: () => void;

  /**
   * Callback fired when the table is scrolled.
   * Provides current scroll position (top and left).
   *
   * @example
   * ```tsx
   * onScroll={(scrollTop, scrollLeft) => {
   *   console.log('Scroll position:', scrollTop, scrollLeft);
   * }}
   * ```
   */
  onScroll?: (scrollTop: number, scrollLeft: number) => void;
}
export interface IVirtualTableRef {
  /**
   * Virtualizer instance for the table.
   * @type {Virtualizer<HTMLDivElement, Element> | null}
   *
   * @example
   * ```tsx
   * import { type IVirtualTableRef } from 'knitto-table';
   *
   * const tableRef = useRef<IVirtualTableRef>(null);
   *
   * const scrollToIndex = () => {
   *   if (!tableRef.current) return;
   *
   *   tableRef.current.virtualizer?.scrollToIndex(index, { align: 'start', behavior: 'smooth' });
   * }
   *
   *
   * <KnittoTable ref={tableRef} ... />
   * ```
   *
   */
  virtualizer: Virtualizer<HTMLDivElement, Element> | null;

  /**
   * Scroll element for the table.
   * @type {HTMLDivElement | null}
   *
   * ```tsx
   * import { type IVirtualTableRef } from 'knitto-table';
   *
   * const tableRef = useRef<IVirtualTableRef>(null);
   *
   * const scrollToTop = () => {
   *   if (!tableRef.current) return;
   *
   *   tableRef.current.scrollElement?.scrollTo({ top: 0, behavior: 'smooth' });
   * }
   *
   *
   * <KnittoTable ref={tableRef} ... />
   */
  scrollElement: HTMLDivElement | null;
}

/**
 * Configuration interface for table column headers.
 * Defines column properties, filters, custom renderers, and nested column grouping.
 *
 * @example
 * ```tsx
 * const header: IHeader<User> = {
 *   key: 'name',
 *   caption: 'Full Name',
 *   width: 200,
 *   freeze: 'left',
 *   renderCell: (user) => <strong>{user.name}</strong>
 * }
 * ```
 */
export interface IHeader<TData> {
  /**
   * Unique identifier for the column.
   * Can be a data property key or special keys like 'expand', 'action', 'row-selection'.
   *
   * @example
   * ```tsx
   * // Data property key
   * key: 'email'
   *
   * // Special keys
   * key: 'expand'
   * key: 'row-selection'
   * key: 'row-reorder'
   * key: 'action'
   * ```
   */
  key: keyof TData | 'expand' | 'action' | 'row-selection' | 'row-reorder' | string;

  /**
   * Display text for the column header.
   *
   * @example
   * ```tsx
   * caption: 'User Name'
   * ```
   */
  caption: string;

  /**
   * Fixed width of the column in pixels.
   * If not specified, column width will be calculated dynamically.
   *
   * @example
   * ```tsx
   * width: 150
   * ```
   */
  width?: number;

  /**
   * Prevents the column from stretching to fill available space.
   *
   * @default false
   * @example
   * ```tsx
   * noStretch: true
   * ```
   */
  noStretch?: boolean;

  /**
   * Array of options for the selection filter dropdown.
   * Enables a multi-select filter for this column.
   *
   * @example
   * ```tsx
   * filterSelectionOptions: ['Active', 'Inactive', 'Pending']
   * ```
   */
  filterSelectionOptions?: string[];

  /**
   * Freezes the column to the left or right side of the table.
   * Frozen columns remain visible when scrolling horizontally.
   *
   * @example
   * ```tsx
   * freeze: 'left'
   * freeze: 'right'
   * ```
   */
  freeze?: 'left' | 'right';

  /**
   * Controls column visibility.
   *
   * @default true
   * @example
   * ```tsx
   * visible: false
   * ```
   */
  visible?: boolean;

  /**
   * Hides the header action buttons (sort, filter, etc.).
   *
   * @default false
   * @example
   * ```tsx
   * hideHeaderAction: true
   * ```
   */
  hideHeaderAction?: boolean;

  /**
   * Selectively hides specific filter types for this column.
   *
   * @example
   * ```tsx
   * hideFilter: {
   *   sort: true,
   *   search: false,
   *   filterSelection: true,
   *   filterAdvance: false
   * }
   * ```
   */
  hideFilter?: {
    /** Hide sort filter */
    sort?: boolean;
    /** Hide search filter */
    search?: boolean;
    /** Hide selection filter */
    filterSelection?: boolean;
    /** Hide advanced filter */
    filterAdvance?: boolean;
  };

  /**
   * Custom renderer for the header cell.
   * Overrides the default header rendering with custom content.
   *
   * @example
   * ```tsx
   * renderHeader: () => (
   *   <div className="flex items-center gap-2">
   *     <Icon />
   *     <span>Custom Header</span>
   *   </div>
   * )
   * ```
   */
  renderHeader?: () => React.ReactNode;

  /**
   * Custom renderer for table cells in this column.
   * Provides full control over cell content display.
   *
   * @example
   * ```tsx
   * renderCell: (user) => (
   *   <div className="flex items-center gap-2">
   *     <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
   *     <span>{user.name}</span>
   *   </div>
   * )
   * ```
   */
  renderCell?: (item: TData) => React.ReactNode;

  /**
   * Custom renderer for the expand/collapse toggle button.
   * Only applicable for columns with key 'expand'.
   *
   * @example
   * ```tsx
   * renderExpandToggle: (item, isExpanded) => (
   *   <button>
   *     {isExpanded ? <ChevronDown /> : <ChevronRight />}
   *   </button>
   * )
   * ```
   */
  renderExpandToggle?: (item: TData, isExpanded: boolean) => React.ReactNode;

  /**
   * Custom renderer for the footer cell in this column.
   * Useful for displaying column summaries or totals.
   *
   * @example
   * ```tsx
   * renderFooter: () => (
   *   <div className="font-bold">
   *     Total: {calculateTotal()}
   *   </div>
   * )
   * ```
   */
  renderFooter?: () => React.ReactNode;

  /**
   * Nested child columns for header grouping.
   * Used with headerMode="double" to create multi-level headers.
   * Note: Child columns cannot have freeze property.
   *
   * @example
   * ```tsx
   * children: [
   *   { key: 'firstName', caption: 'First Name', width: 100 },
   *   { key: 'lastName', caption: 'Last Name', width: 100 }
   * ]
   * ```
   */
  children?: Omit<IHeader<TData>, 'freeze'>[];

  /**
   * Enable automatic rowspan merging for consecutive duplicate values.
   * Only works with useRegularTable={true}.
   * Data must be pre-sorted by this column for proper merging.
   *
   * @default false
   * @example
   * ```tsx
   * {
   *   key: 'category',
   *   caption: 'Category',
   *   enableRowSpan: true,
   *   hideFilter: { sort: true }  // Recommended to disable sort
   * }
   * ```
   */
  enableRowSpan?: boolean;
  /**
   * Disable column resizing.
   *
   * @default false
   * @example
   * ```tsx
   * disableResizeColumn={true}
   * ```
   */
  disableResizeColumn?: boolean;
}

/**
 * Extended header interface with dynamic properties.
 * Used internally for header adjustments and calculations.
 */
export interface IAdjustedHeader extends IHeader<unknown> {
  [key: string]: unknown;
}

/**
 * Wrapper interface for flattened data items.
 * Used to distinguish between regular rows and expanded content rows.
 *
 * @example
 * ```tsx
 * const flattenedItem: IFlattenedData<User> = {
 *   type: 'row',
 *   item: { id: 1, name: 'John' }
 * }
 * ```
 */
export interface IFlattenedData<T> {
  /**
   * Type of the data item.
   * - 'row': Regular data row
   * - 'expanded': Expanded content row
   *
   * @example
   * ```tsx
   * type: 'row'
   * type: 'expanded'
   * ```
   */
  type: string;

  /**
   * The actual data item.
   */
  item: T;
}

/**
 * Props interface for the VirtualTableBody component.
 * Contains configuration for rendering virtualized table rows and columns.
 */
export interface IVirtualTableBody<TData> {
  /**
   * Current data item being rendered (optional).
   */
  data?: TData;

  /**
   * Array of header configurations for the table columns.
   */
  headers: IHeader<TData>[];

  /**
   * Height of the header row in pixels.
   */
  headerHeight: number;

  /**
   * TanStack Virtual row virtualizer instance.
   * Manages vertical scrolling and row rendering.
   */
  rowVirtualizer: Virtualizer<HTMLDivElement, Element>;

  /**
   * TanStack Virtual column virtualizer instance.
   * Manages horizontal scrolling and column rendering.
   */
  columnVirtualizer: Virtualizer<HTMLDivElement, Element>;

  /**
   * Flattened array of data items including regular rows and expanded content.
   */
  flattenedData: IFlattenedData<TData>[];
}

/**
 * Props interface for individual table cell rendering.
 * Contains positioning, sizing, and data information for a single cell.
 */
export interface IVirtualTableCell<TData> {
  /**
   * Whether the cell is sticky (frozen) during horizontal scrolling.
   *
   * @default false
   */
  isSticky?: boolean;

  /**
   * Column header configuration for this cell.
   */
  column?: IHeader<TData>;

  /**
   * Data item for the row containing this cell.
   */
  data?: TData;

  /**
   * Width of the cell in pixels.
   */
  width: number;

  /**
   * Column index of the cell (0-based).
   */
  cellIndex: number;

  /**
   * Left position offset of the cell in pixels.
   */
  cellLeft: number;

  /**
   * Top position offset of the row in pixels.
   */
  rowStart: number;

  /**
   * Height of the row in pixels.
   */
  rowSize: number;

  /**
   * Row index in the data array (0-based).
   */
  rowIndex: number;

  /**
   * Number of columns this cell spans.
   *
   * @default 1
   */
  colSpan: number;

  /**
   * Whether this cell is part of an expanded row.
   *
   * @default false
   */
  isExpandRow: boolean;
}

/**
 * Context interface for table filtering functionality.
 * Provides state and handlers for sort, search, selection, and advanced filters.
 */
export interface ITableFilter {
  /**
   * Sort filter configuration.
   */
  sort: {
    /** Currently active sort column key, or null if no sorting */
    sortKey: string | null;
    /** Current sort order */
    sortBy: TSortOrder;
    /** Handler to toggle sort on a column */
    handleSort: (key: string) => void;
    /** Handler to set specific sort order on a column */
    handleSpecificSort: (key: string, order: TSortOrder) => void;
  };

  /**
   * Search filter configuration.
   */
  search: {
    /** Active search values by column key */
    activeSearch: Record<string, string>;
    /** Handler to apply search filter */
    handleApplySearch: (searchKey: string, value: string) => void;
    /** Handler to reset search filter */
    handleResetSearch: (searchKey: string) => void;
  };

  /**
   * Selection filter configuration (multi-select dropdown).
   */
  filterSelection: {
    /** Active filter selections by column key */
    activeFilters: Record<string, string[]>;
    /** Handler to apply selection filter */
    handleApplyFilter: (filterKey: string, value: string[]) => void;
    /** Handler to reset selection filter */
    handleResetFilter: (filterKey: string) => void;
  };

  /**
   * Advanced filter configuration.
   */
  filterAdvance: {
    /** Active advanced filters by column key */
    activeFilters: Record<string, { config_name: string; value: string }>;
    /** Handler to apply advanced filter */
    handleApplyFilter: (filterKey: string, configName: TFilterAdvanceConfig, value: string) => void;
    /** Handler to reset advanced filter */
    handleResetFilter: (filterKey: string) => void;
  };
}

/**
 * Props interface for icon components.
 * Extends standard SVG props with custom styling options.
 *
 * @example
 * ```tsx
 * <Icon className="w-5 h-5" color="#3b82f6" />
 * ```
 */
export interface IIconProps extends React.SVGProps<SVGSVGElement> {
  /**
   * Custom CSS class name for styling.
   *
   * @example
   * ```tsx
   * className="w-6 h-6 text-blue-500"
   * ```
   */
  className?: string;

  /**
   * Fill color for the icon.
   *
   * @example
   * ```tsx
   * color="#3b82f6"
   * color="currentColor"
   * ```
   */
  color?: string;
}

/**
 * Sort order type for column sorting.
 * - 'asc': Ascending order (A-Z, 0-9)
 * - 'desc': Descending order (Z-A, 9-0)
 * - 'unset': No sorting applied
 *
 * @example
 * ```tsx
 * const sortOrder: TSortOrder = 'asc';
 * ```
 */
export type TSortOrder = 'asc' | 'desc' | 'unset';

/**
 * Advanced filter configuration type.
 * Refers to available filter operators from FILTER_ADVANCE_CONFIG constant.
 *
 * @example
 * ```tsx
 * const filterConfig: TFilterAdvanceConfig = 'equals';
 * ```
 */
export type TFilterAdvanceConfig = keyof typeof FILTER_ADVANCE_CONFIG;
