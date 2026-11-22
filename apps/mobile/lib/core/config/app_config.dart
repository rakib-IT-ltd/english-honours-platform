/// Build-time configuration. Values are injected with `--dart-define`, never hardcoded secrets.
///
/// Example: flutter run --dart-define=API_BASE_URL=http://10.0.2.2:3001/api/v1
class AppConfig {
  const AppConfig._();

  /// Base URL of the backend API. The default targets a backend running on the host machine
  /// as seen from the Android emulator (10.0.2.2 is the emulator's alias for the host).
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:3001/api/v1',
  );
}
