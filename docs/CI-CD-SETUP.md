# 🚀 CI/CD Setup Guide for Discover Sports HK

This guide will help you set up the complete CI/CD pipeline for your Expo React Native app with TestFlight deployment.

## 📋 Prerequisites

Before setting up the CI/CD pipeline, ensure you have:

1. **Expo Account**: Create an account at [expo.dev](https://expo.dev)
2. **Apple Developer Account**: Required for TestFlight deployment
3. **Google Play Console Account**: Required for Android deployment
4. **GitHub Repository**: Your code should be in a GitHub repository

## 🔧 Setup Steps

### 1. Create Expo Access Token

1. Go to [expo.dev](https://expo.dev)
2. Navigate to your account settings
3. Create a new access token
4. Copy the token for later use

### 2. Configure GitHub Secrets

Add the following secrets to your GitHub repository (`Settings > Secrets and variables > Actions`):

#### Required Secrets:
- `EXPO_TOKEN`: Your Expo access token from step 1

#### iOS TestFlight Secrets:
- `EXPO_ASC_APP_ID`: Your App Store Connect app ID
- `EXPO_APPLE_TEAM_ID`: Your Apple Developer Team ID
- `EXPO_ASC_API_KEY_ID`: App Store Connect API Key ID
- `EXPO_ASC_API_KEY_ISSUER_ID`: App Store Connect API Key Issuer ID
- `EXPO_APPLE_APP_SPECIFIC_PASSWORD`: App-specific password for your Apple ID

#### Android Secrets:
- `EXPO_GOOGLE_SERVICE_ACCOUNT_KEY_PATH`: Path to your Google Service Account JSON file

### 3. Set up App Store Connect API Key

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Navigate to Users and Access > Keys
3. Create a new API key with App Manager role
4. Download the `.p8` file
5. Note the Key ID and Issuer ID

### 4. Set up Google Play Service Account

1. Go to [Google Play Console](https://play.google.com/console)
2. Navigate to Setup > API access
3. Create a new service account
4. Download the JSON key file
5. Grant necessary permissions

### 5. Configure EAS Build

Run the following commands to set up EAS:

```bash
# Install EAS CLI globally
npm install -g @expo/eas-cli

# Login to your Expo account
eas login

# Configure the build
eas build:configure
```

## 🔄 CI/CD Workflows

### 1. Pull Request Workflow (`publish-pull-request.yml`)

**Triggers**: When a PR is opened/updated against `develop` or `main`

**Actions**:
- Builds a preview version using the `preview` profile
- Posts download links in the PR comments
- Uses staging environment

### 2. Develop Branch Workflow (`publish-develop-build.yml`)

**Triggers**: When code is pushed to `develop` branch

**Actions**:
- Runs tests and linting
- Builds a test version using the `test` profile
- Creates internal testing builds
- Uses staging environment

### 3. Production Workflow (`publish-production-build.yml`)

**Triggers**: When code is pushed to `main` branch or manually triggered

**Actions**:
- Runs full test suite
- Builds production version
- Submits iOS build to TestFlight
- Submits Android build to Google Play Internal Testing
- Uses production environment

## 📱 Build Profiles

Your `eas.json` includes the following build profiles:

- **development**: Development client builds
- **preview**: Preview builds for PR testing
- **test**: Internal testing builds for develop branch
- **production**: Production builds for app stores
- **testflight**: Optimized builds for TestFlight

## 🔐 Environment Variables

The following environment variables are used across different profiles:

- `NODE_ENV`: Environment setting (development/staging/production)
- `EXPO_ASC_APP_ID`: App Store Connect App ID
- `EXPO_APPLE_TEAM_ID`: Apple Developer Team ID
- `EXPO_ASC_API_KEY_PATH`: Path to App Store Connect API key
- `EXPO_ASC_API_KEY_ID`: App Store Connect API Key ID
- `EXPO_ASC_API_KEY_ISSUER_ID`: App Store Connect API Key Issuer ID

## 🚀 Usage

### Creating a Preview Build (PR)
1. Create a pull request against `develop` or `main`
2. The workflow will automatically build a preview version
3. Download links will be posted in the PR comments

### Deploying to Internal Testing
1. Merge your PR to the `develop` branch
2. The workflow will automatically build and deploy to internal testing

### Deploying to Production/TestFlight
1. Merge `develop` to `main` branch
2. The workflow will automatically:
   - Build production versions
   - Submit iOS to TestFlight
   - Submit Android to Google Play Internal Testing

### Manual Production Build
1. Go to Actions tab in GitHub
2. Select "Build & Deploy Production (TestFlight)"
3. Click "Run workflow"
4. Choose platform (iOS, Android, or both)

## 📊 Monitoring

- **Build Status**: Check the Actions tab in your GitHub repository
- **EAS Builds**: Monitor at [expo.dev builds dashboard](https://expo.dev/accounts/sinhong2011/projects/discover-sports-hk/builds)
- **TestFlight**: Check [App Store Connect](https://appstoreconnect.apple.com)
- **Google Play**: Check [Google Play Console](https://play.google.com/console)

## 🛠 Troubleshooting

### Common Issues:

1. **Build Fails**: Check the GitHub Actions logs for detailed error messages
2. **TestFlight Submission Fails**: Verify your Apple credentials and API keys
3. **Android Submission Fails**: Check your Google Service Account permissions
4. **Environment Variables**: Ensure all required secrets are set in GitHub

### Getting Help:

- Check the [EAS Documentation](https://docs.expo.dev/build/introduction/)
- Review [GitHub Actions Documentation](https://docs.github.com/en/actions)
- Check the [Expo Discord](https://discord.gg/expo) for community support

## 📝 Next Steps

After setting up the CI/CD pipeline:

1. Test the workflow by creating a pull request
2. Monitor the first few builds to ensure everything works correctly
3. Set up notifications (Slack, email) for build status updates
4. Consider adding automated testing and code quality checks
5. Set up staging environments for more comprehensive testing

---

*This CI/CD setup is based on the GitFlow branching strategy and EAS best practices.*
