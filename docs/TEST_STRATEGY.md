# CampusPulse AI — Quality Assurance & Testing Strategy

## 1. Test Pillars
1. **Tenant Isolation Testing**: Validates that Tenant A cannot read, query, or mutate Tenant B records even if IDs are guessed or injected.
2. **Confidentiality Boundary Testing**: Validates that Faculty and Institutional Administrators cannot retrieve confidential mental health case notes or counseling records under any parameter combination.
3. **RBAC & ReBAC Testing**: Validates permission limits across Student, Faculty, Advisor, Counsellor, Institution Admin, and Super Admin.
4. **Data Ingestion Validation Testing**: Tests CSV parsing with malformed rows, missing mandatory headers, duplicate student IDs, and invalid grade scales.
5. **Human Override Audit Testing**: Asserts that risk overrides generate immutable audit records with required rationale strings.
6. **WCAG 2.2 AA Accessibility Testing**: Contrast ratio verification, keyboard tab index navigation, screen reader ARIA landmarks, focus-visible outlines.
