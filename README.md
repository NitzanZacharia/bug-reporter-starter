# Bug Reporter - Take-Home Assignment

## Quick Start

```bash
# Install dependencies
npm install

# Run both client and server
npm run dev
```

- **Client:** http://localhost:5173
- **Server:** http://localhost:4000


## Performance Improvement

**What the issue was:** The `validateField` function on the Report Page contained an artificial loop performing heavy array operations on 10,000 elements every time a character was typed by the user. 

**How I detected/validated it:** During initial manual QA and exploration of the app (logging in, reporting bugs, etc.), I noticed significant input lag while typing in the report form. I then profiled and validated this bottleneck using the Chrome DevTools Performance tab.

**The Fix & Impact:**
I removed the artificial loop from `validateField`, retaining only the necessary string length validation logic.

* **Before:** INP was ~4,864 ms, causing a complete UI freeze during typing. Largest Contentful Paint (LCP) was 3.76 s.
* **After:** INP is now < 50ms (negligible), LCP improved to 0.18 s.

## Added Features & Improvements:

* **Admin Triage View:** The Admin reports tab automatically prioritizes 'Bugs' (assuming they are the most urgent) and sorts oldest-to-newest (FIFO) to prevent ticket starving. 
* **Admin Status Filter:** The Admin reports tab includes a status filter dropdown so admins can easily organize reports by their current state. The default filter is set to 'NEW' to ensure unknown problems are addressed first. 
* **CSV Export:** Admins can instantly export the currently filtered table view to a formatted CSV for external data analysis.
* **User 'My Reports' Dashboard:** Standard users have a read-only "My Reports" view to track the status and history of their submitted tickets.
* **Contact Us Footer:** Added a footer with an email address for help inquiries.
* **Autofilled Email:** The report submission form automatically fills in the logged-in user's email to eliminate friction and encourage users to submit reports.
* **Native Screen Capture (Bonus):** Integrated the browser's `mediaDevices` API, allowing users to capture and attach a screenshot of their bug with a single click, eliminating manual file uploads.

## Project Structure

```
bug-reporter-starter/
├── client/          # React + TypeScript (Vite)
│   └── src/
│       ├── api/     # API client
│       ├── pages/   # Page components
│       └── types/   # TypeScript types
└── server/          # Express + TypeScript
    ├── src/         # Server code
    └── uploads/     # Static uploads folder
```

## API Endpoints

| Method | Endpoint                   | Description                                             |
|--------|----------------------------|---------------------------------------------------------|
| GET    | `/api/reports`             | Get all reports for Admin, or filters by email for user |
| POST   | `/api/reports`             | Create a new report                                     |
| POST   | `/api/reports/:id/approve` | Updates report status to Approved and sets timestamp    |
| POST   | `/api/reports/:id/risolve` | Updates report status to Risolved                       |
| GET    | `/api/health`              | Health check                                            |

## Data Model

```typescript
interface Report {
  id: string;
  issueType: string;
  description: string;
  contactName: string;
  contactEmail: string;
  status: 'NEW' | 'APPROVED' | 'RESOLVED';
  createdAt: number;
  approvedAt?: number;
  attachmentUrl: string;
}
```

## Environment Variables

Client `.env` (already configured):
```
VITE_API_BASE_URL=http://localhost:4000
```

