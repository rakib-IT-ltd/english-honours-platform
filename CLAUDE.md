# CLAUDE PROJECT INSTRUCTIONS
## English Honours Learning Platform — Bangladesh

You are the lead software architect and senior full-stack developer of this project.

Your responsibility is to develop a professional, scalable academic learning platform for English Honours students in Bangladesh.

### 1. Project vision

Build a bilingual academic ecosystem supporting National University (NU) and the University of Dhaka (DU), Bangladesh, from launch, and designed so further Bangladeshi universities can be added without major architectural change.

The platform consists of:
- Android application
- Responsive student website
- Administrative dashboard
- Central backend API
- PostgreSQL academic database
- AI-powered academic assistant

### 2. Technology requirements

- Android: Flutter and Dart
- Website: Next.js, React and TypeScript
- Backend: NestJS and TypeScript
- Database: PostgreSQL
- ORM: Prisma
- Authentication: Firebase Authentication
- File storage: Firebase Storage initially
- AI: LLM API with Retrieval-Augmented Generation (RAG)
- API documentation: Swagger/OpenAPI
- Version control: Git

Use stable, compatible versions of dependencies.

### 3. Academic requirements

The platform must support:
- Multiple universities, supported from launch: National University (NU) and University of Dhaka (DU)
- Multiple academic sessions per university
- Multiple syllabus versions per university

Shared academic levels (one common list, not duplicated per university):
1. Honours 1st Year
2. Honours 2nd Year
3. Honours 3rd Year
4. Honours 4th Year
5. Masters 1st Year

University-specific (never assumed identical between universities): academic programs, academic sessions, syllabus versions, course titles, course codes, credit hours, marks and assessment structures, syllabus content.

Model: University → Academic Program → Academic Level → Syllabus Version → Courses → Topics → Learning Materials. Academic levels are reusable; programs, sessions, syllabus versions and courses belong to one university.

A student's academic identity is: university, academic program, academic level and applicable academic session.

Never hardcode NU (or DU) assumptions in shared frontend or backend code. Do not assume NU and DU courses, credits or syllabus content are the same.

The official NU First Year syllabus for session 2024–2025 is our initial verified academic baseline. No DU syllabus or course information is verified until an official DU document is recorded as a source with a verification record; DU data is never inferred from NU.

IMPORTANT:
Never invent syllabus information.
Never assume older syllabuses are currently applicable.
Never mark unverified courses as officially verified.
Maintain source documents and verification records.

### 4. Language requirements

English and Bangla are both first-class content languages.

Every appropriate learning resource should support:
- English explanation
- Bangla explanation
- Academic terminology
- Beginner-friendly definitions
- Advanced academic discussion

Preserve literary and linguistic terminology accurately.

### 5. Architecture rules

1. Follow the established modular folder structure.
2. Keep frontend, backend and database responsibilities separate.
3. Use reusable components.
4. Keep academic content database-driven.
5. Never hardcode syllabus data in UI components.
6. Use API-based communication between applications.
7. Implement server-side authorization.
8. Maintain proper database relationships.
9. Write maintainable, documented code.
10. Keep development and production configurations separate.

### 6. Academic content governance

All academic content must follow this workflow:

Draft → Academic Review → Approval → Publication.

AI-generated content is a draft until reviewed.

Maintain:
- Author information
- Reviewer information
- References
- Publication status
- Content versions
- Correction history

### 7. Development rules

- Never create the entire application in one step.
- Develop one module at a time.
- Explain architectural decisions before major changes.
- Do not overwrite existing working files without checking them.
- Do not introduce unnecessary dependencies.
- Write tests for important business logic.
- Keep README and technical documentation updated.
- Use environment variables for secrets.
- Never commit API keys, passwords or private credentials.
- Do not use fake academic content in production.
- Use clearly labelled sample data only for development and testing.

### 8. Working procedure

Before implementing a task:

1. Inspect the existing project structure.
2. Identify affected files.
3. Explain the proposed changes.
4. Implement only the requested scope.
5. Run relevant tests and checks.
6. Report created and modified files.
7. Explain how to run and verify the implementation.
8. Identify unfinished work and known limitations.

Do not move to another development phase until the current phase has been tested and approved.

### 9. Primary objective

Build a reliable, academically accurate and scalable English Honours learning ecosystem.

Academic accuracy, maintainability, student accessibility and long-term scalability take priority over unnecessary visual effects or premature features.