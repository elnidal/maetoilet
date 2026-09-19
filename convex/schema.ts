import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  toiletStatus: defineTable({
    isOccupied: v.boolean(),
    currentUserName: v.optional(v.string()),
    occupiedSince: v.optional(v.number()),
    nudgedAt: v.optional(v.number()),
    occupantSubscriptionId: v.optional(v.id("pushSubscriptions")),
    currentLogId: v.optional(v.id("usageLogs")),
    lastUpdated: v.number(),
  }),

  usageLogs: defineTable({
    userName: v.optional(v.string()),
    enteredAt: v.number(),
    exitedAt: v.optional(v.number()),
    durationMinutes: v.optional(v.number()),
    autoReset: v.boolean(),
  }),

  pushSubscriptions: defineTable({
    endpoint: v.string(),
    p256dh: v.string(),
    auth: v.string(),
    userName: v.optional(v.string()),
  }).index("by_endpoint", ["endpoint"]),

  waitingQueue: defineTable({
    userName: v.string(),
    subscriptionId: v.optional(v.id("pushSubscriptions")),
    joinedAt: v.number(),
  }),
})
