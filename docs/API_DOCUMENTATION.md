# API Documentation

> **Status:** foundation phase. The live OpenAPI/Swagger UI is the source of truth.

- Base path: `/api/v1`. Swagger UI: `/api/docs` (non-production only).
- `GET /health` (liveness), `GET /health/ready` (readiness, checks PostgreSQL).
- Academic structure (read-only; write endpoints wait for authentication/authorization):

| Endpoint                                            | Filters                                                                                  |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `GET /universities`, `/universities/{id}`           | -                                                                                        |
| `GET /departments`, `/departments/{id}`             | `universityId`                                                                           |
| `GET /academic-programs`, `/academic-programs/{id}` | `universityId`, `programmeType` (`HONOURS`, `MASTERS`)                                   |
| `GET /academic-levels`, `/academic-levels/{id}`     | `academicProgramId` (levels are shared by all universities)                              |
| `GET /academic-sessions`, `/academic-sessions/{id}` | `universityId`                                                                           |
| `GET /syllabuses`, `/syllabuses/{id}`               | `universityId`, `academicProgramId`, `academicLevelId`, `academicSessionId`, `isCurrent` |

`/academic-programs/{id}` includes the shared `levels` the program offers, in order.

`/syllabuses/{id}` includes `sources` and `verifications`. Unknown ids return 404. Tables are empty
until verified data is loaded.

## Courses and books (read-only, published content only)

| Endpoint                        | Filters                  |
| ------------------------------- | ------------------------ |
| `GET /courses`, `/courses/{id}` | `syllabusId`             |
| `GET /books`, `/books/{id}`     | `syllabusId`, `courseId` |

Only `PUBLISHED` courses and books are returned; a book also needs its course to be published.
Anything else is 404 on `/{id}` and absent from lists. `/courses/{id}` includes its published books;
`/books/{id}` includes its course.

## Study material (public; only `PUBLISHED` content)

| Endpoint                             | Purpose                                                                                                                                                            |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `GET /books/:bookId/sections`        | Published sections of a book, with the kinds of material available                                                                                                 |
| `GET /sections/:id`                  | One section with all its items, and previous/next section ids                                                                                                      |
| `GET /books/:bookId/resources/:kind` | One kind (`ORIGINAL_TEXT`, `BANGLA_EXPLANATION`, `SUMMARY`, `CRITICAL_ANALYSIS`, `QUOTATION`, `QUESTION_ANSWER`, `VOCABULARY`, `CENTRAL_IDEA`) across the sections |

404 when the book/section is not published; 400 for an unknown kind.

## My study data (requires `Authorization: Bearer <Firebase ID token>`)

| Endpoint                                         | Purpose                                               |
| ------------------------------------------------ | ----------------------------------------------------- |
| `GET /me/study/books/:bookId`                    | My completed sections, last section, bookmarks, notes |
| `PUT /me/study/sections/:id/progress`            | `{ "completed": true/false }`; also records "opened"  |
| `PUT` / `DELETE /me/study/sections/:id/bookmark` | Add / remove my bookmark                              |
| `PUT /me/study/sections/:id/note`                | `{ "body": "..." }` (1-5000 characters)               |
| `DELETE /me/study/sections/:id/note`             | Delete my note                                        |

## Student account (requires `Authorization: Bearer <Firebase ID token>`)

| Endpoint          | Purpose                                                                                   |
| ----------------- | ----------------------------------------------------------------------------------------- |
| `GET /me`         | Current user (created on first call) and academic profile, or `profile: null`             |
| `PATCH /me`       | Update `displayName` and/or `preferredLanguage` (`en` or `bn`)                            |
| `PUT /me/profile` | Save `universityId`, `academicProgramId`, `academicLevelId`, optional `academicSessionId` |

Errors: 401 missing/invalid token, 503 token verification not configured on the server, 422 the
program/level/session does not belong to the chosen university or the level is not offered by the
program. Responses never contain the Firebase uid. Passwords are handled only by Firebase.
