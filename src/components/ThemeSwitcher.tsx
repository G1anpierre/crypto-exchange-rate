'use client'
import {Switch} from '@heroui/react'
import {useTheme} from 'next-themes'
import {useEffect, useState} from 'react'
import {SunIcon} from './SunIcon'
import {MoonIcon} from './MoonIcon'

export const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false)
  const {theme, setTheme} = useTheme()
  const [isSelected, setIsSelected] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isSelected) {
      setTheme('dark')
    } else {
      setTheme('light')
    }
  }, [isSelected, setTheme])

  if (!mounted) return null

  return (
    <Switch
      isSelected={isSelected}
      onValueChange={setIsSelected}
      size="md"
      color="primary"
      startContent={<SunIcon />}
      endContent={<MoonIcon />}
    ></Switch>
  )
}
