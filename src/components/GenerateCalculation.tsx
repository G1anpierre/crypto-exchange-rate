'use client'
import React from 'react'
import {Button, Spinner} from '@nextui-org/react'
import {useFormStatus} from 'react-dom'

export const GenerateCalculation = () => {
  const {pending} = useFormStatus()
  return (
    <Button color="primary" type="submit" className="col-span-2">
      <div className="flex align-center gap-3">
        <span className="w-8 h-4">
          {pending && <Spinner size="sm" color="secondary" />}
        </span>
        <span>Calculate !</span>
      </div>
    </Button>
  )
}
