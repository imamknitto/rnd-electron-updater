import clsx from 'clsx';

function LoadingIndicator() {
  return (
    <div className="z-[99999] absolute inset-0 bg-black/10 backdrop-blur-sm flex justify-center items-center">
      <div className={clsx('border-[.625rem] !border-t-blue-950 border-gray-100', 'border-solid rounded-full animate-spin size-[4.375rem]')} />
    </div>
  );
}

export default LoadingIndicator;
