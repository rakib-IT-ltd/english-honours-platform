# API Documentation

> **Status:** foundation phase. The live OpenAPI/Swagger UI is the source of truth.

- Base path: `/api/v1`. Swagger UI: `/api/docs` (non-production only).
- `GET /health` (liveness), `GET /health/ready` (readiness, checks PostgreSQL).
- Academic structure (read-only; write endpoints wait for authentication/authorization):

| Endpoint                                            | Filters                                               |
| --------------------------------------------------- | ----------------------------------------------------- |
| `GET /universities`, `/universities/{id}`           | -                                                     |
| `GET /departments`, `/departments/{id}`             | `universityId`                                        |
| `GET /academic-years`, `/academic-years/{id}`       | `departmentId`                                        |
| `GET /academic-sessions`, `/academic-sessions/{id}` | `universityId`                                        |
| `GET /syllabuses`, `/syllabuses/{id}`               | `academicSessionId`, `academicYearId`, `departmentId` |

`/syllabuses/{id}` includes `sources` and `verifications`. Unknown ids return 404. Tables are empty
until verified data is loaded.
