# TestFlight Deployment Setup

This document explains how to set up and use the automated TestFlight deployment workflow for the Discover Sports HK app.

## Overview

The TestFlight deployment workflow automatically builds and submits iOS builds to Apple's TestFlight when code is pushed to the `testflight` branch. This allows for streamlined beta testing and release management.

## Prerequisites

### 1. Apple Developer Account
- Active Apple Developer Program membership
- App registered in App Store Connect with bundle ID: `com.openpandata.discoversportshk`

### 2. App Store Connect API Key
You need to create an App Store Connect API Key for automated submissions:

1. Sign in to [App Store Connect](https://appstoreconnect.apple.com)
2. Go to Users and Access > Integrations > App Store Connect API
3. Click "Generate API Key"
4. Select "App Manager" role (or higher)
5. Download the `.p8` key file
6. Note down the Key ID and Issuer ID

### 3. Required EAS Secrets

Set up the following secrets in your EAS project:

```bash
# Set EAS secrets (run these commands in your project directory)
eas secret:create --scope project --name EXPO_ASC_APP_ID --value "your-app-store-connect-app-id"
eas secret:create --scope project --name EXPO_APPLE_TEAM_ID --value "your-apple-team-id"
eas secret:create --scope project --name EXPO_ASC_API_KEY_ID --value "your-api-key-id"
eas secret:create --scope project --name EXPO_ASC_API_KEY_ISSUER_ID --value "your-issuer-id"
```

For the API key file, you have two options:

**Option A: Upload key file to EAS**
```bash
eas secret:create --scope project --name EXPO_ASC_API_KEY_PATH --value "$(cat /path/to/your/AuthKey_XXXXXXXXXX.p8)"
```

**Option B: Use base64 encoded key**
```bash
# Encode the key file
base64 -i /path/to/your/AuthKey_XXXXXXXXXX.p8 | pbcopy
# Then create the secret with the base64 content
eas secret:create --scope project --name EXPO_ASC_API_KEY_BASE64 --value "paste-base64-content-here"
```

### 4. Finding Your App Store Connect Information

**App Store Connect App ID (ascAppId):**
1. Sign in to App Store Connect
2. Navigate to "My Apps"
3. Click on your app
4. Go to "App Information" in the left sidebar
5. Find "Apple ID" under "General Information"

**Apple Team ID:**
1. Sign in to [Apple Developer Portal](https://developer.apple.com)
2. Go to "Membership" in the sidebar
3. Your Team ID is listed under "Membership Information"

## Workflow Configuration

The workflow is configured in `.eas/workflows/testflight-deployment.yml` and includes:

1. **Test Job**: Runs tests, type checking, linting, and i18n compilation
2. **Build Job**: Creates iOS production build using the `testflight` profile
3. **Submit Job**: Submits the build to TestFlight
4. **Notify Job**: Provides deployment status notifications

## Build Profile

The `testflight` build profile in `eas.json` extends the production profile with:
- Store distribution
- TestFlight channel
- Production environment variables
- Release build configuration for iOS

## Usage

### Triggering a TestFlight Deployment

1. **Push to testflight branch:**
   ```bash
   git checkout testflight
   git merge main  # or merge your feature branch
   git push origin testflight
   ```

2. **Manual trigger:**
   - Go to your EAS project dashboard
   - Navigate to Workflows
   - Click "Run workflow" on the TestFlight Deployment workflow

### Monitoring Deployment

1. **EAS Dashboard**: Monitor build and submission progress
2. **App Store Connect**: Check TestFlight section for build processing
3. **Workflow Logs**: Review detailed logs for any issues

## Testing the Setup

### Dry Run (Recommended First)

Before setting up real credentials, test the workflow structure:

1. Create a test branch:
   ```bash
   git checkout -b test-testflight-workflow
   ```

2. Push to trigger the workflow (it will fail at submission, which is expected):
   ```bash
   git push origin test-testflight-workflow:testflight
   ```

3. Review the logs to ensure the test and build jobs work correctly

### Full Test

After setting up all credentials:

1. Push a small change to the testflight branch
2. Monitor the workflow in EAS dashboard
3. Check TestFlight in App Store Connect for the new build
4. Verify the build appears for internal testing

## Troubleshooting

### Common Issues

**Build fails with credential errors:**
- Verify all EAS secrets are set correctly
- Check that the API key file is valid and not expired
- Ensure the Apple Team ID matches your developer account

**Submission fails:**
- Verify the App Store Connect App ID is correct
- Check that the bundle identifier matches in both app.config.ts and App Store Connect
- Ensure your Apple Developer account has necessary permissions

**Tests fail:**
- Check that all dependencies are properly installed
- Verify test files are not broken
- Review linting and type checking errors

### Getting Help

1. Check EAS build logs for detailed error messages
2. Review Apple Developer documentation for App Store Connect API
3. Contact the development team for project-specific issues

## Security Notes

- Never commit API keys or certificates to the repository
- Use EAS secrets for all sensitive information
- Regularly rotate API keys as per Apple's recommendations
- Limit API key permissions to minimum required scope

## Branch Management

- The `testflight` branch should be protected
- Only merge tested and reviewed code to `testflight`
- Consider using pull requests for `testflight` branch updates
- Keep `testflight` branch in sync with `main` for releases
