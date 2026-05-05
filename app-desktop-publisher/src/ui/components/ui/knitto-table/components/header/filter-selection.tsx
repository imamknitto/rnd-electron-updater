import { useVirtualizer, Virtualizer } from '@tanstack/react-virtual';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import useOnClickOutside from '../../hooks/use-click-outside';
import { DEFAULT_SIZE } from '../../lib';
import Icons from '../../icons';
import { createPortal } from 'react-dom';
import FilterCard from './filter-card';
import InputSearch from '../input-search';
import FilterAction from './filter-action';
import Checkbox from '../checkbox';

interface IFilterSelection {
  headerKey: string;
  options: string[];
  isResetFilter?: boolean;
  initialSelectedOptions?: string[];
  onApplyFilter: (value: string[]) => void;
  onResetFilter: () => void;
}

interface ISelectionList extends Pick<IFilterSelection, 'options' | 'headerKey'> {
  scrollRef: React.RefObject<HTMLDivElement>;
  rowVirtualizer: Virtualizer<HTMLDivElement, Element>;
  isEmptyOptions?: boolean;
  isCheked: (value: string) => boolean;
  onCheckboxChange: (value: string) => void;
}

const filteringOptions = (options: string[], searchQuery: string) => {
  if (!options) return [];

  const cleanOptions = options.filter((opt) => typeof opt === 'string' || typeof opt === 'number');

  if (!searchQuery) return cleanOptions;

  return cleanOptions.filter((option) => {
    const optionStr = String(option).toLowerCase(); // ubah ke string
    return optionStr.includes(searchQuery.toLowerCase());
  });
};

function FilterSelection(props: IFilterSelection) {
  const { options, headerKey, onApplyFilter, onResetFilter, isResetFilter, initialSelectedOptions = [] } = props;

  const filterRef = useRef<HTMLDivElement>(null);
  const filterScrollRef = useRef<HTMLDivElement>(null);

  const [filterCard, setFilterCard] = useState({ show: false, position: { top: 0, left: 0 } });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>(initialSelectedOptions || []);

  const filteredOptions = useMemo(() => {
    return filteringOptions(options || [], searchQuery);
  }, [options, searchQuery]);

  useEffect(() => {
    if (!isResetFilter) return;
    setSearchQuery('');
    setSelectedOptions([]);
  }, [isResetFilter]);

  useOnClickOutside([filterRef], () => {
    if (filterCard.show) setFilterCard({ show: false, position: { top: 0, left: 0 } });
  });

  const rowVirtualizer = useVirtualizer({
    count: filteredOptions.length,
    getScrollElement: () => filterScrollRef.current,
    estimateSize: () => 24,
    overscan: 5,
  });

  const handleApplyFilter = () => {
    onApplyFilter(selectedOptions);
    setFilterCard({ show: false, position: { top: 0, left: 0 } });
  };

  const handleResetFilter = () => {
    onResetFilter();
    setSelectedOptions([]);
    setFilterCard({ show: false, position: { top: 0, left: 0 } });
  };

  const onCheckboxChange = (value: string) => {
    setSelectedOptions((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));
  };

  const handleOpenFilterCard = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const normalLeftPosition = rect.left - DEFAULT_SIZE.CARD_FILTER_WIDTH / 2;
    const normalTopPosition = rect.top + 25;

    const totalLeftPos = rect.left + DEFAULT_SIZE.CARD_FILTER_WIDTH / 2;
    const totalTopPos = rect.top + DEFAULT_SIZE.CARD_FILTER_HEIGHT + 37;

    const isRightOverflowed = totalLeftPos > viewportWidth;
    const isLeftOverflowed = normalLeftPosition < 0;
    const isBottomOverflowed = totalTopPos > viewportHeight;

    let calculatedLeftPosition = normalLeftPosition;
    let calculatedTopPosition = normalTopPosition;

    if (isRightOverflowed) {
      // geser ke kiri biar ga overflow right.
      calculatedLeftPosition = viewportWidth - DEFAULT_SIZE.CARD_FILTER_WIDTH - 10;
    } else if (isLeftOverflowed) {
      // geser ke kanan biar ga overflow left>
      calculatedLeftPosition = 10;
    }

    if (isBottomOverflowed) {
      // place the card above the trigger to avoid bottom overflow
      calculatedTopPosition = rect.top - (DEFAULT_SIZE.CARD_FILTER_HEIGHT + 12);
    }

    setFilterCard((prev) => ({
      ...prev,
      show: true,
      position: { top: calculatedTopPosition, left: calculatedLeftPosition },
    }));
  };

  const isEmptyOpts = options.length < 1;
  const isEmptyFilteredOpts = filteredOptions.length < 1;

  return (
    <div className="relative">
      <div className="relative">
        {selectedOptions.length > 0 && <div className="absolute top-0 -right-1 size-2 rounded-full bg-blue-950 z-10" />}
        <Icons
          name="filterMultiple"
          className={clsx(
            'shrink-0 w-3.5 text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 cursor-pointer',
            filterCard.show ? '!text-gray-900 dark:!text-gray-200' : 'text-gray-500 dark:text-gray-700'
          )}
          onClick={handleOpenFilterCard}
        />
      </div>

      {filterCard.show &&
        createPortal(
          <FilterCard ref={filterRef} className="fixed" style={{ top: filterCard.position.top, left: filterCard.position.left }}>
            {!isEmptyOpts && (
              <div className="px-1.5 pt-1.5">
                <InputSearch id={`filter-selection-search-${headerKey}`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
            )}

            <SelectionList
              scrollRef={filterScrollRef as React.RefObject<HTMLDivElement>}
              rowVirtualizer={rowVirtualizer}
              options={filteredOptions}
              headerKey={headerKey}
              isEmptyOptions={isEmptyFilteredOpts}
              isCheked={(value) => selectedOptions.includes(value || '')}
              onCheckboxChange={onCheckboxChange}
            />

            <FilterAction onApply={handleApplyFilter} onReset={handleResetFilter} />
          </FilterCard>,
          document.body
        )}
    </div>
  );
}

const SelectionList = (props: ISelectionList) => {
  const { options, headerKey, rowVirtualizer, isCheked, isEmptyOptions, onCheckboxChange, scrollRef } = props;

  return (
    <div ref={scrollRef} className={clsx('relative overflow-auto h-40 my-1.5 mx-1.5 filter-scrollbar', isEmptyOptions && '!h-16')}>
      {isEmptyOptions ? (
        <div className="size-full flex justify-center items-center">
          <span className="text-gray-400 text-xs font-normal">No data available!</span>
        </div>
      ) : (
        <div style={{ height: rowVirtualizer.getTotalSize() }}>
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const optionLabel = options[virtualRow.index];

            return (
              <div
                key={virtualRow.key}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <Checkbox
                  id={`filter-selection-checkbox-${headerKey}-${virtualRow.index}`}
                  label={optionLabel}
                  checked={isCheked(optionLabel)}
                  onChecked={() => onCheckboxChange(optionLabel)}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default memo(FilterSelection);
