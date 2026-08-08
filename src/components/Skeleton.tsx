import React from 'react';
import { motion } from 'motion/react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular' | 'card';
  width?: string | number;
  height?: string | number;
}

/**
 * Skeleton Loader Component com efeito Shimmer baseado nos Princípios de Motion da Apple / Kyle Zantos
 */
export default function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
}: SkeletonProps) {
  let variantStyle = 'rounded-xl';
  if (variant === 'circular') variantStyle = 'rounded-full';
  if (variant === 'text') variantStyle = 'rounded-md h-4 w-3/4';
  if (variant === 'card') variantStyle = 'rounded-2xl h-32 w-full';

  return (
    <div
      className={`relative overflow-hidden bg-neutral-900/90 border border-neutral-800/60 ${variantStyle} ${className}`}
      style={{ width, height }}
    >
      {/* Shimmer Wave Animation */}
      <motion.div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"
        animate={{ translateX: ['-100%', '100%'] }}
        transition={{
          repeat: Infinity,
          duration: 1.6,
          ease: [0.16, 1, 0.3, 1],
        }}
      />
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-xl relative overflow-hidden">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-4 w-3/4" />
      <div className="grid grid-cols-2 gap-3 pt-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}

export function SkeletonPaymentForm() {
  return (
    <div className="space-y-4 p-4 bg-neutral-950/80 border border-neutral-800 rounded-2xl">
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="h-12 w-full" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
      <Skeleton className="h-14 w-full rounded-2xl" />
    </div>
  );
}
