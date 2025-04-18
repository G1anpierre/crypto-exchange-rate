"use server"
import { headers } from "next/headers"
import Stripe from "stripe"

// Initialize Stripe with your secret key
export async function createDonationCheckout(amount: number): Promise<string> {
  try {
    // Get the API key from environment variables
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY

    // Check if the API key exists
    if (!stripeSecretKey) {
      console.error("STRIPE_SECRET_KEY is not defined in environment variables")
      throw new Error("Stripe API key is missing")
    }

    // Initialize Stripe with the API key
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2025-03-31.basil",
      typescript: true,
    })

    // Get the host for the success and cancel URLs
    const headersList = await headers()
    const host = headersList.get("host") || "localhost:3000"
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https"

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "chf",
            product_data: {
              name: "Donation to CryptoCurrent",
              description: "Thank you for supporting our mission!",
            },
            unit_amount: amount * 100, // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${protocol}://${host}/donate/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${protocol}://${host}/donate`,
    })

    // Return the URL to redirect to
    return session.url || ""
  } catch (error) {
    console.error("Error creating checkout session:", error)
    throw new Error("Failed to create checkout session")
  }
}
