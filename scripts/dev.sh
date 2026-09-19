#!/bin/bash
set -e

# Convex'in "use node" action'ları (convex/push.ts, web-push için) Node 20/22/24
# istiyor. Bu makinede varsayılan node v23 olduğu için (henüz desteklenmiyor),
# brew ile kurulan node@22'yi öne alıyoruz. Farklı bir makinede bu klasör yoksa
# sistemin varsayılan node'u kullanılır — Node sürümünü kontrol edip gerekirse
# `brew install node@22` çalıştır.
if [ -d "/opt/homebrew/opt/node@22/bin" ]; then
  export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
fi

# Bu makinede NODE_USE_SYSTEM_CA=1 (varsayılan ortam değişkeni) Convex'in
# api.convex.dev'e bağlanmasını "self-signed certificate" hatasıyla engelliyordu.
export NODE_USE_SYSTEM_CA=0

exec npx convex dev --start "next dev"
