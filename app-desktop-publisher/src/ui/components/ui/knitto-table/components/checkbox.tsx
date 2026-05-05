import clsx from 'clsx';
import { memo, type ReactNode } from 'react';

interface CheckboxProps extends React.ComponentPropsWithoutRef<'input'> {
  checked: boolean;
  onChecked?: (checked: boolean) => void;
  label?: ReactNode | string;
  classNameLabel?: string;
}

function Checkbox(props: CheckboxProps) {
  const { checked, onChecked, label, classNameLabel, ...propRest } = props;

  return (
    <label className="flex cursor-pointer">
      <div className={clsx('size-4 relative shrink-0', label && 'mr-2')}>
        <input
          type="checkbox"
          className="w-4 h-4 cursor-pointer absolute opacity-0 z-[100]"
          checked={checked}
          onChange={(e) => onChecked && onChecked(e.target.checked)}
          {...propRest}
        />
        <div
          className={clsx('size-4 flex justify-center items-center border border-gray-400 rounded-xs absolute', {
            'bg-blue-950': checked,
            'bg-white': !checked,
          })}
        >
          {checked && <CheckedIcon />}
        </div>
      </div>

      {typeof label === 'string' ? <span className={clsx('text-xs font-normal truncate', classNameLabel)}>{label}</span> : label}
    </label>
  );
}

function CheckedIcon() {
  return (
    <svg width="12" height="9" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1.5 4L4.57407 7L10.5 1" stroke="white" strokeWidth="2" />
    </svg>
  );
}

export default memo(Checkbox);
