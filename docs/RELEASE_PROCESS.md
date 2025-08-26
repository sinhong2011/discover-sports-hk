# Release Process Documentation

## Overview

This document outlines the complete release process for the Discover Sports HK app, including version management, build automation, and store submission.

## Release Strategy

### Version Management
- **Semantic Versioning (SemVer)**: `MAJOR.MINOR.PATCH[-PRERELEASE]`
- **Current Version**: Synced between `package.json` and `app.config.js`
- **Build Numbers**: Auto-incremented via EAS_BUILD_NUMBER

### Release Channels
- **Development**: Internal testing (`develop` branch)
- **Preview**: Stakeholder review (Pull Requests)
- **Production**: App Store/Play Store (Tagged releases)

## Release Workflow

### 1. Development Release
```bash
# Push to develop branch triggers development build
git checkout develop
git push origin develop
```

### 2. Preview Release (PR)
```bash
# Create feature branch and PR
git checkout -b feature/new-feature
git commit -m "feat: add new feature"
git push origin feature/new-feature
# Create PR → triggers preview build
```

### 3. Alpha/Beta Release
```bash
# Alpha release
bun run release:alpha
# Creates: 0.1.0-alpha.1, 0.1.0-alpha.2, etc.

# Beta release  
bun run release:beta
# Creates: 0.1.0-beta.1, 0.1.0-beta.2, etc.
```

### 4. Production Release
```bash
# Production release
bun run release
# Creates: 0.1.0, 0.2.0, 1.0.0, etc.

# This will:
# 1. Update version in package.json
# 2. Generate CHANGELOG.md
# 3. Create git tag
# 4. Push to GitHub
# 5. Trigger production build & store submission
```

## Build Profiles

### Development
- **Purpose**: Internal testing
- **Distribution**: Internal
- **Channel**: development
- **Trigger**: Push to `develop` branch

### Preview  
- **Purpose**: Stakeholder review
- **Distribution**: Internal
- **Channel**: preview
- **Trigger**: Pull Requests
- **Features**: iOS Simulator support

### Production
- **Purpose**: Store submission
- **Distribution**: Store
- **Channel**: production
- **Trigger**: Git tags (v*)
- **Features**: Auto-increment build numbers

## Required Setup

### 1. Environment Variables
Set these in your GitHub repository secrets:
- `EXPO_TOKEN`: Your Expo access token
- Additional secrets for store submission (see EAS docs)

### 2. Store Configuration
Update `eas.json` with your store credentials:
```json
"submit": {
  "production": {
    "ios": {
      "appleId": "your-apple-id@example.com",
      "ascAppId": "your-app-store-connect-app-id"
    },
    "android": {
      "serviceAccountKeyPath": "./android/service-account-key.json"
    }
  }
}
```

## Commands Reference

### Version Management
```bash
bun run release:dry        # Preview changes without committing
bun run release:alpha      # Create alpha prerelease
bun run release:beta       # Create beta prerelease  
bun run release            # Create production release
```

### Build Commands
```bash
bun run build:dev         # Build development profile
bun run build:preview     # Build preview profile
bun run build:prod        # Build production profile
bun run submit:prod       # Submit to stores
```

### Development Commands
```bash
bun start                  # Start development server
bun test                   # Run tests
bun run type-check         # TypeScript check
bun run check              # Lint & format check
```

## Troubleshooting

### Version Mismatch
If versions get out of sync:
1. Check `package.json` version
2. Verify `app.config.js` reads from package.json
3. Ensure Android `build.gradle` uses dynamic versioning

### Build Failures
1. Check GitHub Actions logs
2. Verify all secrets are set
3. Ensure EAS CLI is authenticated
4. Check for TypeScript/lint errors

### Store Submission Issues
1. Verify store credentials in `eas.json`
2. Check build profile configuration
3. Ensure proper signing certificates

## Best Practices

1. **Always test locally** before releasing
2. **Use preview builds** for stakeholder review
3. **Follow conventional commits** for automatic changelog generation
4. **Tag releases** for production builds
5. **Monitor build status** in GitHub Actions
6. **Keep secrets secure** and rotate regularly

## Support

For issues with the release process:
1. Check GitHub Actions logs
2. Review EAS build logs
3. Consult Expo documentation
4. Contact the development team
