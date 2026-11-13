import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  rounded?: 'sm' | 'md' | 'lg' | 'full'
}

export function Skeleton({ rounded = 'md', className, ...props }: SkeletonProps) {
  const radii = { sm: 'rounded', md: 'rounded-lg', lg: 'rounded-card', full: 'rounded-pill' }
  return (
    <div
      aria-hidden="true"
      className={cn('skeleton', radii[rounded], className)}
      {...props}
    />
  )
}

export function TheatreCardSkeleton() {
  return (
    <div className="bg-bg-surface rounded-card overflow-hidden border border-border-subtle">
      <Skeleton className="w-full h-52" rounded="sm" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16" rounded="full" />
          <Skeleton className="h-6 w-20" rounded="full" />
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  )
}
