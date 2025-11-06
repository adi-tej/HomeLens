# HomeLens

About
-----
HomeLens is a TypeScript React Native app built with Expo. It provides mortgage and scenario comparison tools (UI built with React Native Paper and navigation via React Navigation). This repository contains the app source, assets and supporting configuration.

Setup
-----
These instructions assume you're on Windows (cmd.exe). The project uses Expo (see `package.json`).

Prerequisites
- Node.js (recommended >= 18) and a package manager (pnpm is used by this repo but npm/yarn also work).
- Expo CLI (you can use the bundled `expo` from the `expo` package or install `expo-cli` globally).
- Optional: Android Studio + Android SDK for Android emulator; a physical device may also be used.
- Git (for cloning/updating repo).

Install dependencies
1. Open a terminal at the project root (d:\BUSINESS\HomeLens).
2. Install dependencies. The repo contains a pnpm lockfile; if you use pnpm, run:

```bash
pnpm install
```

Start the development server (Expo)

```bash
pnpm run start
```

Run on Android (emulator or device)

```bash
pnpm run android
```

Run on iOS
- iOS builds require macOS and Xcode. On macOS run:

```bash
pnpm run ios
```

Type checking

```bash
pnpm run typecheck
```

Useful scripts (from package.json)
- start: `expo start`
- android: `expo start --android`
- ios: `expo start --ios`
- typecheck: `tsc --noEmit`
- eas:update: preview/production helpers if you use EAS

Environment / Android SDK (Windows)
If you plan to run on Android, ensure the Android SDK is installed. Example (PowerShell) to set ANDROID_SDK_ROOT:

```powershell
setx ANDROID_SDK_ROOT "C:\Users\<YourUser>\AppData\Local\Android\Sdk"
setx PATH "%PATH%;%ANDROID_SDK_ROOT%\platform-tools;%ANDROID_SDK_ROOT%\emulator;%ANDROID_SDK_ROOT%\tools\bin"
```

Restart your terminal or IDE after changing environment variables.

Troubleshooting
- If `expo`/`npx expo` isn't found, run `npm install` and try `npx expo start`.
- If Metro fails to load assets or bundling errors appear, try:

```bash
npx expo start -c
# or
npx react-native start --reset-cache
```

- If `adb` is not found, ensure `platform-tools` is on `PATH`.
- For Gradle/Android build errors, open `android` in Android Studio and run a clean build.

EAS (Expo Application Services)
- This project contains EAS-related scripts in `package.json`. If you use EAS for builds/updates, install and configure the `eas-cli` and login with `eas login`.

Contributing
- Fork and open a pull request.
- Code style: Prettier is installed and configured via `package.json` settings.
- Run `npm run typecheck` before opening a PR.

License
- This project uses the 0BSD license (see `package.json`).

If you'd like, I can also:
- Add a short Getting Started section that walks through creating a new Android emulator and running the app step-by-step, or
- Add CI/typecheck GitHub Actions for PRs.


