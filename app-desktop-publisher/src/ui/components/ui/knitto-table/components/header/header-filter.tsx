import { memo } from 'react';
import Icon from '../../icons';
import FilterSelection from './filter-selection';
import FilterAdvance from './filter-advance';
import FilterSearch from './filter-search';
import clsx from 'clsx';
import { type IHeader, type TFilterAdvanceConfig } from '../../lib';
import { useAdvance, useIsResetFilter, useSearch, useSelection, useSort, useTableKey } from '../../context/filter-context';
import { useFilterHeight } from '../../context/ui-context';

interface IHeaderFilter {
  headerKey: string;
  filterSelectionOptions: string[];
  headerMode: 'single' | 'double';
  hideFilter: IHeader<unknown>['hideFilter'];
}

const HeaderFilter = ({ headerKey, filterSelectionOptions, headerMode, hideFilter }: IHeaderFilter) => {
  const tableKey = useTableKey();
  const search = useSearch();
  const sort = useSort();
  const selection = useSelection();
  const advance = useAdvance();
  const isResetFilter = useIsResetFilter();

  const filterHeight = useFilterHeight();

  const isSingleHeader = headerMode === 'single';
  const calcFilterHeight = isSingleHeader ? 'auto' : filterHeight;

  const isHideFilterSelection = hideFilter?.filterSelection;
  const isHideFilterAdvance = hideFilter?.filterAdvance;
  const isHideFilterSort = hideFilter?.sort;
  const isHideFilterSearch = hideFilter?.search;

  const sessionStorageSearch = JSON.parse(sessionStorage.getItem('search_per_column') || '{}') as Record<string, Record<string, string>>;

  const sessionStorageSelection = JSON.parse(sessionStorage.getItem('filter_selection_per_column') || '{}') as Record<
    string,
    Record<string, string[]>
  >;

  const sessionStorageAdvance = JSON.parse(sessionStorage.getItem('filter_advance_per_column') || '{}') as Record<
    string,
    Record<string, { config_name: TFilterAdvanceConfig; value: string }>
  >;

  return (
    <div style={{ height: calcFilterHeight }} className={clsx('flex items-center space-x-1.5', isSingleHeader ? 'w-max pr-2.5' : 'w-full px-1.5')}>
      {!isHideFilterSearch && (
        <FilterSearch
          mode={isSingleHeader ? 'popout-card' : 'direct-search'}
          headerKey={headerKey}
          onSearchChange={(val) => search.updateSearch(headerKey, val)}
          onSearchClear={() => search.resetSearch(headerKey)}
          isResetFilter={isResetFilter}
          initialSearch={sessionStorageSearch?.[tableKey || '']?.[headerKey] || ''}
        />
      )}

      {!isHideFilterSelection && (
        <FilterSelection
          headerKey={headerKey?.toString() || ''}
          options={filterSelectionOptions}
          onApplyFilter={(value) => selection.updateFilter(headerKey as keyof unknown, value)}
          onResetFilter={() => selection.resetFilter(headerKey as keyof unknown)}
          isResetFilter={isResetFilter}
          initialSelectedOptions={sessionStorageSelection?.[tableKey || '']?.[headerKey] || []}
        />
      )}

      {!isHideFilterAdvance && (
        <FilterAdvance
          headerKey={headerKey?.toString() || ''}
          initialFilterValue={sessionStorageAdvance?.[tableKey || '']?.[headerKey] || { config_name: 'None', value: '' }}
          onResetFilter={() => advance.resetAdvanceFilter(headerKey as keyof unknown)}
          onApplyFilter={(config, value) => advance.updateAdvanceFilter(headerKey as keyof unknown, config, value)}
          isResetFilter={isResetFilter}
        />
      )}

      {isSingleHeader && !isHideFilterSort && (
        <Icon
          name="sort"
          className="cursor-pointer"
          sort={headerKey === sort.sortKey ? sort.sortBy : 'unset'}
          onClick={() => sort.onChangeSort(headerKey.toString())}
        />
      )}
    </div>
  );
};

export default memo(HeaderFilter);
