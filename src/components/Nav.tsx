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
import {usePathname} from 'next/navigation'

import {ThemeSwitcher} from './ThemeSwitcher'
import {SwitchLocale} from './SwitchLocale'
import {AuthUser} from './AuthUser'
import {signOut} from '@/actions/signOut'
import path from 'path'

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
          {/* <AcmeLogo /> */}
          <NextUILink href="/" color="foreground">
            {/* Logo */}
            <p className="font-bold text-inherit"> CryptoCurrent</p>
          </NextUILink>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        {/* <NavbarItem>
          <Link color="foreground" href="#">
            Features
          </Link>
        </NavbarItem> */}
        {/* <NavbarItem isActive>
          <Link href="#" aria-current="page">
            Customers
          </Link>
        </NavbarItem> */}
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
