# apps/mobile — Flutter (Android)

This directory holds the Dart sources (`lib/`, `test/`, `pubspec.yaml`, lints). The Android platform
folder (`android/`) is **not generated yet**, because the Flutter SDK could not be installed in the
environment where the foundation was created. Generate it once on a machine with Flutter:

```bash
cd apps/mobile
flutter create --platforms android --org <your.reverse.domain> --project-name english_honours_app .
git diff   # flutter create should only ADD files; review that pubspec.yaml / lib/main.dart are unchanged
flutter pub get
flutter analyze
flutter test
```

Choose a real `--org` (it becomes the Android application ID, e.g. `bd.example.englishhonours`);
changing it later is painful once the app is published.

Run against a local API (Android emulator reaches the host at `10.0.2.2`):

```bash
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:3001/api/v1
```

Never commit `android/app/google-services.json`, signing keys or `key.properties` (ignored by Git).
