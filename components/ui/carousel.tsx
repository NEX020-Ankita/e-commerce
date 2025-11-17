'use client';

import { useState } from 'react';

export function Carousel({ children }: { children: React.ReactNode }) {
  return <div className="relative">{children}</div>;
}

export function CarouselContent({ children }: { children: React.ReactNode }) {
  return <div className="overflow-hidden">{children}</div>;
}

export function CarouselItem({ children }: { children: React.ReactNode }) {
  return <div className="w-full">{children}</div>;
}

export function CarouselPrevious() {
  return (
    <button className="absolute left-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md">
      ←
    </button>
  );
}

export function CarouselNext() {
  return (
    <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md">
      →
    </button>
  );
}