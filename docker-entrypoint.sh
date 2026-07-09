#!/bin/sh
set -e
node -e 'const fs=require("fs");fs.writeFileSync("public/env.js","window.__API_URL__="+JSON.stringify(process.env.API_URL||process.env.NEXT_PUBLIC_API_URL||"")+";window.__GOOGLE_CLIENT_ID__="+JSON.stringify(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID||"")+";")'
exec node server.js
