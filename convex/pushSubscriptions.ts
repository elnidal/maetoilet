import { v } from "convex/values"
import { mutation, query, internalQuery, internalMutation } from "./_generated/server"

export const subscribe = mutation({
  args: {
    endpoint: v.string(),
    p256dh: v.string(),
    auth: v.string(),
    userName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_endpoint", (q) => q.eq("endpoint", args.endpoint))
      .first()

    if (existing) {
      await ctx.db.patch(existing._id, {
        p256dh: args.p256dh,
        auth: args.auth,
        userName: args.userName?.trim().slice(0, 60) || undefined,
      })
      return existing._id
    }

    return await ctx.db.insert("pushSubscriptions", {
      endpoint: args.endpoint,
      p256dh: args.p256dh,
      auth: args.auth,
      userName: args.userName?.trim().slice(0, 60) || undefined,
    })
  },
})

export const unsubscribe = mutation({
  args: { endpoint: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_endpoint", (q) => q.eq("endpoint", args.endpoint))
      .first()
    if (existing) await ctx.db.delete(existing._id)
  },
})

export const findByEndpoint = query({
  args: { endpoint: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_endpoint", (q) => q.eq("endpoint", args.endpoint))
      .first()
  },
})

export const listAll = internalQuery({
  args: {},
  handler: async (ctx) => await ctx.db.query("pushSubscriptions").collect(),
})

export const getById = internalQuery({
  args: { id: v.id("pushSubscriptions") },
  handler: async (ctx, args) => await ctx.db.get(args.id),
})

export const remove = internalMutation({
  args: { id: v.id("pushSubscriptions") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
  },
})
