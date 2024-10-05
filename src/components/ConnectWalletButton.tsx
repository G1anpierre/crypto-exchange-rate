'use client'

import Link from 'next/link'

// import WalletIcon from '../public/icons/WalletIcon'

import {Button} from './ui/button'
import {Button as ButtonNextUI} from '@nextui-org/react'

import {useSDK} from '@metamask/sdk-react'
import {formatAddress} from '../lib/utils'
import {Popover, PopoverTrigger, PopoverContent} from '@/components/ui/popover'
import {Icon} from '@iconify/react'

export const ConnectWalletButton = () => {
  const {sdk, connected, connecting, account} = useSDK()

  const connect = async () => {
    try {
      await sdk?.connect()
    } catch (err) {
      console.warn(`No accounts found`, err)
    }
  }

  const disconnect = () => {
    if (sdk) {
      sdk.terminate()
    }
  }

  return (
    <div className="relative">
      {connected && account ? (
        <Popover>
          <PopoverTrigger>
            <Button>{formatAddress(account)}</Button>
          </PopoverTrigger>
          <PopoverContent className="right-0 top-10 z-10 mt-2 w-44 rounded-md border bg-gray-100 shadow-lg">
            <ButtonNextUI onClick={disconnect} color="danger">
              Disconnect
            </ButtonNextUI>
          </PopoverContent>
        </Popover>
      ) : (
        <ButtonNextUI
          disabled={connecting}
          onClick={connect}
          startContent={<Icon icon="marketeq:wallet" />}
          color="success"
        >
          Connect Wallet
        </ButtonNextUI>
      )}
    </div>
  )
}
