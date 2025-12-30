import React from 'react';
import { Image } from 'react-konva';
import useImage from 'use-image';

interface URLImageProps {
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  draggable: boolean;
  rotation: number;
  isSelected?: boolean;
  onClick?: () => void;
  onDragEnd: (e: any) => void;
}

export const URLImage: React.FC<URLImageProps> = ({ src, x, y, width, height, draggable, rotation, onDragEnd, isSelected, onClick }) => {
  const [img] = useImage(src);
  return (
    <Image
      image={img}
      x={x}
      y={y}
      width={width}
      height={height}
      draggable={draggable}
      rotation={rotation}
      onDragEnd={onDragEnd}
      onClick={onClick}
      shadowColor="black"
      shadowBlur={10}
      shadowOpacity={0.5}
      shadowEnabled={isSelected}
    />
  );
};
