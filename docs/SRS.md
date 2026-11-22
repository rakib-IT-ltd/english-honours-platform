# Software Requirements Specification

> **Status:** partial. Written module by module and approved before each module is built. Only the
> requirements fixed so far are listed. Source of truth for rules: [`CLAUDE.md`](../CLAUDE.md).

## 1. Scope

A bilingual (English/Bangla) learning platform for English students at Bangladeshi universities.
National University (NU) and University of Dhaka (DU) are supported from launch; more universities
must be addable without major architectural change.

## 2. Academic structure requirements

| ID    | Requirement                                                                                                                                                                   |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-1  | The system supports several universities at once (NU and DU at launch).                                                                                                       |
| AC-2  | There are exactly five shared academic levels: Honours 1st, 2nd, 3rd, 4th Year and Masters 1st Year. They are stored once and reused by all universities.                     |
| AC-3  | Each university has its own academic programs (English Honours, 4 years; English Masters, 1 year), academic sessions and syllabus versions.                                   |
| AC-4  | A syllabus version belongs to one university, one program, one level and one session. The database rejects a mix of universities, and a level the program does not offer.     |
| AC-5  | Course titles, course codes, credit hours, marks/assessment structures and content are university-specific. The system never assumes they are identical between universities. |
| AC-6  | A student identifies their university, program, level and session; the curriculum shown is the one for that combination.                                                      |
| AC-7  | Every syllabus version keeps its source documents and verification records.                                                                                                   |
| AC-8  | A syllabus is VERIFIED only with at least one official university source document and a verification record. Unverified information is never presented as verified.           |
| AC-9  | No syllabus, course or DU information is entered without an official source.                                                                                                  |
| AC-10 | Names are bilingual (English required, Bangla optional until reviewed).                                                                                                       |
| AC-11 | Shared frontend and backend code contains no NU- or DU-specific assumptions.                                                                                                  |

## 3. Later modules

Authentication and student profile, courses/topics, learning materials, review workflow, question
bank, AI assistant: requirements are written when each is proposed.
