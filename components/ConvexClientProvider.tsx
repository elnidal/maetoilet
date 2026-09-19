"use client"

import { ReactNode } from "react"
import { ConvexProvider, ConvexReactClient } from "convex/react"
import { SetupNotice } from "@/components/SetupNotice"

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  if (!convex) return <SetupNotice />
  return <ConvexProvider client={convex}>{children}</ConvexProvider>
}
