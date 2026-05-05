import clsx from 'clsx';
import type { HTMLAttributes } from 'react';
import type { TSortOrder } from '../lib';

export interface IconSortProps extends HTMLAttributes<HTMLDivElement> {
  sort?: TSortOrder;
}

export default function IcSort({ sort = 'unset', className, ...props }: IconSortProps) {
  return (
    <div className={clsx('flex flex-col', className)} {...props}>
      <SortUp sort={sort} />
      <SortDown sort={sort} />
    </div>
  );
}

function SortDown({ sort }: IconSortProps) {
  return (
    <svg
      className="-mt-1"
      stroke="currentColor"
      fill={sort === 'desc' ? '#333' : '#ccc'}
      strokeWidth="0"
      version="1.2"
      baseProfile="tiny"
      viewBox="0 0 24 24"
      height="11"
      width="11"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M5.8 9.7l6.2 6.3 6.2-6.3c.2-.2.3-.5.3-.7s-.1-.5-.3-.7c-.2-.2-.4-.3-.7-.3h-11c-.3 0-.5.1-.7.3-.2.2-.3.4-.3.7s.1.5.3.7z"></path>
    </svg>
  );
}
function SortUp({ sort }: IconSortProps) {
  return (
    <svg
      stroke="currentColor"
      fill={sort === 'asc' ? '#333' : '#ccc'}
      strokeWidth="0"
      version="1.2"
      baseProfile="tiny"
      viewBox="0 0 24 24"
      height="11"
      width="11"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M18.2 13.3l-6.2-6.3-6.2 6.3c-.2.2-.3.5-.3.7s.1.5.3.7c.2.2.4.3.7.3h11c.3 0 .5-.1.7-.3.2-.2.3-.5.3-.7s-.1-.5-.3-.7z"></path>
    </svg>
  );
}
