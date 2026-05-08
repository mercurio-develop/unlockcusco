# Capacitor Development Guide for Vallecito

This guide outlines the workflows for developing, testing, and building the Vallecito Next.js application as a native mobile app using Ionic Capacitor.

Because the project utilizes Next.js Server Components and Server Actions, testing on mobile devices during development requires a "Live Reload" setup. Building for final production on mobile requires a Static HTML Export (`output: 'export'`).

## Method 1: Development with Live Reload (Recommended)

This is the standard workflow for active development. It points the native iOS/Android app to your local Next.js development server running on your computer. This allows you to use Server Components, Server Actions, and API routes locally while seeing the UI instantly update on your phone or emulator.

### 1. Find your Local IP Address
Ensure your development computer and your mobile device (or emulator) are on the same Wi-Fi network. Find your computer's local IP (e.g., `192.168.1.x` or `10.0.0.x`).
- **Mac:** `ipconfig getifaddr en0` (or check System Settings > Network)
- **Linux:** `hostname -I` or `ip a`
- **Windows:** `ipconfig`

### 2. Configure Capacitor to use the Dev Server
Temporarily modify `capacitor.config.ts` to include the `server` block pointing to your local IP:

```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vallecito.app',
  appName: 'Vallecito',
  webDir: 'public', // Fallback
  server: {
    url: 'http://<YOUR_LOCAL_IP>:3000', // e.g., 'http://192.168.1.50:3000'
    cleartext: true
  }
};

export default config;
```

> **⚠️ IMPORTANT:** Do **NOT** commit this change to version control (`capacitor.config.ts`). Revert it before creating a production build.

### 3. Start the Next.js Dev Server
You must bind the Next.js server to `0.0.0.0` so it accepts connections from other devices on the network, not just `localhost`.

```bash
npm run dev -- -H 0.0.0.0
```

### 4. Sync and Run the Native App
Open a new terminal window to run the Capacitor commands:

```bash
# Sync the configuration to the native projects
npx cap sync

# Run on Android (Emulator or physical device via USB)
npx cap run android
# Or open in Android Studio: npx cap open android

# Run on iOS (Mac only, Simulator or physical device)
npx cap run ios
# Or open in Xcode: npx cap open ios
```

---

## Method 2: Production Build (Static Export)

When you are ready to build the final binaries (.apk/.aab for Android, .ipa for iOS) for the app stores, the app must run entirely on the device without a development server. 

This requires Next.js to perform a **Static HTML Export**.

### ⚠️ Prerequisites for Static Export
Next.js Static Export does **not** support Node.js Server Components, dynamic server routes, or Server Actions that rely on a Node.js runtime environment running *inside* the mobile app. 

Before doing a production build, you must:
1. Ensure all API calls point to an external, hosted backend (e.g., your Vercel deployment URL).
2. Ensure components that fetch dynamic data client-side are marked with `"use client"`.

### 1. Enable Static Export
Open `next.config.ts` and uncomment the `output: 'export'` line:

```typescript
const nextConfig: NextConfig = {
  output: 'export', // Enables static HTML export
  images: {
    unoptimized: true, // Required for static export if using next/image
    // ...
  },
  // ...
};
```

### 2. Update Capacitor Config
Ensure `capacitor.config.ts` does **not** have the `server` block from the development steps, and update `webDir` to point to the Next.js export directory (`out` by default).

```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vallecito.app',
  appName: 'Vallecito',
  webDir: 'out'
};

export default config;
```

### 3. Build and Sync
```bash
# 1. Build the static Next.js app (creates the /out folder)
npm run build

# 2. Copy the /out folder into the native iOS/Android projects
npx cap sync
```

### 4. Build the Native Binaries
Open the respective native IDEs to create the final release builds:

```bash
npx cap open android
npx cap open ios
```

- **Android Studio:** Go to `Build` > `Generate Signed Bundle / APK...`
- **Xcode:** Go to `Product` > `Archive` (requires Apple Developer account)
