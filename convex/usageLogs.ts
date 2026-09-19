import { query } from "./_generated/server"

export const listCompleted = query({
  args: {},
  handler: async (ctx) => {
    const logs = await ctx.db.query("usageLogs").order("desc").take(500)
    return logs.filter((log) => log.exitedAt !== undefined)
  },
})
