/**
 * Google Apps Script for Project Manager Email Scanner
 * Deploy this in Google Apps Script editor (script.google.com)
 * 
 * Setup:
 * 1. Create a label "ProjectManager" in Gmail
 * 2. Set up a Gmail filter rule: 
 *    - from:(@client-domain.com OR from:colleague@yourcompany.com)
 *    - Subject contains: (project OR client OR feedback OR deliverable OR question OR approval OR revision OR change)
 *    → Apply label: ProjectManager
 * 3. Update CONFIG below with your API endpoint
 * 4. Run installTrigger() once to set up hourly scan
 */

const CONFIG = {
  VERCEL_ENDPOINT: 'https://theprojectmanager-five.vercel.app',
  GMAIL_LABEL: 'ProjectManager', // Gmail label to scan
  API_KEY: '8d3dc395252b8cb8fe9b5ea4e443a6b80f14349ce1c26e2f1d1d9e9a8d6a2d28', // Add as environment variable in Vercel
  BATCH_SIZE: 10, // Process 10 emails per run
  DAYS_BACK: 7, // Look back 7 days for unprocessed emails
}

/**
 * Install scheduled trigger (run once manually)
 */
function installTrigger() {
  ScriptApp.newTrigger('scanProjectEmails')
    .timeBased()
    .everyHours(1)
    .create()
  
  Logger.log('✅ Trigger installed - will scan emails every hour')
}

/**
 * Main function: Scan for project-related emails
 */
function scanProjectEmails() {
  try {
    const label = GmailApp.getUserLabelByName(CONFIG.GMAIL_LABEL)
    if (!label) {
      Logger.log('❌ Label not found: ' + CONFIG.GMAIL_LABEL)
      return
    }

    // Find unprocessed emails from last 7 days
    const query = `label:${CONFIG.GMAIL_LABEL} -label:ProjectManagerProcessed newer_than:${CONFIG.DAYS_BACK}d`
    const threads = GmailApp.search(query, 0, CONFIG.BATCH_SIZE)

    if (threads.length === 0) {
      Logger.log('✅ No new emails to process')
      return
    }

    Logger.log(`Processing ${threads.length} emails...`)

    const processedLabel = GmailApp.getUserLabelByName('ProjectManagerProcessed') ||
      GmailApp.createLabel('ProjectManagerProcessed')

    threads.forEach(thread => {
      const messages = thread.getMessages()
      const latestMessage = messages[messages.length - 1]

      const emailData = extractEmailData(latestMessage, thread)
      const success = sendToAnalysis(emailData)

      if (success) {
        // Mark as processed
        thread.addLabel(processedLabel)
        Logger.log(`✅ Processed: ${emailData.subject}`)
      } else {
        Logger.log(`⚠️ Failed: ${emailData.subject}`)
      }
    })

  } catch (error) {
    Logger.log('❌ Error: ' + error.toString())
    sendErrorNotification(error)
  }
}

/**
 * Extract email content and metadata
 */
function extractEmailData(message, thread) {
  const payload = message.getPayload()
  
  return {
    messageId: message.getId(),
    threadId: thread.getId(),
    from: message.getFrom(),
    to: message.getTo(),
    cc: message.getCc(),
    subject: message.getSubject(),
    body: getEmailBody(message),
    timestamp: message.getDate().toISOString(),
    isReply: thread.getMessageCount() > 1,
    labels: thread.getLabels().map(l => l.getName()),
  }
}

/**
 * Extract plain text body (prefer plain text over HTML)
 */
function getEmailBody(message) {
  const payload = message.getPayload()
  let body = ''

  if (payload.parts) {
    // Multi-part message
    const textPart = payload.parts.find(p => p.mimeType === 'text/plain')
    const htmlPart = payload.parts.find(p => p.mimeType === 'text/html')
    
    if (textPart) {
      body = Utilities.newBlob(Utilities.base64Decode(textPart.body.data)).getDataAsString()
    } else if (htmlPart) {
      const html = Utilities.newBlob(Utilities.base64Decode(htmlPart.body.data)).getDataAsString()
      body = stripHtml(html)
    }
  } else if (payload.body && payload.body.data) {
    // Simple message
    body = Utilities.newBlob(Utilities.base64Decode(payload.body.data)).getDataAsString()
  }

  return body.substring(0, 5000) // Limit to first 5000 chars
}

/**
 * Strip HTML tags from email
 */
function stripHtml(html) {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim()
}

/**
 * Send email to Vercel API for analysis
 */
function sendToAnalysis(emailData) {
  try {
    const payload = {
      email: emailData,
      timestamp: new Date().toISOString(),
    }

    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      headers: {
        'Authorization': 'Bearer ' + CONFIG.API_KEY,
        'User-Agent': 'GoogleAppsScript/1.0',
      },
      muteHttpExceptions: true,
    }

    const response = UrlFetchApp.fetch(CONFIG.VERCEL_ENDPOINT, options)
    const responseCode = response.getResponseCode()

    if (responseCode === 200 || responseCode === 201) {
      return true
    } else {
      Logger.log(`API Error (${responseCode}): ${response.getContentText()}`)
      return false
    }

  } catch (error) {
    Logger.log('Network error: ' + error.toString())
    return false
  }
}

/**
 * Send error notification email
 */
function sendErrorNotification(error) {
  // Optional: Send notification to yourself on errors
  const userEmail = Session.getActiveUser().getEmail()
  GmailApp.sendEmail(
    userEmail,
    '⚠️ ProjectManager Email Scanner Error',
    'Error: ' + error.toString() + '\n\nCheck the Apps Script logs for details.',
    { replyTo: userEmail }
  )
}

/**
 * Test function - run manually to test
 */
function testScan() {
  scanProjectEmails()
}
