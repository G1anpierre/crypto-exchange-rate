"use client"

import { Button, Card, CardBody, CardFooter, CardHeader } from '@heroui/react'
import { CheckCircle } from 'lucide-react'
import { Link } from '@/i18n/navigation'

type SuccessMessageProps = {
    success: boolean;
    error?: string;
    amount?: number;
    currency?: string;
    customerEmail?: string;
    paymentId?: string;
}

export const SuccessMessage = (props: SuccessMessageProps) => {
  const { amount, currency, customerEmail, paymentId } = props;

  return (
    <Card className="text-center p-4">
      <CardHeader className='flex flex-col items-center'>
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-2xl">Thank You for Your Support!</h1>
        <h3>Your contribution helps us build a better crypto exchange platform.</h3>
      </CardHeader>
      <CardBody className="space-y-4 text-center">
        <p>
          We've sent a confirmation to your email address. Your donation directly supports the development of innovative features and a seamless trading experience.
        </p>
        {amount && currency && (
          <p>
            You donated <strong>{amount} {currency}</strong>. Thank you for your generosity!
          </p>
        )}
        {customerEmail && (
          <p>
            A confirmation has been sent to: <strong>{customerEmail}</strong>
          </p>
        )}
        {paymentId && (
          <p>
            Your payment ID is: <strong>{paymentId}</strong>
          </p>
        )}
        <div className="rounded-lg bg-primary-50 p-4">
          <p className="text-sm text-muted-foreground">
            "The future of finance is decentralized, and together, we are shaping it."
          </p>
          <p className="text-sm font-medium mt-2">— CryptoCurrent Team</p>
        </div>
      </CardBody>
      <CardFooter className="flex flex-col space-y-2">
        <Link href="/" className="w-full">
          <Button className="w-full" color='primary'>Return to Homepage</Button>
        </Link>
        <Link href="/donate" className="w-full">
          <Button variant="bordered" color="primary" className="w-full">
            Make Another Contribution
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
