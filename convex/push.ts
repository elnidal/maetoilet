"use node"

import { v } from "convex/values"
import webpush from "web-push"
import { internalAction, type ActionCtx } from "./_generated/server"
import { internal } from "./_generated/api"
import type { Doc } from "./_generated/dataModel"

let configured = false
function ensureConfigured() {
  if (configured) return
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  )
  configured = true
}

type Payload = { title: string; body: string; tag?: string }

async function sendOne(ctx: ActionCtx, sub: Doc<"pushSubscriptions">, payload: Payload) {
  ensureConfigured()
  try {
    await webpush.sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      JSON.stringify(payload),
    )
  } catch (err: unknown) {
    const statusCode = (err as { statusCode?: number })?.statusCode
    if (statusCode === 404 || statusCode === 410) {
      await ctx.runMutation(internal.pushSubscriptions.remove, { id: sub._id })
    } else {
      console.error("[push] gönderim hatası:", sub.endpoint, err)
    }
  }
}

export const broadcast = internalAction({
  args: { title: v.string(), body: v.string(), tag: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const subs = await ctx.runQuery(internal.pushSubscriptions.listAll, {})
    await Promise.all(subs.map((s) => sendOne(ctx, s, args)))
  },
})

export const sendToSubscription = internalAction({
  args: {
    subscriptionId: v.id("pushSubscriptions"),
    title: v.string(),
    body: v.string(),
    tag: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const sub = await ctx.runQuery(internal.pushSubscriptions.getById, { id: args.subscriptionId })
    if (!sub) return
    await sendOne(ctx, sub, args)
  },
})

export const notifyQueueAndClear = internalAction({
  args: {},
  handler: async (ctx) => {
    const queue = await ctx.runQuery(internal.queue.listInternal, {})
    await Promise.all(
      queue.map(async (entry) => {
        if (!entry.subscriptionId) return
        const sub = await ctx.runQuery(internal.pushSubscriptions.getById, {
          id: entry.subscriptionId,
        })
        if (!sub) return
        await sendOne(ctx, sub, {
          title: "🎉 Sıra sende!",
          body: "Tuvalet boşaldı ve sıradaydın — hadi git!",
          tag: "queue",
        })
      }),
    )
    await ctx.runMutation(internal.queue.clearAll, {})
  },
})
