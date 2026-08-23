# Development Notes

## Mock Data Reset Utility

Since the mock services now persist state to `localStorage` to allow seamless multi-role testing, any changes you make in the UI (creating patients, adding case sheets, booking appointments) will persist across page reloads.

To reset the mock data to its original seeded state:
1. Open the browser's Developer Tools Console (F12).
2. Run the following command:
   ```javascript
   resetMockData()
   ```
3. The page will clear its mock store and refresh automatically.

## Seeded Mock Patients Reference

Use this table to quickly find a patient that matches the test scenario you want to verify. Remember that doctors can only see patients assigned to them (BR-02), so you will need to switch between doctor accounts (`doc1`, `doc2`, `doc3`) to view them all from the Doctor perspective.

| ID | Patient Name | Assigned To | Scenario Focus |
|----|--------------|-------------|----------------|
| **PAT001** | Priya Menon | doc1 | **Fully completed Case Sheet** + 3 Treatment Protocol entries. |
| **PAT002** | Arun Kumar | doc1 | **NO Case Sheet yet** (use to test intake flow). |
| **PAT003** | Kavya Krishnan | doc2 | **Multiple Consultations** + at least one addendum. |
| **PAT004** | Suresh Ravi | doc2 | **Zero consultations** (empty timeline state). |
| **PAT005** | Meena Raj | doc3 | **Mix of appointments** (Scheduled, Completed, Cancelled). |
| **PAT006** | Vignesh Kumar | doc3 | **Zero appointments** (empty state). |
| **PAT007** | Neha Sharma | doc1 | Status "**Completed Treatment**", Patient Documents uploaded. |
| **PAT008** | Rahul Das | doc2 | Status "**Inactive**", Patient Documents uploaded. |

### Mock Credentials
- **Admin**: `admin@aimnaturecure.dev` / `mock-admin-pass`
- **Doctor (doc1)**: `doctor@aimnaturecure.dev` / `mock-doc-pass`
- **Other Doctors**: You can use the mock credentials above and adjust the mock authentication logic if you wish to strictly test login for `doc2` and `doc3`, but the UI inherently enforces BR-02 filtering based on the active session's `docId`.
