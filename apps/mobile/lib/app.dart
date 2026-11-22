import 'package:flutter/material.dart';

/// Foundation placeholder. No academic content, navigation or authentication exists yet.
class EnglishHonoursApp extends StatelessWidget {
  const EnglishHonoursApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'English Honours Learning Platform',
      theme: ThemeData(colorSchemeSeed: Colors.indigo, useMaterial3: true),
      home: const Scaffold(
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('English Honours Learning Platform'),
              // Placeholder wording - to be reviewed by an academic/language reviewer.
              Text('ইংরেজি অনার্স লার্নিং প্ল্যাটফর্ম'),
              SizedBox(height: 8),
              Text('Project foundation build'),
            ],
          ),
        ),
      ),
    );
  }
}
