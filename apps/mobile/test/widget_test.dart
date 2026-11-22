import 'package:english_honours_app/app.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('shows the platform title', (WidgetTester tester) async {
    await tester.pumpWidget(const EnglishHonoursApp());
    expect(find.text('English Honours Learning Platform'), findsOneWidget);
  });
}
