import { forwardRef, memo } from 'react';
import clsx from 'clsx';

interface ITableCell extends React.TdHTMLAttributes<HTMLDivElement> {
  cellValue?: React.ReactNode;
}

const TableCell = forwardRef((props: ITableCell, ref: React.Ref<HTMLDivElement>) => {
  const { cellValue, className, children, ...rest } = props;

  return (
    <div
      ref={ref}
      className={clsx('border-b border-[#D2D2D4] px-1.5 text-xs content-center global-report-content !text-[12px]', className)}
      {...rest}
    >
      {cellValue || children}
    </div>
  );
});

export default memo(TableCell);
