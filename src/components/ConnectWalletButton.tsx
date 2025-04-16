'use client'

// import WalletIcon from '../public/icons/WalletIcon'

import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  cn,
} from "@heroui/react"
import {Chip} from "@heroui/react"
import {Icon} from '@iconify/react'
import {Connector, useConnect, useAccount, useDisconnect} from 'wagmi'
import {formatWalletAddress} from '@/utils'
import {useState} from 'react'

export const ConnectWalletButton = () => {
  const {connectors, connect} = useConnect()
  const {isConnected, addresses: acoundAdresses} = useAccount()
  const {disconnect} = useDisconnect()

  const handleDisconnect = () => {
    disconnect()
  }

  if (isConnected && acoundAdresses) {
    return (
      <div className="flex gap-1">
        <Dropdown>
          <DropdownTrigger>
            <Button
              variant="bordered"
              startContent={<Icon icon="akar-icons:wallet" className="mr-2" />}
            >
              Connected Wallets
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            variant="faded"
            aria-label="Dropdown menu with description"
          >
            {acoundAdresses.map((address: string) => (
              <DropdownItem key={address}>
                <Chip
                  startContent={
                    <Icon icon="akar-icons:wallet" className="mr-2" />
                  }
                  size="lg"
                  onClose={() => handleDisconnect()}
                >
                  {formatWalletAddress(address)}
                </Chip>
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
      </div>
    )
  } else {
    return (
      <Dropdown>
        <DropdownTrigger>
          <Button
            variant="bordered"
            startContent={<Icon icon="akar-icons:wallet" className="mr-2" />}
          >
            Connect
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          variant="faded"
          aria-label="Dropdown menu with description"
        >
          {connectors.map((connector: Connector) => (
            <DropdownItem
              key={connector.id}
              shortcut="⌘O"
              description="Connect to your wallet"
              onClick={() => connect({connector})}
            >
              {connector.name}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
    )
  }
}
