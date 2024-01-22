'use client'

import {Link} from '@/navigation'
import React from 'react'
import {useParams} from 'next/navigation'
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from '@nextui-org/react'

export const SwitchLocale = () => {
  const {locale} = useParams()

  const isString = (value: string | string[]) => {
    if (typeof value === 'string') {
      return value.toUpperCase()
    }
  }

  return (
    <Dropdown showArrow placement="bottom-end">
      <DropdownTrigger>
        <Button variant="bordered">{isString(locale)}</Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Language Selection"
        variant="faded"
        disabledKeys={[`${locale}`]}
      >
        <DropdownItem key="en">
          <Link href="/" locale="en">
            EN
          </Link>
        </DropdownItem>
        <DropdownItem key="es">
          <Link href="/" locale="es">
            ES
          </Link>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  )
}
