import type { Metadata, Viewport } from "next"
import "./globals.css"
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister"
import { ConvexClientProvider } from "@/components/ConvexClientProvider"

export const metadata: Metadata = {
  title: "Taharet",
  description: "MAE öğretmenler tuvaleti — kim içeride, ne zaman boşalıyor, anında haber al.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Taharet",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#4f46e5",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className="h-full">
      <body className="min-h-full flex flex-col bg-slate-950 antialiased">
        <ServiceWorkerRegister />
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  )
}
