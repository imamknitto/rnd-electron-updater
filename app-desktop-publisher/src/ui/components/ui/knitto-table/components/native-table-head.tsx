import { forwardRef, memo, type ReactNode } from 'react';
import clsx from 'clsx';

interface TableHeadProps extends React.ThHTMLAttributes<React.ComponentRef<'th'>> {
  width: number;
  maxWidth?: number;
  height: number;
  headValue?: ReactNode;
  colSpan?: number;
  rowSpan?: number;
}

const NativeTableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ width, maxWidth, height, headValue, className, children, colSpan, rowSpan, style, ...props }, ref) => {
    return (
      <th
        ref={ref}
        colSpan={colSpan}
        rowSpan={rowSpan}
        className={clsx('global-report-title', className)}
        style={{
          top: 0,
          height,
          width: `${width}px`,
          minWidth: `${width}px`,
          maxWidth: maxWidth ? `${maxWidth}px` : 'none',
          ...style,
        }}
        {...props}
      >
        {headValue || children}
      </th>
    );
  }
);

export default memo(NativeTableHead);
