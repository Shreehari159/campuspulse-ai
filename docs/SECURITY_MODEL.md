# CampusPulse AI — Security, Privacy & Confidentiality Model

## 1. Multi-Tenant Defense-in-Depth
- **Strict Tenant Separation**: All queries require an authenticated `tenantId`. Data from Tenant A cannot be returned to or modified by Tenant B.
- **Tenant Context Verification**: Backend middleware extracts `tenantId` from verified JWT/session tokens, not merely from untrusted query parameters.

## 2. Granular Role-Based & Relationship-Based Access Control (RBAC + ReBAC)
- `STUDENT`: Read own academic data, goals, booked appointments, and data transparency reports. Cannot see other students' grades, risk scores, or private staff notes.
- `FACULTY`: View course rosters for sections they instruct; view attendance & grades for their enrolled students; create academic referrals. Cannot view students not enrolled in their classes or confidential counseling files.
- `ACADEMIC_ADVISOR`: View assigned advisees; create collaborative Academic Success Plans; view academic records. Cannot view confidential counseling clinical notes.
- `COUNSELLOR`: Access to designated support cases, clinical intake notes, and appointment schedules. Protected under mental health confidentiality guidelines (FERPA / HIPAA aligned).
- `INSTITUTION_ADMIN`: Access to aggregated retention metrics, department summaries, integration pipelines, and institution-wide academic configuration. De-identifies small cohorts (<5 students) to prevent re-identification.
- `SUPER_ADMIN`: SaaS platform infrastructure, tenant provisioning, subscription billing, and system uptime. Has **no** unrestricted backdoor into private student counselling session records.

## 3. Confidential Domain Boundaries
- Sensitive clinical notes and mental health disclosures are stored in segregated tables with field-level encryption boundaries and dedicated access audit logging.
- Any access to confidential notes is permanently logged with actor user ID, client IP, and purpose timestamp.

## 4. Regulatory Readiness
- **FERPA Compliance**: Student educational records are safeguarded; directory information vs confidential academic records are partitioned; student right to data transparency is natively supported.
- **GDPR / DPDP Compliance**: Data minimization, purpose limitation, right to explanation, right to export, and right to be forgotten (soft deletion with anonymization pipelines).
