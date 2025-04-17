'use client'

import React from 'react'
import {useParams} from 'next/navigation'
import {useSearchParams} from 'next/navigation'
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from '@heroui/react'
import {DEFAULT_NEWS_PLATFORM} from '@/static'
import {Link, usePathname} from '@/i18n/navigation'

export const SwitchLocale = () => {
  const {locale} = useParams()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const isString = (value: string | string[]) => {
    if (typeof value === 'string') {
      return value.toUpperCase()
    }
  }

  return (
    <Dropdown showArrow placement="bottom-end">
      <DropdownTrigger>
        <Button variant="bordered" size="sm">
          {isString(locale!!)}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Language Selection"
        variant="faded"
        disabledKeys={[`${locale}`]}
      >
        <DropdownItem key="en">
          <Link
            href={`${pathname}?source=${
              searchParams.get('source') || DEFAULT_NEWS_PLATFORM
            }`}
            locale="en"
            className="block"
          >
            EN
          </Link>
        </DropdownItem>
        <DropdownItem key="es">
          <Link
            href={`${pathname}?source=${
              searchParams.get('source') || DEFAULT_NEWS_PLATFORM
            }`}
            locale="es"
            className="block"
          >
            ES
          </Link>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  )
}
