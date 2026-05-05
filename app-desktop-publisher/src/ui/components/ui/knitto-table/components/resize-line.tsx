import { createPortal } from 'react-dom';

function ResizeLine() {
  return createPortal(
    <div
      id="resize-line"
      style={{
        position: 'fixed',
        top: 0,
        width: '1px',
        height: '100vh',
        background: '#dbeafe',
        display: 'none',
        zIndex: 999999,
        pointerEvents: 'none',
      }}
    />,
    document.body
  );
}

export default ResizeLine;
