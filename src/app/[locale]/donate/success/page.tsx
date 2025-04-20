import React from 'react'
import { SuccessMessage } from './components/successMessage'
import { getSessionDetails } from '@/actions/donation'
import { redirect } from 'next/navigation'



const SuccessDonationPage = async ({
    searchParams,
    }: {
    searchParams: Promise<{ session_id : string }>
}) => {

  const { session_id } = await searchParams
  const sessionDetails = await getSessionDetails(session_id)

  if(!sessionDetails.success) {
    redirect('/donate')
  }

  return (
    <main className="flex justify-center items-center min-h-screen py-16 md:py-24">
        <div className="container max-w-md">
          <SuccessMessage {...sessionDetails} />
        </div>
      </main>
  )
}

export default SuccessDonationPage
