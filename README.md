# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Deployment Strategy

This project uses a **branch-based deployment strategy** with automated CI/CD through GitHub Actions:

### 🏪 Production Deployment (`main` branch)
- **Trigger**: Push to `main` branch
- **Build Profile**: `production`
- **iOS**: Deployed to **App Store** (Production)
- **Android**: Deployed to **Google Play Store** (Production)
- **Environment**: `production`

### 🧪 Beta Deployment (`preview` branch)
- **Trigger**: Push to `preview` branch
- **Build Profile**: `testflight`
- **iOS**: Deployed to **TestFlight** (Beta Testing)
- **Android**: Deployed to **Google Play Internal Testing**
- **Environment**: `production` (with beta distribution)

### How to Deploy

1. **For Beta Testing**:
   ```bash
   git checkout preview
   git merge your-feature-branch
   git push origin preview
   ```

2. **For Production Release**:
   ```bash
   git checkout main
   git merge preview  # or your-feature-branch
   git push origin main
   ```

### Manual Deployment
You can also trigger deployments manually via GitHub Actions:
- Go to **Actions** → **🚀 Build & Deploy (Branch-based)**
- Click **Run workflow**
- Select platform (`all`, `ios`, or `android`)
- Optionally specify a release version

### Build Profiles
The project uses different EAS build profiles:
- `production`: Store-ready builds for production release
- `testflight`: Beta builds for TestFlight distribution
- `preview`: Internal preview builds for testing

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
