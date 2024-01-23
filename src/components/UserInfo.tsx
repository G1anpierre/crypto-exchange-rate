'use client'
import React from 'react'
import {useSession} from 'next-auth/react'
import { User }from '@nextui-org/react'
export const UserInfo = () => {
  const session = useSession()
  if (session.status === 'loading') return null

  return (
    <>
    {session.data && (
      <User
        as="button"
        avatarProps={{
          isBordered: true,
          src: `${session.data.user?.image}`,
        }}
        className="transition-transform"
        name={session.data.user?.name}
        description={session.data.user?.email}
      />
      
    )}
      </>
  )
}
