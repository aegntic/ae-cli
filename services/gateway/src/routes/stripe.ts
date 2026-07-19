import { Hono } from "hono"
import { nanoid } from "nanoid"
import Stripe from "stripe"
import type { Env } from "../types.js"
import type { ApiResponse } from "@aegntic/sdk"
import { appendLedgerEntry } from "../lib/ledger.js"

export const stripeRoute = new Hono<Env>()

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2025-07-30.basil" as Stripe.LatestApiVersion,
})

/**
 * POST /v1/stripe/checkout
 * Creates a Stripe Checkout Session for a balance top-up.
 * Requires auth (workspace API key). Returns the checkout URL.
 *
 * Body: { amount: number } (in USD, minimum 1)
 */
stripeRoute.post("/stripe/checkout", async (c) => {
  const workspace = c.get("workspace")
  const body = await c.req.json<{ amount?: number }>().catch(() => ({ amount: 10 }))
  const amount = Math.max(body.amount ?? 10, 1)

  if (!process.env.STRIPE_SECRET_KEY) {
    return c.json({ error: "Stripe not configured" }, 503)
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: Math.round(amount * 100),
            product_data: {
              name: `Aedex balance top-up ($${amount.toFixed(2)})`,
              description: "Prepaid credit for data tool runs",
            },
          },
        },
      ],
      metadata: {
        workspaceId: workspace.id,
        amount: String(amount),
      },
      success_url: `${process.env.WEB_URL ?? "https://aedex.ing"}/app?topup=success`,
      cancel_url: `${process.env.WEB_URL ?? "https://aedex.ing"}/app?topup=cancelled`,
    })

    const response: ApiResponse<{ url: string; sessionId: string }> = {
      data: { url: session.url ?? "", sessionId: session.id },
      requestId: nanoid(8),
    }
    return c.json(response)
  } catch (err) {
    return c.json(
      { error: err instanceof Error ? err.message : "Stripe error" },
      500,
    )
  }
})

/**
 * POST /v1/stripe/webhook
 * Receives Stripe webhook events. Verifies the signature, then creates
 * a ledger topup entry on checkout.session.completed.
 *
 * This route MUST be mounted BEFORE the auth middleware (public).
 */
export async function handleStripeWebhook(c: any) {
  const sig = c.req.header("stripe-signature")
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!sig || !webhookSecret) {
    return c.json({ error: "Missing signature or webhook secret" }, 400)
  }

  let event: Stripe.Event
  try {
    const rawBody = await c.req.text()
    event = await stripe.webhooks.constructEventAsync(
      rawBody,
      sig,
      webhookSecret,
    )
  } catch (err) {
    return c.json(
      { error: `Webhook signature verification failed: ${err instanceof Error ? err.message : "unknown"}` },
      400,
    )
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    const workspaceId = session.metadata?.workspaceId
    const amount = Number(session.metadata?.amount ?? 0)

    if (!workspaceId || amount <= 0) {
      console.error("[stripe] missing workspaceId or amount in session metadata")
      return c.json({ error: "Missing metadata" }, 400)
    }

    // Append a signed ledger topup entry.
    try {
      await appendLedgerEntry({
        workspaceId,
        type: "topup",
        amount,
        currency: "USD",
        reason: `Stripe payment ${session.payment_intent ?? session.id}`,
      })
      console.log(`[stripe] topup: +$${amount} to ${workspaceId}`)
    } catch (err) {
      console.error("[stripe] ledger topup failed:", err)
      return c.json({ error: "Ledger write failed" }, 500)
    }
  }

  return c.json({ received: true })
}

export default stripeRoute