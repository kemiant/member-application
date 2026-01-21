# BAXA Member Application Review System

A Next.js application for reviewing and rating BAXA member applications, integrated with Google Sheets and restricted to a specific authorized email.

## Features

- **Secure Authentication**: Google OAuth restricted to `texasbaxassociation@gmail.com`
- **Google Sheets Integration**: Reads applications from "Form Responses 1" and stores ratings in "Ratings" tab
- **Rating System**: 0-5 scale rating with comments
- **Advanced Filtering**: Filter by path (returning/new), year, major, EID, text search, and assigned row ranges
- **Summary Dashboard**: View statistics, top-rated applicants, and returning member information
- **Purple Theme**: BAXA brand colors throughout the UI

## Setup Instructions

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sheets API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Sheets API" and enable it

### 2. Create Service Account

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in the service account details and click "Create"
4. Grant the service account "Editor" role
5. Click "Done"
6. Click on the created service account
7. Go to the "Keys" tab
8. Click "Add Key" > "Create new key" > "JSON"
9. Save the downloaded JSON file securely

### 3. Configure Google OAuth

1. In Google Cloud Console, go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client ID"
3. Configure the OAuth consent screen if prompted
4. Select "Web application" as the application type
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for development)
   - `https://your-domain.vercel.app/api/auth/callback/google` (for production)
6. Save the Client ID and Client Secret

### 4. Share Google Sheet

1. Open your Google Sheet with the "Form Responses 1" tab
2. Click the "Share" button
3. Add the service account email (found in the JSON file as `client_email`)
4. Give it "Editor" permissions
5. Copy the Spreadsheet ID from the URL:
   - URL format: `https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit`

### 5. Environment Variables

Create a `.env` file in the project root:

```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-generated-secret-here

# Google OAuth Credentials
GOOGLE_OAUTH_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=your-client-secret

# Email Restriction
ONLY_SHARED_EMAIL=texasbaxassociation@gmail.com

# Google Sheets Integration
GOOGLE_SHEETS_ID=your-spreadsheet-id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour\nPrivate\nKey\nHere\n-----END PRIVATE KEY-----\n"
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

**Important**: The `GOOGLE_PRIVATE_KEY` must include the `\n` characters for newlines. Copy it exactly from the JSON file, including quotes.

### 6. Install Dependencies

```bash
npm install
```

### 7. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000/applications](http://localhost:3000/applications) in your browser.

## Deploy to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/baxa-member-application.git
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [Vercel](https://vercel.com/)
2. Click "Import Project"
3. Import your GitHub repository
4. Add all environment variables from `.env`
   - Make sure to update `NEXTAUTH_URL` to your production domain
   - Use the same `NEXTAUTH_SECRET` for consistency
5. Deploy

### 3. Update OAuth Redirect URIs

After deployment, add your Vercel domain to the Google OAuth redirect URIs:
- `https://your-app.vercel.app/api/auth/callback/google`

## Usage

### Applications Page

**URL**: `/applications`

- **Filters**:
  - **Path**: All / Returning / New
  - **Year**: Filter by academic year
  - **Major**: Filter by primary major
  - **EID**: Search by student EID
  - **Text Search**: Search across names, emails, and essays
  - **Assigned Rows**: Enter row numbers or ranges (e.g., `12-25,40,42-45`)

- **Rating**:
  - Select a rating from 0-5
  - Add optional comments
  - Submit rating (stored with your rater name and assigned rows)

### Summary Page

**URL**: `/summary`

- **Overview Stats**: Total applications, returning/new counts, McCombs/non-McCombs, previous members
- **By Major**: Breakdown of applications by primary major
- **Top Rated**: List of highest-rated applicants (sorted by average rating)
- **Previous Members**: Returning applicants with favorite memories and re-engagement plans

## Rating Scale

- **5**: Outstanding - Exceptional fit for BAXA
- **4**: Strong - Very good candidate
- **3**: Good - Solid candidate
- **2**: Fair - Some concerns
- **1**: Weak - Significant concerns
- **0**: Not recommended

## Assigned Rows Format

Enter row numbers or ranges separated by commas:
- Single rows: `12,40,42`
- Ranges: `12-25`
- Combined: `12-25,40,42-45,50`

The system will parse this and filter applications to only show those rows.

## Google Sheets Structure

### Form Responses 1 (Required)

This tab must exist and contain the application data with these columns (detected automatically):
- Timestamp
- EID (primary key)
- First Name, Last Name
- Email
- Headshot URL
- Resume URL (with exact header: "Attach your resume.\n\n*If accepted, this will only be used for resume books to our sponsors. Your resume does not affect your application.*")
- Major columns
- School columns (for McCombs detection)
- Year
- Previously a member?
- Returning member essays
- New member essays
- Events, analytics experience, lunch preference, time commitments, etc.

### Ratings (Auto-created)

The system automatically creates this tab if it doesn't exist, with columns:
- EID
- RaterName
- Rating (0-5)
- Comment
- Timestamp
- AssignedRows

## Development Notes

- **Server-side Authentication**: All API routes check for valid session
- **Service Account Only**: Google Sheets access uses service account credentials (never exposed to client)
- **Exact Header Matching**: Resume column uses exact header string with newline characters
- **McCombs Detection**: Checks if any "school" column contains "McCombs" (case-insensitive)
- **Returning Path Detection**: Based on presence of returning member essay responses
- **Local Storage**: Rater name is stored in browser localStorage (key: `baxa:raterName`)

## Troubleshooting

### Authentication Issues

- Verify `ONLY_SHARED_EMAIL` matches the authorized Google account
- Check OAuth redirect URIs in Google Cloud Console
- Ensure `NEXTAUTH_URL` is correct for your environment

### Google Sheets Issues

- Verify service account has "Editor" access to the spreadsheet
- Check `GOOGLE_PRIVATE_KEY` has proper newline characters (`\n`)
- Ensure "Form Responses 1" tab exists and has data
- Check that column headers match expected patterns

### Vercel Deployment Issues

- Verify all environment variables are set correctly
- Check build logs for errors
- Ensure `googleapis` is in `serverComponentsExternalPackages` in `next.config.js`

## Security

- Only `texasbaxassociation@gmail.com` can sign in
- Service account credentials are server-only (never sent to client)
- All API routes require authentication
- Environment variables should never be committed to git

## License

MIT
