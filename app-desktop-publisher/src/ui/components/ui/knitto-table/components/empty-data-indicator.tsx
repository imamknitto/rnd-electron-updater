import { useFilteredData } from '../context/filter-context';
import { useCalcHeaderTotalHeight } from '../context/ui-context';

interface IEmptyDataIndicatorProps {
  containerHeight: number;
  forRegularTable?: boolean;
}

function EmptyDataIndicator({ containerHeight, forRegularTable = false }: IEmptyDataIndicatorProps) {
  const filteredData = useFilteredData();
  const calcHeaderTotalHeight = useCalcHeaderTotalHeight();

  if (filteredData.length) return;

  return (
    <div
      className="sticky left-0 flex justify-center items-center"
      style={{
        height: containerHeight - calcHeaderTotalHeight,
        ...(!forRegularTable && { marginTop: calcHeaderTotalHeight }),
      }}
    >
      <p className="text-lg font-medium text-gray-400">Tidak ada data yang tersedia</p>
    </div>
  );
}

export default EmptyDataIndicator;
