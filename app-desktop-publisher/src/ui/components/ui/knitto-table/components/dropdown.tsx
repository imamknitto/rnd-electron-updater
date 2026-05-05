import { type Dispatch, useState } from 'react';
import Icon from '../icons';
import clsx from 'clsx';

interface DropdownProps {
  options?: string[];
  value?: string;
  onSelect?: (option: string) => void;
}

interface DropdownBoxProps extends Pick<DropdownProps, 'value'> {
  isOpen: boolean;
  onToggle: Dispatch<React.SetStateAction<boolean>>;
}

export default function Dropdown(props: DropdownProps) {
  const { options = [], value, onSelect } = props;
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSelectOption = (option: string) => {
    onSelect?.(option);
    setShowDropdown(false);
  };

  return (
    <div className="relative w-full">
      <DropdownBox value={value || ''} isOpen={showDropdown} onToggle={setShowDropdown} />

      {showDropdown && (
        <div className="absolute top-full mt-1 w-full border border-gray-50 shadow rounded-sm bg-white dark:bg-black z-40">
          <div className="flex flex-col items-start">
            {!options.length ? (
              <div className="py-5 flex justify-center items-center">
                <span className="text-gray-500 text-xs font-normal">No data available!</span>
              </div>
            ) : (
              options.map((option) => (
                <div
                  key={option}
                  className={clsx(
                    'px-1.5 py-1 hover:bg-blue-50 dark:hover:bg-blue-900 cursor-pointer w-full text-start font-normal',
                    value === option && 'bg-blue-100 dark:bg-blue-900'
                  )}
                  onClick={() => handleSelectOption(option)}
                >
                  {option}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const DropdownBox = (props: DropdownBoxProps) => {
  const { value, isOpen, onToggle } = props;

  return (
    <div
      className="border border-gray-200 rounded h-[1.625rem] pl-1.5 w-full flex justify-between items-center hover:bg-gray-50 cursor-pointer dark:hover:bg-black/50"
      onClick={() => onToggle((prev) => !prev)}
    >
      <span className="text-xs font-normal">{value}</span>
      <Icon name="chevron" className={clsx('w-5 text-gray-500 me-0.5 transition-all duration-100', isOpen && 'rotate-180')} />
    </div>
  );
};
