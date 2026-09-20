import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Taharet",
    short_name: "Taharet",
    description: "MAE öğretmenler tuvaleti anlık doluluk takibi",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#4f46e5",
    theme_color: "#4f46e5",
    lang: "tr",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  }
}
