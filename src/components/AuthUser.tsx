import {
  Button,
  NavbarItem,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  User,
  Link as NextUILink,
} from '@nextui-org/react'
import React from 'react'
import {signOut} from '@/actions/signOut'
import {Session} from 'next-auth'

type AuthUserProps = {
  isDropDownDisabled?: boolean
  user: Session | null
}

export const AuthUser = ({isDropDownDisabled, user}: AuthUserProps) => {
  return (
    <>
      {user ? (
        <Dropdown placement="bottom-start" isDisabled={!!isDropDownDisabled}>
          <DropdownTrigger>
            <User
              as="button"
              avatarProps={{
                isBordered: true,
                src: `${user.user?.image}`,
                name: `${user.user?.name}`,
                showFallback: true,
              }}
              className="transition-transform"
              name={user.user?.name}
              description={user.user?.email}
            />
          </DropdownTrigger>
          {!isDropDownDisabled && (
            <DropdownMenu aria-label="User Actions" variant="flat">
              <DropdownItem key="profile" className="h-14 gap-2">
                <p className="font-bold">Signed in as</p>
                <p className="font-bold">{user.user?.email}</p>
              </DropdownItem>
              {/* <DropdownItem key="settings">My Settings</DropdownItem>
              <DropdownItem key="team_settings">Team Settings</DropdownItem>
              <DropdownItem key="analytics">Analytics</DropdownItem>
              <DropdownItem key="system">System</DropdownItem>
              <DropdownItem key="configurations">Configurations</DropdownItem>
              <DropdownItem key="help_and_feedback">
                Help & Feedback
              </DropdownItem> */}
              <DropdownItem key="logout" color="danger">
                <form action={signOut}>
                  <Button
                    color="danger"
                    variant="ghost"
                    type="submit"
                    size="sm"
                  >
                    Logout
                  </Button>
                </form>
              </DropdownItem>
            </DropdownMenu>
          )}
        </Dropdown>
      ) : (
        <div className="flex gap-2">
          <NextUILink href="/login">
            <Button color="primary" variant="ghost">
              Login
            </Button>
          </NextUILink>
          <NextUILink href="/signup">
            <Button color="primary" variant="flat">
              Sign Up
            </Button>
          </NextUILink>
        </div>
      )}
    </>
  )
}
