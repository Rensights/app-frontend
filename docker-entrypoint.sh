#!/bin/sh
set -e
node -e 'const fs=require("fs");fs.writeFileSync("public/env.js","window.__API_URL__="+JSON.stringify(process.env.API_URL||process.env.NEXT_PUBLIC_API_URL||"")+";window.__GOOGLE_CLIENT_ID__="+JSON.stringify(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID||"")+";window.__FARO_URL__="+JSON.stringify(process.env.FARO_URL||process.env.NEXT_PUBLIC_FARO_URL||"")+";window.__GOOGLE_MAPS_API_KEY__="+JSON.stringify(process.env.GOOGLE_MAPS_API_KEY||process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY||"")+";window.__CLARITY_PROJECT_ID__="+JSON.stringify(process.env.CLARITY_PROJECT_ID||process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID||"")+";")'
exec node server.js
