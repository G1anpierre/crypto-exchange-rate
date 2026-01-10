'use client'

// import WalletIcon from '../public/icons/WalletIcon'

import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  cn,
} from '@heroui/react'
import {Chip} from '@heroui/react'
import {Icon} from '@iconify/react'
import {
  Connector,
  useConnect,
  useConnection,
  useDisconnect,
  useConnectors,
} from 'wagmi'
import {formatWalletAddress} from '@/utils'
import {useState} from 'react'

export const ConnectWalletButton = () => {
  const {connect} = useConnect()
  const connectors = useConnectors()
  const {isConnected, address} = useConnection()
  const {disconnect} = useDisconnect()

  const handleDisconnect = () => {
    disconnect()
  }

  if (isConnected && address) {
    return (
      <div className="flex gap-1">
        <Button
          variant="bordered"
          startContent={<Icon icon="akar-icons:wallet" className="mr-2" />}
          onPress={() => handleDisconnect()}
        >
          {formatWalletAddress(address)}
        </Button>
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
