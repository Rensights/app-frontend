# Google Maps API Setup Instructions

## Error: RefererNotAllowedMapError

This error occurs when your Google Maps API key has HTTP referrer restrictions and your domain is not whitelisted.

## Solution: Add Your Domain to API Key Restrictions

### Step 1: Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/apis/credentials
2. Find your API key: `AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg`
3. Click on the API key to edit it

### Step 2: Configure Application Restrictions
1. Under "Application restrictions", select **"HTTP referrers (web sites)"**
2. Click **"Add an item"**
3. Add the following referrers:

**For Development:**
```
http://dev.72.62.40.154.nip.io:31416/*
http://localhost:3000/*
http://localhost:3001/*
```

**For Production (when ready):**
```
https://yourdomain.com/*
https://*.yourdomain.com/*
```

### Step 3: Save Changes
- Click **"Save"**
- Wait 1-2 minutes for changes to propagate
- Refresh your application

## Alternative: Remove Restrictions (Not Recommended for Production)

If you want to test quickly:
1. In API key settings, select **"None"** under Application restrictions
2. **WARNING**: This allows anyone to use your API key. Only use for testing!
3. Make sure to set up proper restrictions before going to production

## API Key Security Best Practices

1. **Always use HTTP referrer restrictions** in production
2. **Restrict to specific domains** (not wildcards unless necessary)
3. **Monitor API usage** in Google Cloud Console
4. **Set up billing alerts** to avoid unexpected charges
5. **Rotate keys** if they're accidentally exposed

## Current API Key
- Key: `AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg`
- Status: Has referrer restrictions (needs domain whitelist)

## Quick Fix URLs to Add

Copy and paste these into Google Cloud Console:

```
http://dev.72.62.40.154.nip.io:31416/*
http://dev.72.62.40.154.nip.io/*
http://localhost:3000/*
http://localhost:3001/*
```
