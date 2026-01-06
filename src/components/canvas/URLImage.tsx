import React from 'react';
import { Image } from 'react-konva';
import useImage from 'use-image';

interface URLImageProps {
  id: string; // Added ID
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  scaleX: number;
  scaleY: number;
  draggable: boolean;
  rotation: number;
  isSelected?: boolean;
  onClick?: () => void;
  onDragEnd: (e: any) => void;
  onTransformEnd: (e: any) => void;
}

export const URLImage: React.FC<URLImageProps> = ({ 
  id, src, x, y, width, height, scaleX, scaleY, 
  draggable, rotation, onDragEnd, onTransformEnd, isSelected, onClick 
}) => {
  const [img] = useImage(src || '');
  return (
    <Image
      id={id} // Helper for Transformer to find
      image={img}
      x={x}
      y={y}
      width={width}
      height={height}
      scaleX={scaleX}
      scaleY={scaleY}
      draggable={draggable}
      rotation={rotation}
      onDragEnd={onDragEnd}
      onTransformEnd={onTransformEnd}
      onClick={onClick}
      shadowColor="black"
      shadowBlur={10}
      shadowOpacity={0.2}
      shadowEnabled={isSelected}
    />
  );
};
