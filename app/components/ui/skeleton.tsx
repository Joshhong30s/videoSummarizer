'use client';

import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'skeleton-loading rounded-lg',
        className
      )}
      {...props}
    />
  );
}

export interface SkeletonContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function SkeletonContainer({
  children,
  className,
  ...props
}: SkeletonContainerProps) {
  return (
    <div className={cn('rounded-lg border bg-card p-4', className)} {...props}>
      {children}
    </div>
  );
}

export interface SkeletonGroupProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function SkeletonGroup({
  children,
  className,
  ...props
}: SkeletonGroupProps) {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      {children}
    </div>
  );
}
