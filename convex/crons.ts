import { cronJobs } from "convex/server"
import { internal } from "./_generated/api"

const crons = cronJobs()

crons.interval("check toilet timers", { minutes: 1 }, internal.toilet.checkTimers, {})

export default crons
