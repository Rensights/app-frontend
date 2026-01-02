# Microsoft Clarity Analytics Setup

Microsoft Clarity has been integrated into the app-frontend to provide user behavior analytics, heatmaps, and session recordings.

## Setup Instructions

### 1. Get Your Clarity Project ID

1. Go to [Microsoft Clarity](https://clarity.microsoft.com/)
2. Sign in with your Microsoft account
3. Create a new project or select an existing one
4. Copy your **Project ID** from the project settings

### 2. Configure Environment Variable

Add the Clarity project ID to your environment configuration:

**For Development:**
- Add to `.env.local` or your development environment:
  ```
  NEXT_PUBLIC_CLARITY_PROJECT_ID=your-project-id-here
  ```

**For Production (Kubernetes):**
- Add to your Helm values or Kubernetes secrets:
  ```yaml
  extraEnv:
    NEXT_PUBLIC_CLARITY_PROJECT_ID: "your-project-id-here"
  ```

### 3. Verify Installation

After setting the environment variable and redeploying:

1. Open your application in a browser
2. Open browser DevTools → Console
3. In development mode, you should see: `Microsoft Clarity initialized with project ID: [your-id]`
4. Check Clarity Dashboard → Your project should start receiving data within a few minutes

## How It Works

- **Component**: `src/components/analytics/Clarity.tsx`
- **Integration**: Added to root layout (`src/app/layout.tsx`)
- **Initialization**: Automatically initializes on client-side when the app loads
- **Tracking**: Tracks page views, user interactions, heatmaps, and session recordings

## Features Enabled

- ✅ Page view tracking
- ✅ User session recordings
- ✅ Heatmaps (click, scroll, move)
- ✅ User behavior analytics
- ✅ Performance metrics

## Privacy Considerations

- Clarity respects user privacy settings
- No personally identifiable information (PII) is collected by default
- Session recordings can be configured to mask sensitive data
- Review Clarity's privacy policy and configure data collection settings in the Clarity dashboard

## Troubleshooting

### Clarity not initializing
- Check that `NEXT_PUBLIC_CLARITY_PROJECT_ID` is set correctly
- Verify the environment variable is available at build time (for `NEXT_PUBLIC_*` vars)
- Check browser console for errors
- Ensure you're not blocking third-party scripts

### No data in Clarity dashboard
- Wait a few minutes for data to appear (can take 5-10 minutes)
- Verify the project ID is correct
- Check browser network tab to see if Clarity scripts are loading
- Ensure you're not using an ad blocker that blocks Clarity

## Documentation

- [Microsoft Clarity Documentation](https://learn.microsoft.com/en-us/clarity/)
- [Clarity npm Package](https://www.npmjs.com/package/@microsoft/clarity)

