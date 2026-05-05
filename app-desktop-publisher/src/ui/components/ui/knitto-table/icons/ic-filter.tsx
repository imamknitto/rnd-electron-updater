import clsx from 'clsx';

interface SVGProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export default function IcFilter({ className, ...props }: SVGProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={clsx('size-6', className)} stroke="currentColor" {...props}>
      <g className="filter-outline">
        <path
          fill="currentColor"
          fillRule="evenodd"
          d="M3 7a1 1 0 0 1 1-1h16a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1m2 4.5a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H6a1 1 0 0 1-1-1M8 16a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2H9a1 1 0 0 1-1-1"
          className="Vector 38 (Stroke)"
          clipRule="evenodd"
        ></path>
      </g>
    </svg>
  );
}
