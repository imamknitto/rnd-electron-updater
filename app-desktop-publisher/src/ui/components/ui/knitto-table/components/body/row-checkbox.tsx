import { memo } from 'react';

interface IRowCheckbox {
  checked: boolean;
}

function RowCheckbox({ checked }: IRowCheckbox) {
  return (
    <div className="flex justify-center items-center w-full h-full">
      <input type="checkbox" data-name="header-checkbox" className="w-4 h-4 cursor-pointer accent-blue-950" checked={checked} readOnly />
    </div>
  );
}

export default memo(RowCheckbox);
