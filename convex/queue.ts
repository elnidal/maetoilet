import { v } from "convex/values"
import { mutation, query, internalQuery, internalMutation } from "./_generated/server"

export const list = query({
  args: {},
  handler: async (ctx) => {
    const entries = await ctx.db.query("waitingQueue").collect()
    return entries.sort((a, b) => a.joinedAt - b.joinedAt)
  },
})

export const join = mutation({
  args: { userName: v.string(), subscriptionId: v.optional(v.id("pushSubscriptions")) },
  handler: async (ctx, args) => {
    const userName = args.userName.trim().slice(0, 60)
    if (!userName) throw new Error("missing_name")
    await ctx.db.insert("waitingQueue", {
      userName,
      subscriptionId: args.subscriptionId,
      joinedAt: Date.now(),
    })
  },
})

export const leave = mutation({
  args: { id: v.id("waitingQueue") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
  },
})

export const listInternal = internalQuery({
  args: {},
  handler: async (ctx) => await ctx.db.query("waitingQueue").collect(),
})

export const clearAll = internalMutation({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("waitingQueue").collect()
    await Promise.all(all.map((entry) => ctx.db.delete(entry._id)))
  },
})
