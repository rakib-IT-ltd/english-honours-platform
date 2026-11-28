# ADR 0009 - Roles, permissions and how the approval rules are enforced

Status: **approved in principle by the owner on 2026-11-27; not implemented** (Phase 3 builds it).

## Context

Today every user is a STUDENT and there is no authorization beyond "signed in" (`AuthGuard`).
The owner requires that a professor can never publish, even by calling the API by hand, and that
students can never reach unpublished or administrative data.

## Roles

| Role                   | Can                                                                                                                                                                                                                                                                                    |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **OWNER**              | Everything: edit any content, manage structure, invite/revoke professors and assign what they may edit, review, approve, reject, publish, withdraw, restore, archive.                                                                                                                  |
| **EDITOR** (professor) | Read and edit drafts of **assigned** materials only (per course or per Academic Text), in English and/or Bangla; save drafts; submit for approval; read feedback; reopen and revise rejected submissions. **Never** approve, publish, withdraw, restore, archive, or change structure. |
| **STUDENT**            | Read PUBLISHED content. No administrative or unpublished data.                                                                                                                                                                                                                         |

## Rules

1. **Roles live in the database** (`User.role`, `StaffGrant`, `StaffScope`), not in Firebase claims.
   A change applies on the next request; `User.disabledAt` blocks an account at once.
2. **Deny by default.** Admin routes live under `/api/v1/admin/*`. A global guard refuses any admin
   route that declares no allowed roles. Public routes never share a controller with admin routes.
3. **Scope check on every unit.** An editor assigned to course A receives a refusal for course B,
   for reading as well as writing.
4. **The server owns the state machine.** Clients send an action ("submit", "approve"), never a status.
   There is no endpoint that accepts a status value. Allowed transitions per language revision:
   `DRAFT -> SUBMITTED -> IN_REVIEW -> APPROVED -> PUBLISHED`; `IN_REVIEW -> REJECTED`;
   `REJECTED -> DRAFT` (reopen, by its author or the Owner); `PUBLISHED -> WITHDRAWN` and
   restore (Owner). Approve, publish, reject, withdraw and restore require OWNER, checked in the
   controller (role guard) **and again** in the service.
5. **Approve & Publish** (default) does both steps in one transaction and records both events;
   **Approve Only** records approval and leaves the revision APPROVED for later publication.
6. **Languages never interfere** (ADR 0008, decision 2): a transition reads and writes only the
   revision of its own (unit, language).
7. **Submitted text is frozen.** After SUBMITTED the text cannot change until reject/reopen, so the
   Owner reviews exactly what was submitted. Saves send the revision's `updatedAt`; a mismatch
   answers 409 instead of overwriting a colleague's work.
8. **Audit.** Every transition and every staff/permission change writes an append-only event (who,
   when, from, to, comment). The Owner's decision always records the Owner's user id.
9. **Inviting staff.** The Owner invites by email; the grant attaches only when that email signs in
   with a **verified** address (`emailVerified` will be added to the token identity). The first Owner is
   created by a command run by the maintainer (`db:make-owner`), never by a default password or a
   hidden URL.
10. **Hardening.** Add rate limiting and `helmet`; keep exact-origin CORS; Swagger stays off in
    production; no secrets in the repository.

## Tests required when this is built

- A permission matrix: every admin route x {anonymous, student, editor in scope, editor out of scope,
  disabled editor, owner} with the expected result.
- A professor sending hand-made approve/publish/withdraw/restore requests gets 403.
- Every allowed and every refused transition; the independence of English and Bangla for each.
- Students receive no unpublished text from any public endpoint, at every workflow stage.

## Consequences

- A little more work per request (role/scope lookups); negligible at this scale.
- Role changes need no redeploy and no new login.
