# FNPH Telepsychiatry: patient app (Android)

The FNPH Kaduna Telepsychiatry patient portal as an Android app, built with
React, TypeScript and Capacitor 8. It is for patients only. Staff, centres and
administrators keep using the website (fnph-web), which also keeps its own
patient portal for patients who prefer the browser.

| | |
| --- | --- |
| App id | `ng.fnphkaduna.patient` (permanent once on the Play Store) |
| App name | FNPH Telepsychiatry |
| Android | 7.0 and later (API 24), targets API 36 |
| API | `VITE_API_BASE_URL` in `.env.production` (https://app.fnphkaduna.cloud) |

## What a patient can do

Sign in with the EHR number, enrol, reset a forgotten password with the EHR
number, accept the telepsychiatry agreement, answer the safety questions,
book a slot, pay through Remita, see appointments and history, join the video
consultation, download prescriptions and investigation requests, upload
files, update contact details, manage password and signed-in devices, ask to
close the account, read help and privacy, and check a document's QR code.

## Set up your computer (once)

1. Install Node.js 22 or later.
2. Install Android Studio (latest stable). It brings the Android SDK and JDK 21.
3. In this folder:
   ```bash
   npm install
   ```

## Work on it in a browser

```bash
npm run dev
```

Opens on http://localhost:5174. API calls go to `http://localhost:8080`
(change with `VITE_API_PROXY_TARGET`). Check your work before building:

```bash
npm run typecheck
npm run lint
```

## Run it on a phone or emulator

```bash
npm run android:sync    # builds dist/ and copies it into android/
npm run android:open    # opens Android Studio
```

In Android Studio: wait for Gradle sync, pick a device or emulator, press Run.
For an APK: Build > Build App Bundle(s) / APK(s) > Build APK(s). It lands in
`android/app/build/outputs/apk/debug/`.

Run `npm run android:sync` after every code change. Android Studio shows the
last synced build, not your source files.

### Against a backend on your own computer

```bash
VITE_API_BASE_URL=http://10.0.2.2:8080 CAP_CLEARTEXT=1 CAP_DEBUG=1 npm run android:sync
```

`10.0.2.2` is your computer as seen from the emulator. `CAP_CLEARTEXT` allows
plain http and `CAP_DEBUG` lets Chrome's `chrome://inspect` attach. Never ship
a build made with either.

## What the server and website need

1. **Backend CORS.** The app's pages come from `https://localhost` on the phone.
   In the backend environment:
   ```
   CORS_ALLOWED_ORIGINS=https://app.fnphkaduna.cloud,https://localhost
   ```
   Without it every request fails and sign-in shows a network error.
2. **Payment return link.** Remita sends patients back to
   `https://app.fnphkaduna.cloud/portal/payment/return`. The app claims that
   address once the website serves `/.well-known/assetlinks.json`. A ready file
   is in `docs/assetlinks.json`:
   - Replace `REPLACE_WITH_APP_SIGNING_KEY_SHA256` with the app signing key's
     SHA-256 (Play Console > App integrity > App signing).
   - Put it in fnph-web at `public/.well-known/assetlinks.json` and make sure
     nginx serves it as JSON. Deploy the website.
   - Check on a phone: `adb shell pm get-app-links ng.fnphkaduna.patient`
     shows `app.fnphkaduna.cloud: verified`.

   Until then payment still works: the patient closes the Remita tab and the
   app checks the payment.
3. **Play Store pages.** The store listing needs a privacy policy URL and an
   account deletion URL on the website: `https://app.fnphkaduna.cloud/privacy`
   and `https://app.fnphkaduna.cloud/account-deletion`. The same pages are in
   this app under Help.

## Release build (Play Store)

1. **Upload key, once.** On a trusted computer; keep the file and passwords in
   FNPH's password manager.
   ```bash
   keytool -genkeypair -v -keystore fnph-upload-key.jks -alias fnph-upload -keyalg RSA -keysize 4096 -validity 10000
   ```
2. **Point the build at it.** Copy `android/keystore.properties.example` to
   `android/keystore.properties` and fill it in. Git ignores it. A build server
   can use the `FNPH_UPLOAD_*` environment variables instead.
3. **Raise the version** in `android/app/version.properties`: `VERSION_CODE` up
   by one, `VERSION_NAME` as patients see it.
4. **Build:**
   ```bash
   npm run android:bundle
   ```
   On Windows: `npm run android:sync`, then Android Studio > Build > Generate
   Signed App Bundle / APK. The file is
   `android/app/build/outputs/bundle/release/app-release.aab`.

The release build refuses to run if the synced app was built for testing
(Chrome debugging, plain http, a local API address, or `VITE_NATIVE_PREVIEW`)
or if no upload key is set. Run `npm run android:sync` with no test settings
and build again.

Store graphics are in `store/`: `icon-512.png`, `feature-graphic-1024x500.png`
and five phone screenshots (1080 x 1920).

## Test on a phone before release

1. Sign in, close the app from recent apps, reopen within 30 minutes: still signed in.
2. Leave it more than 30 minutes, reopen: asked to sign in.
3. Sign out from the navigation row: reopening asks to sign in.
4. Book up to payment, pay in the Remita tab, close the tab: "Payment confirmed" and the calendar.
5. Download a released prescription: it opens in the PDF viewer. **Open saved copy** opens it again.
6. Join a consultation: Android asks for camera and microphone; the doctor sees and hears you.
7. Deny camera, join again: the warning explains how to allow it.
8. Back button: closes a dialog, steps back, and from the dashboard sends the app to the background.
9. Forgot password with the EHR number: new password works; the in-app notice and email arrive.
10. Sign in with a staff account: the app says it is for patients and offers sign-out.

## How the code is laid out

```
index.html               the single page; the API address is written into its CSP at build
src/main.tsx             start-up: native platform, saved sign-in, router
src/app/                 routes (router.tsx, portalRoutes.tsx), providers, Android shell
src/native/              phone-only code: payment tab, file saving, saved sign-in
src/lib/platform.ts      the switch screens call for payment, files and camera
src/lib/api/             API client and endpoints the patient uses
src/lib/auth/            sign-in state and route guards
src/pages/, src/features/ the patient screens
android/                 the Android project (Capacitor)
assets/, store/          icon and splash sources; Play Store graphics
```

## Testing the phone code paths in a browser

`VITE_NATIVE_PREVIEW=1` turns the app's phone code on in a browser, with
Capacitor's browser fallbacks. Local testing only:

```bash
VITE_NATIVE_PREVIEW=1 VITE_API_BASE_URL=http://localhost:8080 npm run build && npx vite preview
```

Never sync a build made with it into `android/`.

## Changing the icon or splash

Edit `assets/` (1024 px icon, 2732 px splash), then `npm run android:assets`.

## Keeping in step with the website

The patient screens started as a copy of fnph-web's patient portal. A fix to
a patient screen on the website (payment, booking, documents) has to be made
here too, and the other way round. The API is the same backend for both.
