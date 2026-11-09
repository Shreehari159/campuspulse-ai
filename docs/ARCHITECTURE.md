# CampusPulse AI — System Architecture Specification

## 1. Architectural Overview
CampusPulse AI is engineered as a modular full-stack SaaS architecture.
- **Frontend Layer**: React 19 SPA running with Vite, TypeScript, Tailwind CSS, Lucide icons, and Motion.
- **Backend & API Layer**: Express with TypeScript (`server.ts`), modular service domain handlers, strict multi-tenant context extraction, role-based and relationship-based access control (RBAC & ReBAC), and RESTful endpoints under `/api/v1/*`.
- **AI / Decision Support Layer**: Server-side `@google/genai` (using `gemini-3.8-flash`) combined with an explainable rule-based & ML feature attribution scoring engine.
- **Data & Storage Layer**: Normalized multi-tenant relational schemas with tenant isolation (`tenantId` partitioned), audit event streams, and separate clinical data domains with confidential access boundaries.

## 2. Multi-Tenant Isolation Strategy
- Every query, mutation, and entity resolution checks `tenantId` extracted from authenticated session headers (`x-tenant-id` / bearer claims).
- Super Admins manage tenant infrastructure, billing, and system metrics without default access to confidential clinical or student-sensitive counseling notes.
- Institution-specific configurations (grading scales, term calendars, attendance policies) are isolated per tenant.

## 3. Confidential Domain Boundaries
- Regular academic data (courses, attendance, grades) are accessible to assigned faculty, advisors, and students.
- Clinical & Mental Health Counseling records (intake notes, sensitive disclosures, diagnosis codes) are strictly firewalled in a separate domain accessible ONLY to assigned licensed counsellors, never shown to faculty or institutional billing staff.

## 4. End-to-End Workflow Flow
1. **Detection**: Attendance drop or missing assignment generates an early warning signal.
2. **Review**: Faculty or Advisor reviews the signal with SHAP factor explanation.
3. **Outreach & Referral**: Closed-loop referral is dispatched to tutoring or academic advising.
4. **Intervention**: Collaborative Academic Success Plan is created with clear ownership and target dates.
5. **Outcome**: Milestone completion and grade recovery tracked over time.
