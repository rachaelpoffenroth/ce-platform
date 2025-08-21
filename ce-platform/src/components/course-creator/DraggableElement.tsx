import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, X } from 'lucide-react';

interface ElementProps {
  id: string;
  type: string;
  shapeType?: 'rectangle' | 'circle' | 'triangle';
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  src?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  textDecoration?: string;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  textAlign?: 'left' | 'center' | 'right';
  isActive: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onMove: (id: string, newX: number, newY: number) => void;
  onUpdate: (id: string, content: string) => void;
}

export default function DraggableElement({
  id,
  type,
  shapeType = 'rectangle',
  x,
  y,
  width,
  height,
  content = '',
  src,
  fontSize = 16,
  fontFamily = 'Inter',
  fontWeight,
  fontStyle,
  textDecoration,
  color = '#000000',
  backgroundColor = 'transparent',
  borderColor = '#000000',
  borderWidth = 0,
  textAlign = 'left',
  isActive,
  onSelect,
  onDelete,
  onDuplicate,
  onMove,
  onUpdate
}: ElementProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);
  
  // Handle drag start
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(id);
    setIsDragging(true);
    setDragStart({ x: e.clientX - x, y: e.clientY - y });
    
    // Add window event listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };
  
  // Handle drag movement
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    onMove(id, newX, newY);
  };
  
  // Handle drag end
  const handleMouseUp = () => {
    setIsDragging(false);
    
    // Clean up event listeners
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };
  
  // Handle content update
  const handleContentChange = () => {
    if (elementRef.current && type === 'text') {
      onUpdate(id, elementRef.current.innerText || '');
    }
  };

  return (
    <div
      ref={elementRef}
      style={{
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
        fontSize: `${fontSize}px`,
        fontFamily,
        fontWeight,
        fontStyle,
        textDecoration,
        color,
        backgroundColor: backgroundColor === 'transparent' ? 'transparent' : backgroundColor,
        textAlign: textAlign,
        border: isActive ? '2px solid #3b82f6' : '1px dashed transparent',
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: isActive ? 10 : 1,
        overflow: 'hidden'
      }}
      className={`hover:border-gray-300 ${isDragging ? 'opacity-70' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(id);
      }}
      onMouseDown={handleMouseDown}
    >
      {type === 'text' && (
        <div
          contentEditable={isActive}
          suppressContentEditableWarning={true}
          onBlur={handleContentChange}
          className="w-full h-full p-1 focus:outline-none"
        >
          {content}
        </div>
      )}
      
      {type === 'image' && src && (
        <img 
          src={src} 
          alt="Slide element" 
          className="w-full h-full object-contain"
        />
      )}
      
      {type === 'shape' && (
        <>
          {shapeType === 'rectangle' && (
            <div 
              className="w-full h-full"
              style={{ 
                backgroundColor: backgroundColor || '#e0e0e0',
                border: borderWidth ? `${borderWidth}px solid ${borderColor}` : 'none' 
              }}
            />
          )}
          {shapeType === 'circle' && (
            <div 
              className="w-full h-full rounded-full"
              style={{ 
                backgroundColor: backgroundColor || '#e0e0e0',
                border: borderWidth ? `${borderWidth}px solid ${borderColor}` : 'none' 
              }}
            />
          )}
          {shapeType === 'triangle' && (
            <div 
              className="w-full h-full"
              style={{ 
                backgroundColor: 'transparent',
                borderLeft: `${width / 2}px solid transparent`,
                borderRight: `${width / 2}px solid transparent`,
                borderBottom: `${height}px solid ${backgroundColor || '#e0e0e0'}`,
              }}
            />
          )}
        </>
      )}
      
      {isActive && (
        <div className="absolute -top-8 right-0 flex bg-white shadow-sm rounded-md">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(id);
            }}
          >
            <Copy className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(id);
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}