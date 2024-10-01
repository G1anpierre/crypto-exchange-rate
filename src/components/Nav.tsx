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

import {ThemeSwitcher} from './ThemeSwitcher'
import {SwitchLocale} from './SwitchLocale'
import {AuthUser} from './AuthUser'
import {signOut} from '@/actions/signOut'
import {Session} from 'next-auth'

export const Nav = ({user}: {user: Session | null}) => {
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
            <div className="h-5 w-60 bg-logo-light bg-cover object-cover dark:bg-logo-dark"></div>
          </NextUILink>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden gap-4 sm:flex" justify="center">
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
          <AuthUser user={user} />
        </NavbarItem>
      </NavbarContent>
      <NavbarMenu>
        <NavbarMenuItem>
          <AuthUser user={user} isDropDownDisabled />
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
