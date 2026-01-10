import {Card, Skeleton} from '@heroui/react'
import React from 'react'

export const SkeletonCardNew = () => {
  return (
    <div className="flex flex-col gap-3">
      <Card className="space-y-5 p-4" radius="lg">
        <Skeleton className="rounded-lg">
          <div className="rounded-lg bg-secondary lg:aspect-[3/2]"></div>
        </Skeleton>
        <div className="space-y-3">
          <Skeleton className="w-3/5 rounded-lg">
            <div className="h-3 w-full rounded-lg bg-secondary"></div>
          </Skeleton>
          <Skeleton className="w-4/5 rounded-lg">
            <div className="h-5 w-full rounded-lg bg-secondary-300"></div>
          </Skeleton>
          <Skeleton className="w-full rounded-lg">
            <div className="h-3 w-full rounded-lg bg-secondary-200"></div>
          </Skeleton>
          <Skeleton className="w-full rounded-lg">
            <div className="h-3 w-full rounded-lg bg-secondary-200"></div>
          </Skeleton>
          <Skeleton className="w-full rounded-lg">
            <div className="h-3 w-full rounded-lg bg-secondary-200"></div>
          </Skeleton>
        </div>
      </Card>
    </div>
  )
}
