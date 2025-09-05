# 🚀 Expo CI/CD Pipeline with Release-Please & TestFlight

This repository includes a complete CI/CD pipeline for your Discover Sports HK React Native app using GitHub Actions, Release-Please, and EAS (Expo Application Services).

## 📁 What's Been Added

### GitHub Actions Workflows
- **`.github/workflows/release-please.yml`** - Automated release management with release-please
- **`.github/workflows/publish-pull-request.yml`** - Builds preview versions for PR testing
- **`.github/workflows/publish-develop-build.yml`** - Builds test versions when pushing to develop
- **`.github/workflows/publish-production-build.yml`** - Builds and deploys to TestFlight/Play Store

### Configuration Updates
- **`eas.json`** - Updated with optimized build profiles for CI/CD
- **`package.json`** - Added new scripts for different build types
- **`.release-please-config.json`** - Release-please configuration for automated releases
- **`.release-please-manifest.json`** - Version tracking for release-please

### Documentation & Tools
- **`docs/CI-CD-SETUP.md`** - Complete setup guide
- **`scripts/ci-cd-helper.sh`** - Interactive helper script for manual operations

## 🔧 Quick Setup

### 1. Required GitHub Secrets

Add these secrets to your GitHub repository (`Settings > Secrets and variables > Actions`):

```
EXPO_TOKEN                          # Your Expo access token
EXPO_ASC_APP_ID                     # App Store Connect app ID  
EXPO_APPLE_TEAM_ID                  # Apple Developer team ID
EXPO_ASC_API_KEY_ID                 # App Store Connect API key ID
EXPO_ASC_API_KEY_ISSUER_ID          # App Store Connect API key issuer ID
EXPO_APPLE_APP_SPECIFIC_PASSWORD    # Apple app-specific password
EXPO_GOOGLE_SERVICE_ACCOUNT_KEY_PATH # Google Play service account key path
```

### 2. EAS Configuration

Your `eas.json` now includes these build profiles:

- **`development`** - Development builds with dev client
- **`preview`** - Preview builds for PR testing (staging env)
- **`test`** - Internal test builds for develop branch (staging env)
- **`production`** - Production builds for app stores
- **`testflight`** - Optimized builds for TestFlight submission

### 3. New Package Scripts

```bash
bun run build:preview     # Build preview version
bun run build:test        # Build test version
bun run build:testflight  # Build TestFlight version
bun run submit:testflight # Submit to TestFlight

# Release management (release-please)
bun run release:check     # Check what commits would trigger a release
bun run release:status    # See current release PR status
bun run release:help      # Get help with release process
```

## 🔄 CI/CD Workflow

### Pull Request Flow
1. Create PR → Automatic preview build
2. Download links posted in PR comments
3. Test on devices before merging

### Development Flow
1. Merge to `develop` → Automatic test build
2. Internal team can download and test
3. Runs full test suite and linting

### Production Flow (Release-Please)
1. Merge to `main` → Release-please analyzes commits
2. If conventional commits found → Create/update Release PR
3. Team reviews Release PR → Merge when ready
4. Release created → Production build triggered automatically
5. Submits iOS to TestFlight automatically
6. Submits Android to Google Play Internal Testing
7. Full quality checks before deployment

## 🛠 Manual Operations

Use the helper script for manual builds:

```bash
# Interactive menu
./scripts/ci-cd-helper.sh

# Direct commands
./scripts/ci-cd-helper.sh build-testflight
./scripts/ci-cd-helper.sh submit-testflight
./scripts/ci-cd-helper.sh check-builds
```

## 📱 Platform-Specific Setup

### iOS TestFlight Setup
1. Create App Store Connect API key
2. Set up provisioning profiles via EAS
3. Configure app-specific password
4. Add required secrets to GitHub

### Android Play Store Setup  
1. Create Google Play service account
2. Generate and upload service account key
3. Set up app signing in Play Console
4. Configure internal testing track

## 🔍 Monitoring & Debugging

- **GitHub Actions**: Check the Actions tab for build status
- **EAS Dashboard**: [expo.dev/accounts/sinhong2011/projects/discover-sports-hk/builds](https://expo.dev/accounts/sinhong2011/projects/discover-sports-hk/builds)
- **TestFlight**: App Store Connect → TestFlight
- **Play Console**: Google Play Console → Internal Testing

## 📋 Next Steps

1. **Set up secrets** in GitHub repository settings
2. **Configure Apple/Google credentials** using `eas credentials`
3. **Test the pipeline** by creating a pull request
4. **Monitor first builds** to ensure everything works
5. **Set up notifications** (optional) for build status

## 🆘 Getting Help

- Check `docs/CI-CD-SETUP.md` for detailed setup instructions
- Review GitHub Actions logs for build failures
- Use EAS documentation: [docs.expo.dev](https://docs.expo.dev)
- Join Expo Discord for community support

---

## 🎯 Benefits of This Setup

✅ **Automated Testing** - Every PR gets a testable build  
✅ **Quality Gates** - Linting, type checking, and tests run automatically  
✅ **TestFlight Integration** - Automatic iOS deployment  
✅ **Google Play Integration** - Automatic Android deployment  
✅ **Environment Management** - Separate staging and production environments  
✅ **Manual Controls** - Override automatic deployments when needed  
✅ **Monitoring** - Clear visibility into build and deployment status  

Your app development workflow is now fully automated! 🚀
