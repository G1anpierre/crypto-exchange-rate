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
      apiVersion: (process.env.STRIPE_API_VERSION || "2025-03-31.basil") as any,
      typescript: true,
    })

    // Get the host for the success and cancel URLs
    const headersList = await headers()
    const host = headersList.get("host") || "localhost:3000"
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https"

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "sofort", "giropay", "eps", "bancontact", "twint", "klarna", "paypal"],
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
      metadata: {
        donation_source: 'website_donate_page',
        // Add user ID if available
        // user_id: userId || 'anonymous', 
      },
      submit_type: 'donate',
      success_url: `${protocol}://${host}/donate/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${protocol}://${host}/donate`,
    })

    // Return the URL to redirect to
    return session.url || ""
  } catch (error: unknown) {
    console.error("Error creating checkout session:", error);
    if (error instanceof Error && (error as any).type === 'StripeCardError') {
      throw new Error(`Stripe error: ${error.message}`);
    } else {
      throw new Error("Failed to create checkout session");
    }
  }
}


// Function to validate and retrieve session details
export async function getSessionDetails(sessionId: string) {
  try {
    // Get the API key from environment variables
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY

    // Check if the API key exists
    if (!stripeSecretKey) {
      console.error("STRIPE_SECRET_KEY is not defined in environment variables")
      throw new Error("Stripe API key is missing")
    }

    // Check if the sessionId is valid
    if (!sessionId) {
      console.error("Session ID is not provided")
      throw new Error("Invalid session ID")
    }

    // Initialize Stripe with the API key
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: (process.env.STRIPE_API_VERSION || "2025-03-31.basil") as any,
    })

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent", "line_items"],
    })

    // Check if the session is valid and payment is successful
    if (session.payment_status !== "paid") {
      throw new Error("Payment not completed")
    }

    // Extract amount and currency from the session
    const lineItems = session.line_items?.data || []
    const amount = lineItems.length > 0 ? (lineItems[0].amount_total || 0) / 100 : 0 // Convert from cents
    const currency = lineItems.length > 0 ? (lineItems[0].currency || "chf").toUpperCase() : "CHF"

    // Extract the Payment Intent ID
    const paymentIntentId = typeof session.payment_intent === 'string' 
      ? session.payment_intent 
      : session.payment_intent?.id;

    return {
      success: true,
      amount,
      currency,
      customerEmail: session.customer_details?.email || "",
      paymentId: paymentIntentId || sessionId,
    }
  } catch (error) {
    console.error("Error retrieving session:", error)
    return { success: false, error: "Invalid or expired session" }
  }
}
