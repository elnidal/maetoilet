import { v } from "convex/values"
import { mutation, query, internalMutation, type MutationCtx } from "./_generated/server"
import { internal } from "./_generated/api"
import { AUTO_RESET_AFTER_MINUTES, NUDGE_AFTER_MINUTES } from "./constants"

export const getStatus = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("toiletStatus").first()
  },
})

export const enter = mutation({
  args: {
    userName: v.optional(v.string()),
    subscriptionId: v.optional(v.id("pushSubscriptions")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("toiletStatus").first()
    if (existing?.isOccupied) {
      throw new Error("already_occupied")
    }

    const now = Date.now()
    const displayName = args.userName?.trim().slice(0, 60) || "Biri"

    const logId = await ctx.db.insert("usageLogs", {
      userName: args.userName?.trim().slice(0, 60) || undefined,
      enteredAt: now,
      autoReset: false,
    })

    if (existing) {
      await ctx.db.patch(existing._id, {
        isOccupied: true,
        currentUserName: displayName,
        occupiedSince: now,
        nudgedAt: undefined,
        occupantSubscriptionId: args.subscriptionId,
        currentLogId: logId,
        lastUpdated: now,
      })
    } else {
      await ctx.db.insert("toiletStatus", {
        isOccupied: true,
        currentUserName: displayName,
        occupiedSince: now,
        occupantSubscriptionId: args.subscriptionId,
        currentLogId: logId,
        lastUpdated: now,
      })
    }

    await ctx.scheduler.runAfter(0, internal.push.broadcast, {
      title: "🚫 Tuvalet doldu",
      body: `${displayName} içeride. Boşuna yürüme, biraz bekle 😄`,
      tag: "toilet-status",
    })
  },
})

export const exit = mutation({
  args: {},
  handler: async (ctx) => {
    const result = await freeToilet(ctx, { autoReset: false })
    if (!result) throw new Error("not_occupied")
    return result
  },
})

/** Durum takılı kalırsa (ör. biri çıkışı işaretlemeden gitti) elle sıfırlama. */
export const forceReset = mutation({
  args: {},
  handler: async (ctx) => {
    const result = await freeToilet(ctx, { autoReset: true, reason: "forced" })
    if (!result) throw new Error("not_occupied")
    return result
  },
})

export const checkTimers = internalMutation({
  args: {},
  handler: async (ctx) => {
    const status = await ctx.db.query("toiletStatus").first()
    if (!status || !status.isOccupied || !status.occupiedSince) return

    const elapsedMinutes = (Date.now() - status.occupiedSince) / 60000

    if (elapsedMinutes >= AUTO_RESET_AFTER_MINUTES) {
      await freeToilet(ctx, { autoReset: true })
      return
    }

    if (elapsedMinutes >= NUDGE_AFTER_MINUTES && !status.nudgedAt) {
      await ctx.db.patch(status._id, { nudgedAt: Date.now() })
      if (status.occupantSubscriptionId) {
        await ctx.scheduler.runAfter(0, internal.push.sendToSubscription, {
          subscriptionId: status.occupantSubscriptionId,
          title: "👀 Hâlâ orada mısın?",
          body: `${NUDGE_AFTER_MINUTES} dakikadır içeridesin. Sorun yoksa boşver, unuttuysan çıkışı yapmayı unutma!`,
          tag: "nudge",
        })
      }
    }
  },
})

async function freeToilet(
  ctx: MutationCtx,
  opts: { autoReset: boolean; reason?: "forced" },
) {
  const status = await ctx.db.query("toiletStatus").first()
  if (!status || !status.isOccupied || !status.occupiedSince) return null

  const now = Date.now()
  const durationMinutes = Math.max(0, Math.round((now - status.occupiedSince) / 60000))

  await ctx.db.patch(status._id, {
    isOccupied: false,
    currentUserName: undefined,
    occupiedSince: undefined,
    nudgedAt: undefined,
    occupantSubscriptionId: undefined,
    currentLogId: undefined,
    lastUpdated: now,
  })

  if (status.currentLogId) {
    await ctx.db.patch(status.currentLogId, {
      exitedAt: now,
      durationMinutes,
      autoReset: opts.autoReset,
    })
  }

  const title =
    opts.reason === "forced"
      ? "🛠️ Elle sıfırlandı"
      : opts.autoReset
        ? "⏰ Otomatik boşaltıldı"
        : "✅ Tuvalet boşaldı!"
  const body =
    opts.reason === "forced"
      ? `${status.currentUserName ?? "Biri"} ${durationMinutes} dakikadır görünüyordu, biri durumu elle sıfırladı.`
      : opts.autoReset
        ? `${status.currentUserName ?? "Biri"} ${durationMinutes} dakikadır içerideydi, sistem otomatik boşalttı.`
        : "Artık kullanıma hazır 🚽"

  await ctx.scheduler.runAfter(0, internal.push.broadcast, { title, body, tag: "toilet-status" })

  await ctx.scheduler.runAfter(0, internal.push.notifyQueueAndClear, {})

  return { durationMinutes }
}
