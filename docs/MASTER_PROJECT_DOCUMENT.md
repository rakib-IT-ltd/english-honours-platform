# Master Project Document

> **Status:** foundation summary only. Extended as each phase is approved. Authoritative rules: [`CLAUDE.md`](../CLAUDE.md).

## Vision

A bilingual (English/Bangla) academic ecosystem for English Honours students in Bangladesh, targeting
National University (NU) first, with later expansion to other universities, sessions and syllabus
versions.

## Components

Android app (Flutter) · responsive website (Next.js) · administrative area · central API (NestJS) ·
PostgreSQL via Prisma · AI assistant with retrieval-augmented generation (later phase).

## Repository map

See the folder tree in the root [`README.md`](../README.md). Academic source material lives in
[`academic-content/`](../academic-content), never hardcoded in application code.

## Guiding rules

Academic accuracy first; never invent syllabus information; one module at a time; no fake academic
content in production; secrets only through environment variables.
