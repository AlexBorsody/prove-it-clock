# Native wrapper: iOS + Android shell, homescreen widget, native push

**2026-09-28. Task: "Wrap in native wrapper both platforms with homescreen
widget and native push for iOS."** This is a scoping brief, not a build
order. The shape needs Alex's calls (marked below) before anyone builds.

## Recommended approach: Capacitor shell

The site is a Next.js web app and stays the source of truth. A Capacitor
shell (native iOS + Android projects generated around a WebView) is the
fastest path to both stores with one codebase. No native rebuild, no
second app to maintain.

- **Push**: Capacitor PushNotifications plugin. iOS goes through APNs,
  Android through FCM. The existing web-push publication fan-out
  (`push-fanout.ts`, triggers on ledger publication) stays the single
  trigger; the server gains an APNs/FCM sender alongside the VAPID sender.
  Web users keep web push, app users get native push, same events.
- **Widget**: native code, not Capacitor. iOS WidgetKit extension + Android
  AppWidget, both reading a tiny public API (e.g. index value, followed
  projects' verdicts) on timeline refresh. This is the real native work in
  this task; budget it as such.
- **App Store review risk**: Apple rejects apps that are "just a website."
  The widget, native push, and native share/deep-link handling are the
  native functionality that justifies the listing. Do not ship a bare
  WebView and hope.

## Alternatives considered

- **PWA only**: iOS 16.4+ supports web push for home-screen-installed PWAs,
  but there is no homescreen widget without a native app. Does not satisfy
  the task.
- **Native rebuild (React Native / Swift / Kotlin)**: an order of magnitude
  more work pre-launch, two codebases to keep in sync with the web verdict.
  Revisit only if the wrapper hits a wall.

## Build logistics

Native iOS builds need Xcode, which means Alex's Mac. This is the
"talk to Codex as needed" part: Codex on the Mac is the natural builder
for the shell and the WidgetKit extension, with the web side (push sender,
widget API, deep links) done wherever the web work happens. Android builds
can happen anywhere with the SDK.

## Needed from Alex before build

1. **Apple Developer Program** enrollment ($99/yr) — required for APNs,
   TestFlight, and App Store. Cannot proceed on iOS without it.
2. **Google Play** developer account ($25 one-time) if shipping to Play;
   sideload/APK distribution is the no-account fallback for Android.
3. **Widget content call**: Prove Value Index number, followed projects'
   verdicts, or both? (Recommend: followed verdicts — personal, drives
   the return loop. Index alone is a billboard.)
4. **Firebase project** for FCM (Android push) — free tier is fine.
5. Confirm the wrapper loads the **live site URL** (recommended: always
   current, no app-update per web change) rather than a bundled build.

## Phasing

1. Capacitor shell + native push on both platforms, TestFlight/internal
   testing. (Unblocks the "native push for iOS" ask.)
2. Widget API + WidgetKit/AppWidget extensions.
3. Store listings and review.

## Acceptance

- Installable from TestFlight/Play internal track; push arrives on a
  ledger publication for a followed project on both platforms.
- Widget renders verdict data from the API without opening the app.
- No secrets in the repo; APNs/FCM credentials server-side only.
