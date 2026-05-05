import clsx from 'clsx';
import type { IIconProps } from '../lib';

export default function IcClose({ className, ...props }: IIconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={clsx('w-6 h-6', className)} {...props}>
      <path
        fill="currentColor"
        d="m7.05 5.636l4.95 4.95l4.95-4.95l1.414 1.414l-4.95 4.95l4.95 4.95l-1.415 1.414l-4.95-4.95l-4.949 4.95l-1.414-1.414l4.95-4.95l-4.95-4.95z"
      ></path>
    </svg>
  );
}
