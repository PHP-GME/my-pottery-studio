# My Pottery Studio — iPhone home-screen web app

## Publish for free with GitHub Pages
1. On your Mac, create a free GitHub account if needed.
2. Create a new **public** repository, for example `my-pottery-studio`. (The **source code** will be public, but pottery records and photos are not uploaded to GitHub; they stay in your browser.)
3. Upload all files from this folder to the repository root, including the two PNG icons.
4. In repository **Settings → Pages**, choose **Deploy from a branch**, branch `main`, folder `/ (root)`, then Save.
5. Open the HTTPS Pages URL on your iPhone in Safari. Use Share → Add to Home Screen → Add.
6. Add a test pot, close and reopen the home-screen app, then tap Backup archive. Choose **Save to Files → iCloud Drive** in the share sheet. Test Restore archive using a disposable test pot.

## Important storage notes
- This app uses IndexedDB **on the device**. It does **not** automatically sync via iCloud. iCloud Drive is used only when you manually save exported backups.
- Keep regular dated backups. Clearing Safari website data, removing the home-screen app, or losing the device can erase locally saved data.
- Backups are JSON files containing photo data. They can become large; they are **not encrypted**, so keep them in your private iCloud Drive, not a public GitHub repository.
- Restore **replaces** the local gallery, so export the current gallery first.
- iOS may have storage limits; avoid storing hundreds of full-resolution photos without frequent backup. For a larger collection, plan dedicated cloud storage.
- Existing SwiftData records in the native iPhone app are **not automatically migrated**. Keep that app installed until you manually recreate your test pot or implement an export.
- GitHub Pages is a public website; anyone with the URL can load the app shell, but the data entered stays local on their own device. Do not use the public repository for photos or backups.
- Service worker offline caching works after the site has loaded online once, but offline availability depends on browser caching.
