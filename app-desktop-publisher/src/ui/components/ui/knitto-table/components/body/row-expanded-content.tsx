import clsx from 'clsx';
import { memo, type ReactNode } from 'react';

type RowExpandedContentProps = {
  width: number;
  emptyPadding: boolean;
  children: ReactNode;
};

const RowExpandedContent = (props: RowExpandedContentProps): ReactNode => {
  const { width, emptyPadding, children } = props;

  return (
    <div data-name="row-expanded" style={{ width, height: 'auto' }} className={clsx('border-b border-gray-200', emptyPadding && 'p-2')}>
      {children}
    </div>
  );
};

export default memo(RowExpandedContent);
