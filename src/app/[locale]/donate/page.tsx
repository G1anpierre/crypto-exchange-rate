"use client"

import React, { useState } from 'react'
import {Image} from '@heroui/react'
import { useRouter } from "next/navigation"
import {Card, CardHeader, CardBody, Slider, Button} from "@heroui/react";
import { createDonationCheckout } from '@/actions/donation';
import { donationPurposes } from '@/static';

const DonatePage = () => {
  const router = useRouter()
  const [amount, setAmount] = useState(25)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDonation = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Call the server action to create a checkout session
      const checkoutUrl = await createDonationCheckout(amount)

      // Redirect to Stripe checkout
      if (checkoutUrl) {
        router.push(checkoutUrl)
      } else {
        setError("Failed to create checkout session. Please try again.")
      }
    } catch (err: any) {
      // Improved error handling with more specific error message
      setError(err.message || "An error occurred. Please try again later.")
      console.error("Donation error:", err)
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <main className="flex min-h-screen flex-col">
        <div className='flex-1 py-16 md:py-24 px-6 lg:px-8'>
            <div className="container max-w-5xl mx-auto">
                <div className='flex flex-col items-center space-y-4 mb-12'>
                    <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">Support</div>
                    <h1 className="text-3xl text-center font-bold tracking-tight sm:text-4xl md:text-5xl">
                            Support CryptoCurrent
                    </h1>
                    <p className="mx-auto max-w-[700px] text-lg text-muted-foreground text-center">
                        Your contribution will help us continue to provide valuable resources and support for the crypto community.
                    </p>
                </div>
            </div>
            <div className="grid md:grid-cols-2 container max-w-5xl mx-auto gap-12 items-center">
                <div className="relative h-[450px]  md:h-full rounded-lg overflow-hidden flex-1">
                    <Image
                        src="/crypto-donation.jpg"
                        alt="crypto-gold-donation"
                        width={500}
                        height={424}
                        className="object-cover"
                    />
                </div>
                <div className='flex-1'>
                <Card className='p-6'>
                    <CardHeader className="flex flex-col items-start">
                        <h2 className="text-2xl font-bold">Make a Difference Today</h2>
                        <p className="mt-2 text-muted-foreground">
                            Choose an amount to donate and help us grow.
                        </p>
                    </CardHeader>
                    <CardBody>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Amount</span>
                                <span className="text-2xl font-bold text-primary">{amount} CHF</span>
                            </div>
                            <div className="">
                                <Slider
                                    value={amount}
                                    onChange={(value) => setAmount(Array.isArray(value) ? value[0] : value)}
                                    minValue={5}
                                    maxValue={200}
                                    formatOptions={{style: 'currency', currency: 'CHF'}}
                                    step={5}
                                    className="w-full mb-16"
                                    showTooltip={true}
                                    marks={[
                                        {
                                            value: 5,
                                            label: "5",
                                        },
                                        {
                                            value: 100,
                                            label: "100",
                                        },
                                        {
                                            value: 200,
                                            label: "200",
                                        },
                                    ]}
                                />
                            </div>
                            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-2">
                                {[5, 25, 100, 200].map((preset) => (
                                    <Button
                                        key={preset}
                                        variant={amount === preset ? "solid" : "bordered"}
                                        onPress={() => setAmount(preset)}
                                        color='primary'
                                        className="h-12"
                                        >
                                        {preset} CHF
                                    </Button>
                                ))}
                            </div>
                            <div>
                                <Button color="primary" className="w-full h-12 text-lg mt-4" onPress={handleDonation} isLoading={isLoading}>
                                {isLoading ? "Processing..." : `Donate ${amount} CHF`}
                                </Button>
                                {/* Add this block to display the error message */}
                                {error && (
                                    <p className="mt-2 text-sm text-danger text-center">
                                        {error}
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardBody>
                </Card>
                </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 container max-w-5xl mx-auto mt-20">
                {donationPurposes.map((donationPurposes) => (
                    <Card
                    key={donationPurposes.key}
                    isPressable
                    className="flex min-h-[360px] flex-col justify-between bg-primary-100 p-[28px]"
                    shadow="none"
                    >
                        <CardHeader className="flex flex-col gap-2 p-0">
                            <p className="text-left text-2xl font-medium leading-9 text-foreground-700">
                                {donationPurposes.title}
                            </p>
                        </CardHeader>
                        <CardBody className="flex flex-col items-end justify-end gap-2 p-0 text-default-500">
                            {donationPurposes.descriptions.map((description, index) => (
                                <div
                                    key={index}
                                    className="flex min-h-[50px] rounded-medium bg-content1 px-3 py-2 text-content3-foreground"
                                >
                                <p className="text-small">{description}</p>
                                </div>
                            ))}
                            <span className="h-11 w-11">{donationPurposes.icon}</span>
                        </CardBody>
                    </Card>
                ))}
            </div>
        </div>
    </main>
  )
}

export default DonatePage
