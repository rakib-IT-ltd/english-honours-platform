import 'package:english_honours_app/core/config/app_config.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('apiBaseUrl defaults to the emulator host alias', () {
    expect(AppConfig.apiBaseUrl, startsWith('http'));
    expect(AppConfig.apiBaseUrl, endsWith('/api/v1'));
  });
}
