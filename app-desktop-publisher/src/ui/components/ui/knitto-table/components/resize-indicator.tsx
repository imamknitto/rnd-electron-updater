export default function ResizeIndicator({ handleMouseDown }: { handleMouseDown: (e: React.MouseEvent) => void }) {
  return <div className="w-1 h-full absolute right-0 cursor-col-resize bg-transparent group-hover/outer:bg-blue-100" onMouseDown={handleMouseDown} />;
}
