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
  onDragEnd: (e: any) => void;
}

export const URLImage: React.FC<URLImageProps> = ({ src, x, y, width, height, draggable, rotation, onDragEnd }) => {
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
    />
  );
};
