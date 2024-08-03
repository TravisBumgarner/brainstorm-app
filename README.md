# New Releases

1. Make code changes and merge into master.
2. Update ChangeLog.tsx
3. Increment version number
    1. Update package.json with new version number
    2. Update app.config.js with new version number
4. Perform local testing for Android and iOS
    - iOS
        - `yarn run build:ios:local:internal`
        - Load ipa onto device via XCode
    - Android
        - `yarn run build:android:local:internal`
        - Load apk onto device via `abd -s deviceid foo.apk`
5. (Optional) Generate new screenshots
    1. Play Store
    2. App Store
