import React, { useState, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';

interface ResizablePanelProps {
  children: ReactNode;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  className?: string;
}

interface ResizableContainerProps {
  children: ReactNode;
  className?: string;
}

export const ResizableContainer: React.FC<ResizableContainerProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`flex h-full w-full ${className}`}>
      {children}
    </div>
  );
};

export const ResizablePanel: React.FC<ResizablePanelProps> = ({
  children,
  defaultWidth = 400,
  minWidth = 200,
  maxWidth = 800,
  className = '',
}) => {
  const [width, setWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !panelRef.current) return;

      const containerRect = panelRef.current.parentElement?.getBoundingClientRect();
      if (!containerRect) return;

      const newWidth = containerRect.right - e.clientX;
      const constrainedWidth = Math.min(Math.max(newWidth, minWidth), maxWidth);
      setWidth(constrainedWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, minWidth, maxWidth]);

  return (
    <>
      <div
        className={`w-1 bg-gray-300 cursor-col-resize transition-colors duration-200 flex-shrink-0 hover:bg-main ${
          isResizing ? 'bg-main shadow-[0_0_4px_rgba(136,170,238,0.5)]' : ''
        }`}
        onMouseDown={startResize}
      />
      <div
        ref={panelRef}
        className={`flex flex-col min-w-[200px] overflow-hidden ${className}`}
        style={{ width: `${width}px` }}
      >
        {children}
      </div>
    </>
  );
};

export default ResizablePanel; 