import { memo } from 'react';
import clsx from 'clsx';
import Icons from '../../icons';
import HeaderAction from './header-action';
import { useSort } from '../../context/filter-context';

/**
 * NOTE: Rendering Header Caption.
 * - Single Header: Tampilkan caption saja.
 * - Double Header: Tampilkan caption, sorting, dan icon burger menu toggle Header Action.
 */

interface IHeaderCaption {
  isSingleHeader: boolean;
  isFilterVisible: boolean;
  caption: string;
  headerKey: string;
  hideFilterSort: boolean;
  hideHeaderAction: boolean;
}

function HeaderCaption({ isSingleHeader, isFilterVisible, caption, headerKey, hideFilterSort, hideHeaderAction }: IHeaderCaption) {
  const sort = useSort();

  if (isSingleHeader) return caption;

  return (
    <div
      className={clsx('flex-1 flex w-full justify-between items-center px-1.5 cursor-pointer', {
        'border-b border-[#D2D2D4]': isFilterVisible,
        '!cursor-default': hideFilterSort,
      })}
      onClick={() => !hideFilterSort && sort.onChangeSort(headerKey.toString())}
    >
      <span className="flex items-center gap-1.5">
        {caption}
        {!hideFilterSort && (
          <Icons
            name="sort"
            className="cursor-pointer"
            sort={headerKey === sort.sortKey ? sort.sortBy : 'unset'}
            onClick={() => sort.onChangeSort(headerKey.toString())}
          />
        )}
      </span>

      <HeaderAction headerKey={headerKey} hideFilterSort={hideFilterSort} hideHeaderAction={hideHeaderAction} />
    </div>
  );
}

export default memo(HeaderCaption);
