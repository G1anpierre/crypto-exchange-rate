'use client'
import React from 'react'
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Link as NextUILink,
  Button,
} from '@nextui-org/react'
import {usePathname, useParams} from 'next/navigation'
import Image from 'next/image'

import {ThemeSwitcher} from './ThemeSwitcher'
import {SwitchLocale} from './SwitchLocale'
import {AuthUser} from './AuthUser'
import {signOut} from '@/actions/signOut'

export const Nav = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const pathname = usePathname()

  const isActive = (path: string) => path === pathname.split('/')[2]
  const menuItems = [
    'Profile',
    'Dashboard',
    'Activity',
    'Analytics',
    'System',
    'Deployments',
    'My Settings',
    'Team Settings',
    'Help & Feedback',
  ]
  return (
    <Navbar onMenuOpenChange={setIsMenuOpen}>
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          className="sm:hidden"
        />
        <NavbarBrand>
          <NextUILink href="/" color="foreground">
            <div className="bg-logo-light dark:bg-logo-dark bg-cover object-cover h-5 w-60"></div>
          </NextUILink>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarItem isActive={isActive('cryptonews')}>
          <NextUILink href="/cryptonews">Watch Crypto News!</NextUILink>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justify="end">
        <NavbarMenuItem className="hidden md:flex">
          <SwitchLocale />
        </NavbarMenuItem>
        <NavbarItem className="hidden md:flex">
          <ThemeSwitcher />
        </NavbarItem>
        <NavbarItem className="hidden md:flex">
          <AuthUser />
        </NavbarItem>
      </NavbarContent>
      <NavbarMenu>
        <NavbarMenuItem>
          <AuthUser isDropDownDisabled />
        </NavbarMenuItem>
        <NavbarMenuItem>
          <ThemeSwitcher />
        </NavbarMenuItem>
        <NavbarMenuItem>
          <SwitchLocale />
        </NavbarMenuItem>
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item}-${index}`}>
            <NextUILink className="w-full" href="#" size="lg">
              {item}
            </NextUILink>
          </NavbarMenuItem>
        ))}
        <NavbarMenuItem>
          <form action={signOut}>
            <Button color="danger" variant="ghost" type="submit" size="md">
              Logout
            </Button>
          </form>
        </NavbarMenuItem>
      </NavbarMenu>
    </Navbar>
  )
}
