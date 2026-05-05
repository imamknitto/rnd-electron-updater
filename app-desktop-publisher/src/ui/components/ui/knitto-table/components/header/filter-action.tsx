interface FilterActionProps {
  onReset?: () => void;
  onApply?: () => void;
}

export default function FilterAction({ onReset, onApply }: FilterActionProps) {
  return (
    <div className="flex justify-end space-x-2.5 border-t border-gray-300 px-1.5 py-2 mt-1.5">
      <button className="cursor-pointer" onClick={onReset}>
        Reset
      </button>
      <button className="cursor-pointer px-1.5 py-0.5 bg-blue-950 text-white rounded" onClick={onApply}>
        Filter
      </button>
    </div>
  );
}
