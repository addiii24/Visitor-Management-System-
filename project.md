# Build a Complete Corporate Visitor Management System (VMS)

Act as a senior full-stack developer, UI/UX designer, and software architect. Build a professional, functional, responsive web application for an industrial company's Visitor Management System (VMS).

This application will initially be demonstrated to company management for project approval. Therefore, the UI must look production-quality, and the complete visitor workflow must actually work in the browser.

**Do not build just a static UI or landing page.** Implement working forms, role-based dashboards, approval actions, visitor records, gate passes, check-in/check-out, reports, and persistent local data.

## 1. Project Requirements

Project name: Visitor Management System (VMS)

Initial delivery: Web application prototype.

Frontend: React.js + Vite + TypeScript.

Styling: Tailwind CSS.

Icons: Lucide React.

Charts: Recharts, where useful.

Storage: Browser local storage and IndexedDB if needed.

Backend: Not required in this prototype.

Database server: Do not add one yet.

Deployment target: Vercel or Netlify.

The architecture must allow a future backend and database to be integrated without rewriting the entire application.

Use reusable components, modular code, clean folder structure, and centralized business logic.

## 2. Default Company Configuration

Create a centralized company configuration file so company details can be changed from one place.

Use these initial demo values:

- Company Name: ABC Manufacturing Industries Pvt. Ltd.
- Company Address: Industrial Area, Jodhpur, Rajasthan, India
- Company Type: Manufacturing / Industrial Plant
- Plant Name: Main Manufacturing Plant
- Company Logo: Display a professional placeholder logo until a real logo is provided.
- Time Zone: Asia/Kolkata
- Date Format: DD MMM YYYY
- Time Format: 12-hour format with AM/PM
- Default Currency: INR
- Gate Name: Main Security Gate
- Application Name: VMS — Visitor Management System

Display the company name, logo, plant name, and address on the login page, dashboards, printable gate passes, and report headers.

Do not repeat company information as hardcoded strings across multiple components. Read these values from the centralized configuration.

Add a Company Settings section for editing company name, address, plant name, gate name, and logo in the demo. Persist editable settings locally.

## 3. Role-Based Demo Login

Create three separate demo accounts with a professional login screen.

### Account 1: Security Guard

- Username: guard
- Password: Guard@123
- Role: Security Guard
- Dashboard: Security Gate Dashboard

Permissions:
- Register visitors.
- Upload visitor photographs.
- View visitor requests and their statuses.
- Check approval status.
- View and print valid gate passes.
- Record actual visitor check-in and check-out.
- Search visitor records.

Restrictions:
- Cannot approve or reject requests.
- Cannot change company settings.
- Cannot manage user accounts.

### Account 2: Plant Head

- Username: planthead
- Password: Plant@123
- Role: Plant Head
- Dashboard: Approval Dashboard

Permissions:
- View incoming visitor requests.
- View complete visitor details and photographs.
- Approve visitor requests.
- Reject visitor requests with a reason.
- Put requests on hold with remarks.
- Review previous decisions and approval timestamps.
- View pending and processed requests.

Restrictions:
- Cannot modify company configuration or create administrator accounts.
- Cannot change a rejected request into an approved request without an explicitly recorded re-review action.

### Account 3: HR / Administrator

- Username: admin
- Password: Admin@123
- Role: HR / Administrator
- Dashboard: Admin Dashboard

Permissions:
- View all visitor records.
- View daily, weekly, and monthly statistics.
- Search and filter visitor records.
- View approval history and audit logs.
- Export visitor reports to CSV.
- Print reports.
- Manage demo company settings.
- View entry and exit records.
- Reset demo data after confirmation.
- View user roles and demo account information.

Implement role-based route protection and permission checks for all actions.

Show clear demo-mode information on the login page. These credentials are for local demonstration only. Do not represent frontend-only authentication as production-secure authentication.

## 4. Login Page and Application Layout

Build a modern corporate login screen.

Include:
- Company logo.
- Company name and address.
- VMS application title.
- Username field.
- Password field with show/hide control.
- Login button.
- Validation and error messages.
- Demo credentials section or expandable demo-account helper.
- Responsive design for desktop, tablet, and mobile.

After login, display a dashboard appropriate to the user's role.

Use a consistent application layout with:
- Left sidebar navigation.
- Top navigation bar.
- Current user's name and role.
- Company and plant name.
- Notifications panel.
- Profile menu.
- Logout button.
- Responsive sidebar for smaller screens.

Keep the design professional, clean, and suitable for presentation to industrial management.

Use navy blue, white, slate grey, and restrained green/amber/red status colors.

Avoid excessive gradients, unnecessary animations, and flashy consumer-app styling.

## 5. Security Guard Dashboard

Create a dedicated dashboard for the security guard.

Dashboard summary cards:
- Visitors Today.
- Pending Approvals.
- Approved Visitors.
- Visitors Currently Inside.

Include:
- Register New Visitor button.
- Recent visitor requests.
- Visitor status indicators.
- Search by visitor name, token, or mobile number.
- Quick actions for checking approval and recording entry/exit.

Create a complete visitor registration form with these fields:

1. Visitor full name — required.
2. Visitor photograph — optional for the initial demo, with preview.
3. Mobile number — required, with basic validation.
4. Company / organization name — required.
5. Full address — required.
6. Person to meet — required.
7. Department — Plant Head, HR, PPC, Purchase, Production, Maintenance, Finance, Other.
8. Visit purpose — required.
9. Vehicle number — optional.
10. Number of accompanying visitors — default 0.
11. Visitor ID type and last few characters — optional.
12. Expected visit date — default to today.
13. Expected visit time — default to current time.

Include a notes field for additional information.

On submission:
- Validate all required fields.
- Generate a unique visitor token.
- Save the visitor record locally.
- Set the initial approval status to Pending.
- Record registration time and registering guard.
- Add an audit log entry.
- Show a success notification.
- Display the newly generated token.
- Make the request visible in the Plant Head dashboard.

Token format: VIS-YYYY-00001, with sequential numbering that does not collide with existing records.

Prevent accidental duplicate submissions.

## 6. Plant Head Approval Dashboard

Create an approval dashboard with summary cards:
- Pending Requests.
- Approved Today.
- Rejected Today.
- Requests On Hold.

Create tabs or filters:
- All Requests.
- Pending.
- Approved.
- Rejected.
- On Hold.

Each request must show:
- Visitor photograph or avatar.
- Visitor name.
- Token number.
- Company.
- Department/person to meet.
- Visit purpose.
- Registration timestamp.
- Registering guard.
- Current status.

Opening a request should display a detailed visitor information panel.

Implement these functional actions:

### Approve
- Allow approval of a pending request.
- Record approver identity, timestamp, and optional remarks.
- Update the visitor's status to Approved.
- Make the digital gate pass available to the guard.

### Reject
- Require a rejection reason.
- Record the decision and timestamp.
- Update the status to Rejected.
- Prevent gate-pass issuance and entry.

### Hold
- Allow the Plant Head to place a request on hold with remarks.
- Record the action and timestamp.
- Keep the request unavailable for entry until an authorized approval is recorded.

Display clear success/error feedback after every action.

All dashboards must show the same locally stored visitor status. Changes should appear immediately without requiring a manual page refresh.

Do not send fake real-world notifications. Use an in-app notification center and dashboard indicators for the prototype.

## 7. Digital Gate Pass

Generate a professional, printable digital gate pass after approval.

The gate pass must include:
- Company logo and name.
- Company and plant address.
- Gate name.
- Unique visitor token.
- Visitor name and photograph, if available.
- Visitor company.
- Person to meet.
- Department.
- Purpose of visit.
- Vehicle number, if provided.
- Approval status.
- Approver's name.
- Approval timestamp.
- Issue timestamp.
- Validity date and time.
- QR code.
- A clear entry/check-in status.

Generate a real QR code using a browser-compatible QR library.

The QR code should contain a minimal visitor token or pass identifier, not the visitor's full personal information.

Create a dedicated gate-pass view and print stylesheet.

The Print button must open the browser print dialog. The output should be suitable for saving as PDF.

Do not claim that a pass has been emailed, downloaded, or printed unless that action actually occurs.

Only approved, active, unexpired passes should be eligible for entry.

A QR code is an identifier for this prototype, not proof of secure authorization by itself. Validate the corresponding pass record and its status before allowing check-in.

## 8. Entry and Exit Management

Implement actual check-in and check-out functionality.

Rules:
- Only an approved visitor with a valid pass can check in.
- A visitor cannot check in twice without checking out.
- A visitor cannot check out before checking in.
- Record actual entry and exit timestamps.
- Record which guard performed the action.
- Update the visitor's current status.
- Update the Visitors Currently Inside dashboard count.
- Add an audit log entry for every check-in and check-out.
- Prevent entry if the pass is expired, rejected, on hold, or already checked out.

Display the visitor's token, name, approved status, and pass validity before confirming check-in.

Provide a simple token-based lookup interface that can later be extended with a camera-based QR scanner.

Do not require a physical QR scanner for the initial demo.

## 9. HR / Administrator Dashboard

Create a comprehensive admin dashboard.

Summary cards:
- Total Visitors Today.
- Pending Requests.
- Approved Visitors Today.
- Rejected Requests Today.
- Visitors Currently Inside.
- Completed Visits Today.

Include a visitor trend chart using realistic demo data.

Include recent visitor activity and approval statistics.

Provide visitor history with:
- Search.
- Date-range filtering.
- Status filtering.
- Department filtering.
- Visitor company filtering.
- Sorting by registration time.
- Pagination or an appropriate scalable list.

Display these columns:
- Token.
- Visitor Name.
- Company.
- Person to Meet.
- Department.
- Registration Time.
- Approval Status.
- Entry Time.
- Exit Time.
- Approved By.

Add a CSV export feature that exports the filtered visitor records.

Use proper CSV escaping for commas, quotation marks, and line breaks.

The exported report should include company name, report generation time, and relevant visitor details.

Add a printable report view.

## 10. Audit Logs

Create an audit trail for important actions:
- Visitor registration.
- Approval.
- Rejection.
- Hold.
- Re-review or status changes.
- Gate-pass issuance.
- Check-in.
- Check-out.
- Company setting changes.
- Demo-data reset.

Each log record should contain:
- Action.
- Visitor token, where applicable.
- User and role.
- Timestamp.
- Relevant details.

Display the logs in a searchable, filterable Admin Audit Log screen.

In the prototype, audit logs are browser-local records and can be modified by someone with sufficient browser access. Do not present them as tamper-proof or production-grade audit records.

## 11. Local Data Architecture

Do not connect a server database yet.

Create a centralized storage abstraction with methods such as:
- getVisitors()
- getVisitorById()
- createVisitor()
- updateVisitor()
- getUsers()
- getAuditLogs()
- createAuditLog()
- getCompanySettings()
- saveCompanySettings()
- exportVisitorRecords()

Keep storage logic separate from React components.

Use localStorage for small settings and demo session data. Use IndexedDB if necessary for visitor photographs or larger collections.

Use TypeScript interfaces for:
- User.
- Visitor.
- ApprovalRecord.
- GatePass.
- VisitorLog.
- AuditLog.
- CompanySettings.
- Notification.

Store timestamps in ISO 8601 format and display them in the Asia/Kolkata timezone.

Persist changes so records survive page refreshes and browser restarts.

Handle missing, invalid, or outdated local data gracefully.

Include sample demo records, but never overwrite existing user-created records automatically.

Create a clearly labeled Reset Demo Data feature with a confirmation dialog.

Important: browser-local storage is device- and browser-specific. Do not claim that records are synchronized across separate devices or users. Do not put sensitive real visitor data into the prototype.

## 12. Deployment and Future Migration

Build the application so it runs locally and can be deployed as a static frontend on Vercel or Netlify.

Requirements:
- Use relative asset paths and browser-compatible APIs.
- Configure SPA fallback/routing appropriately for the chosen deployment platform.
- Ensure direct navigation to application routes works.
- Add an environment example file only if required.
- Do not hardcode localhost URLs.
- Do not require a backend server to run the initial demo.
- Avoid server-only Node.js modules in browser code.
- Ensure images, icons, QR codes, and charts work after deployment.
- Use a production build command and verify it completes successfully.
- Resolve TypeScript errors and build warnings that indicate real issues.
- Provide clear setup and deployment instructions in README.md.

Create a storage interface that can later be implemented using REST APIs and a real database without changing the UI components significantly.

The future production version will require server-side authentication, authorization, database persistence, secure notifications, and centralized audit logs.

Do not expose production secrets or real credentials in frontend code.

## 13. Responsive Design and Accessibility

The application must work on:
- Desktop computers.
- Laptops.
- Tablets.
- Mobile browsers.

Use responsive tables or mobile-friendly record cards.

Ensure forms have labels, buttons have clear text, keyboard navigation works, and validation messages are understandable.

Include:
- Loading states where appropriate.
- Empty states.
- Error states.
- Confirmation dialogs for destructive actions.
- Success notifications.
- A consistent status badge system.

Use the following status labels consistently:
- Pending.
- Approved.
- Rejected.
- On Hold.
- Checked In.
- Checked Out.
- Expired.

Keep approval status separate from physical visit status.

## 14. Sample Demo Data

Preload several fictional records, including:
- An approved visitor who can be checked in.
- A pending visitor.
- A rejected visitor.
- A visitor on hold.
- A completed visit with entry and exit timestamps.

Use clearly fictional names and sample contact information.

Ensure dashboard totals and reports are derived from the actual stored records, not hardcoded numbers.

Allow the demo presenter to demonstrate the entire workflow without manually editing browser storage.

## 15. Acceptance Criteria

The project is considered complete only when all of the following work:

1. All three demo accounts can log in and reach their correct dashboards.
2. Role restrictions prevent unauthorized UI actions and route access.
3. A guard can register a new visitor.
4. The visitor receives a unique token and appears as Pending.
5. The Plant Head can approve, reject, or hold the request.
6. The status updates across all dashboards immediately.
7. An approved visitor receives a printable QR gate pass.
8. Rejected, held, and expired visitors cannot check in.
9. A guard can successfully check in and check out an eligible visitor.
10. Entry and exit timestamps persist after a page refresh.
11. Admin reports show accurate counts derived from stored data.
12. CSV export produces a valid file.
13. Audit logs record important actions.
14. Company settings persist locally.
15. The application works with realistic sample data.
16. There are no dead buttons, fake forms, or nonfunctional navigation items.
17. The production build completes successfully.
18. The deployed application works through its public URL, including direct route access and page refresh.
19. No external database or backend is required for the initial prototype.
20. The README explains setup, demo credentials, local-storage limitations, build, and deployment.

## 16. Execution Instructions

Start by inspecting the existing workspace. If a project already exists, preserve useful existing work and modify it rather than blindly replacing everything.

If the workspace is empty, initialize the React + Vite + TypeScript project and install only the required dependencies.

Implement the application in logical stages:
1. Project setup and company configuration.
2. Shared layout and demo authentication.
3. Local storage abstraction and sample data.
4. Guard dashboard and visitor registration.
5. Plant Head approval workflow.
6. Gate pass, QR code, check-in, and check-out.
7. Admin dashboard, reports, export, and audit logs.
8. Responsive styling and error handling.
9. Production build and deployment configuration.
10. README and final verification.

Do not stop after creating a plan or a visual mockup. Implement the working project, run the application, test the main workflows, fix errors, and report what has actually been completed.

If a feature cannot be implemented or verified, clearly state the limitation instead of pretending it works.

At the end, provide:
- Project folder structure.
- Installation and run commands.
- Demo login credentials.
- Production build command.
- Deployment steps.
- A list of tested workflows.
- Any remaining limitations.

Prioritize a reliable, polished, fully functional demonstration over unnecessary complexity.