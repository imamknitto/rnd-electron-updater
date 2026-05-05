import { memo, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';

import FilterAction from './filter-action';
import FilterCard from './filter-card';
import { createPortal } from 'react-dom';
import { DEFAULT_SIZE, FILTER_ADVANCE_CONFIG, getObjKeyByValue, type TFilterAdvanceConfig } from '../../lib';
import useOnClickOutside from '../../hooks/use-click-outside';
import Dropdown from '../dropdown';
import InputSearch from '../input-search';
import Icons from '../../icons';

interface IFilterAdvance {
  headerKey: string;
  isResetFilter?: boolean;
  initialFilterValue?: { config_name: TFilterAdvanceConfig; value: string };
  onApplyFilter: (config: TFilterAdvanceConfig, value: string) => void;
  onResetFilter: () => void;
}

interface IFilterCard {
  show: boolean;
  position: { top: number; left: number };
}

interface IFilterValue {
  config_name: string;
  value: string;
}

const CONFIG_OPTIONS = Object.values(FILTER_ADVANCE_CONFIG).map((value) => value);

const DEFAULT_FILTER_CARD: IFilterCard = {
  show: false,
  position: { top: 0, left: 0 },
};

const DEFAULT_FILTER_VALUE: IFilterValue = {
  config_name: CONFIG_OPTIONS[0],
  value: '',
};

function FilterAdvance(props: IFilterAdvance) {
  const { headerKey, onApplyFilter, onResetFilter, isResetFilter, initialFilterValue } = props;

  const filterRef = useRef<HTMLDivElement>(null);
  const [filterCard, setFilterCard] = useState<IFilterCard>(DEFAULT_FILTER_CARD);
  const [filterValue, setFilterValue] = useState<IFilterValue>(initialFilterValue || DEFAULT_FILTER_VALUE);

  useEffect(() => {
    if (isResetFilter) setFilterValue(DEFAULT_FILTER_VALUE);
  }, [isResetFilter]);

  useOnClickOutside([filterRef], () => filterCard.show && setFilterCard(DEFAULT_FILTER_CARD));

  const handleConfigChange = (config_name: string) => {
    setFilterValue((prev) => ({ ...prev, config_name }));
    if (config_name === 'None') setFilterValue((prev) => ({ ...prev, value: '' }));
  };

  const handleApplyFilter = () => {
    const getConfigKey = getObjKeyByValue(FILTER_ADVANCE_CONFIG, filterValue.config_name);
    onApplyFilter(getConfigKey as TFilterAdvanceConfig, filterValue.value);
    setFilterCard(DEFAULT_FILTER_CARD);
  };

  const handleResetFilter = () => {
    onResetFilter();
    setFilterValue(DEFAULT_FILTER_VALUE);
    setFilterCard(DEFAULT_FILTER_CARD);
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

  return (
    <div className="relative">
      <div className="relative">
        {filterValue.config_name !== 'None' && filterValue.value.length > 0 && (
          <div className="absolute top-0 -right-1 size-2 rounded-full bg-blue-950 z-10" />
        )}
        <Icons
          name="filterAdvance"
          className={clsx(
            'shrink-0 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer',
            filterCard.show ? '!text-gray-600 dark:!text-gray-200' : 'text-gray-400 dark:text-gray-700'
          )}
          onClick={handleOpenFilterCard}
        />
      </div>

      {filterCard.show &&
        createPortal(
          <FilterCard ref={filterRef} className="fixed" style={{ top: filterCard.position.top, left: filterCard.position.left }}>
            <div className="p-1.5 w-full flex flex-col items-start space-y-1">
              <span className="text-xs text-gray-800 dark:text-gray-200">Filter dengan</span>
              <Dropdown options={CONFIG_OPTIONS} value={filterValue.config_name} onSelect={handleConfigChange} />

              {filterValue.config_name !== 'None' && (
                <InputSearch
                  id={`filter-advance-value-${headerKey}`}
                  disabled={filterValue.config_name === 'None'}
                  value={filterValue.value}
                  onChange={(e) => setFilterValue((prev) => ({ ...prev, value: e.target.value }))}
                />
              )}
            </div>

            <FilterAction onApply={handleApplyFilter} onReset={handleResetFilter} />
          </FilterCard>,
          document.body
        )}
    </div>
  );
}

export default memo(FilterAdvance);
