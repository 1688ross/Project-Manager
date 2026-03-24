# Email Scanner Setup Guide

This system automatically scans emails for project-related content and creates milestone history entries.

## Architecture

```
Gmail (Google Workspace)
    ↓
Google Apps Script (free, runs hourly)
    ↓
Your Vercel API (/api/analyze-email)
    ↓
Claude API (interprets email)
    ↓
Database (MilestoneHistory entries)
```

## Setup Instructions

### 1. Set Up Gmail Labels and Filters

In Gmail:

1. Create a label: **ProjectManager**
2. Create a filter with these settings:
   - **From**: `@client-domain.com OR emails from colleagues`
   - **Subject contains**: `project` OR `client` OR `feedback` OR `deliverable` OR `question` OR `approval` OR `revision` OR `change`
   - **Apply label**: ProjectManager
   - **Skip Inbox**: Yes (optional, to keep inbox clean)

### 2. Deploy Google Apps Script

1. Go to [script.google.com](https://script.google.com)
2. Create a new project
3. Copy the contents of `docs/EmailScanner.gs` into the editor
4. Update the CONFIG:
   ```javascript
   const CONFIG = {
     VERCEL_ENDPOINT: 'https://your-deployed-app.vercel.app/api/analyze-email',
     GMAIL_LABEL: 'ProjectManager',
     API_KEY: process.env.EMAIL_SCANNER_KEY, // We'll set this next
     BATCH_SIZE: 10,
     DAYS_BACK: 7,
   }
   ```
5. Save the project
6. Run `installTrigger()` once (in the editor, select it from the dropdown and click Run)
   - This sets up hourly email scanning

### 3. Set Environment Variables

**In Vercel:**

1. Go to your Vercel project settings
2. Add environment variable:
   - `EMAIL_SCANNER_KEY`: Choose a secure random string (save it for step 2.4)
   - `ANTHROPIC_API_KEY`: Your Claude API key

**In Google Apps Script:**

1. In editor, go to Project Settings (gear icon)
2. Add script properties:
   - `EMAIL_SCANNER_KEY`: Same value as Vercel

Or update the CONFIG in the script with your actual API key.

### 4. Install Dependencies

```bash
npm install @anthropic-ai/sdk
```

### 5. Test It

**Manual test in Apps Script:**

1. Open the script editor
2. Select `testScan` function
3. Click Run
4. Check logs (Ctrl+Enter) for results
5. Watch server logs in Vercel for API calls

**Production:**

Once running, the script will automatically:
- Scan Gmail every hour
- Find emails with ProjectManager label
- Send them to your API
- Claude analyzes them
- MilestoneHistory entries created automatically

## Email Types Handled

| Type | Trigger | Result |
|------|---------|--------|
| **APPROVED** | "Looks good", "approved", "sign off", thumbs up emoji | Creates APPROVED milestone marker |
| **FEEDBACK** | "Change", "revision", "needs", "update", "modify" | Creates FEEDBACK milestone + stores feedback notes |
| **QUESTION** | "Question?", "clarify", "why", "not sure", "need to understand" | Logged for follow-up |
| **NEW_PROJECT** | "New project", "new work", "can you help with", "we need" | Flagged for project creation |
| **SUBMITTED** | "Sending you", "here's", "attached", "review this" | Creates SUBMITTED milestone |
| **INFO** | General updates | Logged for reference |

## Cost Estimate

- **Google Apps Script**: Free
- **Vercel**: Free tier (up to 100 invocations/month)
- **Claude API**: ~$0.01-0.02 per email analyzed
  - 10 emails/day = ~$3/month
  - 100 emails/day = ~$30/month

## Monitoring

**Check email processing status:**

1. Open Google Apps Script
2. Click "Executions" tab to see logs
3. Check "Recent runs" for errors

**Check Claude analysis quality:**

1. Go to Task detail page → Timeline section
2. Click any milestone marker to see extracted details
3. If extraction is wrong, notes show what Claude interpreted

## Troubleshooting

### Script doesn't run

- Check Gmail label exists: ProjectManager
- Run `installTrigger()` again
- Check script has Gmail permission(s)

### API returns 401

- Verify API_KEY matches between script and Vercel env variables
- Check Authorization header: `Bearer {API_KEY}`

### Emails not being created

- Check email has ProjectManager label
- Verify Gmail filter is working (manually apply label to a test email)
- Check Vercel logs for API errors

### Claude misinterpreting emails

- Add more details to the prompt in `route.ts`
- Check email body is plain text (HTML emails may parse poorly)
- Manually edit the milestone notes if needed

## Manual Email Processing

If you want to manually process a specific email:

1. In Apps Script, modify `scanProjectEmails()` query to find specific email
2. Or open the email → apply ProjectManager label → wait for next hourly scan

## Disabling/Pausing

To temporarily stop scanning:

1. Open Google Apps Script
2. Click "Triggers" (clock icon on left)
3. Find the "scanProjectEmails" trigger
4. Click ⋮ menu → Delete trigger

To restart: Run `installTrigger()` again

## Future Enhancements

- [ ] Link emails to specific projects/clients in database  
- [ ] UI for reviewing low-confidence email interpretations
- [ ] Manual email upload form in app
- [ ] Slack notifications for high-priority items detected
- [ ] Integrate Outlook/Microsoft 365 emails
- [ ] Extract attachments and store in Assets
