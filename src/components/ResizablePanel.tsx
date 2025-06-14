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
    <div className={`resizable-container ${className}`}>
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
        className={`resize-handle ${isResizing ? 'resizing' : ''}`}
        onMouseDown={startResize}
      />
      <div
        ref={panelRef}
        className={`resizable-panel ${className}`}
        style={{ width: `${width}px` }}
      >
        {children}
      </div>
    </>
  );
};

export default ResizablePanel; 