/**
 * WorkScanner — Scans ALL new emails + Google Calendar events
 * and sends them to Claude to decide what's project-relevant.
 *
 * No Gmail labels or filters needed. Claude decides what matters.
 *
 * Setup:
 * 1. Update CONFIG below with your Vercel URL and API key
 * 2. Run installTrigger() once to set up hourly scanning
 * 3. (Optional) Run testScan() to test immediately
 */

var CONFIG = {
  VERCEL_ENDPOINT: 'https://theprojectmanager-five.vercel.app/api/analyze-email',
  API_KEY: '8d3dc395252b8cb8fe9b5ea4e443a6b80f14349ce1c26e2f1d1d9e9a8d6a2d28',
  BATCH_SIZE: 20,
  HOURS_BACK: 2,
  SKIP_CATEGORIES: ['SPAM', 'TRASH'],
  SKIP_SENDERS: ['noreply@', 'no-reply@', 'mailer-daemon@', 'notifications@github.com'],
  CALENDAR_DAYS_AHEAD: 7,
}

/* ── Trigger Setup ── */

function installTrigger() {
  // Remove old triggers first
  var triggers = ScriptApp.getProjectTriggers()
  for (var i = 0; i < triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i])
  }

  ScriptApp.newTrigger('runWorkScanner')
    .timeBased()
    .everyHours(1)
    .create()

  Logger.log('Trigger installed — scans every hour')
}

/* ── Main Entry Point ── */

function runWorkScanner() {
  Logger.log('=== WorkScanner started ===')
  scanEmails()
  scanCalendar()
  Logger.log('=== WorkScanner finished ===')
}

/* ══════════════════════════════════════
   EMAIL SCANNING — scans ALL new mail
   ══════════════════════════════════════ */

function scanEmails() {
  try {
    var processedLabel = GmailApp.getUserLabelByName('WorkScannerProcessed')
    if (!processedLabel) {
      processedLabel = GmailApp.createLabel('WorkScannerProcessed')
    }

    // Search all emails from last N hours, excluding already-processed
    var query = 'newer_than:' + CONFIG.HOURS_BACK + 'h -label:WorkScannerProcessed -in:spam -in:trash'
    var threads = GmailApp.search(query, 0, CONFIG.BATCH_SIZE)

    if (threads.length === 0) {
      Logger.log('No new emails')
      return
    }

    Logger.log('Found ' + threads.length + ' new email threads')

    for (var i = 0; i < threads.length; i++) {
      var thread = threads[i]
      var messages = thread.getMessages()
      var latest = messages[messages.length - 1]
      var from = latest.getFrom().toLowerCase()

      // Skip automated/notification senders
      var skip = false
      for (var s = 0; s < CONFIG.SKIP_SENDERS.length; s++) {
        if (from.indexOf(CONFIG.SKIP_SENDERS[s]) !== -1) {
          skip = true
          break
        }
      }
      if (skip) {
        thread.addLabel(processedLabel)
        continue
      }

      var emailData = {
        source: 'email',
        messageId: latest.getId(),
        threadId: thread.getId(),
        from: latest.getFrom(),
        to: latest.getTo(),
        cc: latest.getCc() || '',
        subject: latest.getSubject(),
        body: getPlainBody(latest),
        timestamp: latest.getDate().toISOString(),
        isReply: messages.length > 1,
      }

      var success = sendToAPI(emailData)
      if (success) {
        thread.addLabel(processedLabel)
        Logger.log('Processed email: ' + emailData.subject)
      } else {
        Logger.log('Failed email: ' + emailData.subject)
      }
    }
  } catch (error) {
    Logger.log('Email scan error: ' + error.toString())
  }
}

/* ══════════════════════════════════════
   CALENDAR SCANNING — upcoming events
   ══════════════════════════════════════ */

function scanCalendar() {
  try {
    var props = PropertiesService.getScriptProperties()
    var lastCalScan = props.getProperty('lastCalendarScan')
    var now = new Date()

    // Only scan calendar once per day
    if (lastCalScan) {
      var lastDate = new Date(lastCalScan)
      var hoursSince = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60)
      if (hoursSince < 12) {
        Logger.log('Calendar already scanned recently')
        return
      }
    }

    var endDate = new Date(now.getTime() + CONFIG.CALENDAR_DAYS_AHEAD * 24 * 60 * 60 * 1000)
    var events = CalendarApp.getDefaultCalendar().getEvents(now, endDate)

    if (events.length === 0) {
      Logger.log('No upcoming calendar events')
      props.setProperty('lastCalendarScan', now.toISOString())
      return
    }

    // Check which events we've already sent
    var sentEvents = props.getProperty('sentCalendarEvents')
    var sentSet = {}
    if (sentEvents) {
      try {
        var parsed = JSON.parse(sentEvents)
        for (var k = 0; k < parsed.length; k++) {
          sentSet[parsed[k]] = true
        }
      } catch (e) {
        sentSet = {}
      }
    }

    var newSentIds = Object.keys(sentSet)
    var sent = 0

    for (var i = 0; i < events.length; i++) {
      var event = events[i]
      var eventId = event.getId()

      if (sentSet[eventId]) continue

      var guests = event.getGuestList()
      var attendees = []
      for (var g = 0; g < guests.length; g++) {
        attendees.push(guests[g].getEmail())
      }

      var eventData = {
        source: 'calendar',
        eventId: eventId,
        title: event.getTitle(),
        description: event.getDescription() || '',
        startTime: event.getStartTime().toISOString(),
        endTime: event.getEndTime().toISOString(),
        location: event.getLocation() || '',
        attendees: attendees.join(', '),
        isAllDay: event.isAllDayEvent(),
      }

      var success = sendToAPI(eventData)
      if (success) {
        newSentIds.push(eventId)
        sent++
      }
    }

    // Keep only recent event IDs (cap at 200)
    if (newSentIds.length > 200) {
      newSentIds = newSentIds.slice(newSentIds.length - 200)
    }
    props.setProperty('sentCalendarEvents', JSON.stringify(newSentIds))
    props.setProperty('lastCalendarScan', now.toISOString())
    Logger.log('Sent ' + sent + ' calendar events')
  } catch (error) {
    Logger.log('Calendar scan error: ' + error.toString())
  }
}

/* ══════════════════════════════════════
   HELPERS
   ══════════════════════════════════════ */

function getPlainBody(message) {
  // GmailMessage has getPlainBody() — much simpler than parsing MIME
  var body = message.getPlainBody() || ''
  if (!body) {
    body = message.getBody().replace(/<[^>]*>/g, '').substring(0, 5000)
  }
  return body.substring(0, 5000)
}

function sendToAPI(data) {
  try {
    var payload = {
      data: data,
      timestamp: new Date().toISOString(),
    }

    var options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      headers: {
        'Authorization': 'Bearer ' + CONFIG.API_KEY,
      },
      muteHttpExceptions: true,
    }

    var response = UrlFetchApp.fetch(CONFIG.VERCEL_ENDPOINT, options)
    var code = response.getResponseCode()

    if (code === 200 || code === 201) {
      return true
    } else {
      Logger.log('API error (' + code + '): ' + response.getContentText().substring(0, 200))
      return false
    }
  } catch (error) {
    Logger.log('Network error: ' + error.toString())
    return false
  }
}

/* ══════════════════════════════════════
   BACKFILL — One-time 30-day scan
   ══════════════════════════════════════
   
   Run backfill30Days() once to import the
   last 30 days of emails + calendar.
   
   It auto-resumes if Apps Script hits the
   6-minute execution limit. Check Logs to
   monitor progress.
   ══════════════════════════════════════ */

var BACKFILL_BATCH = 25
var BACKFILL_MAX_MINUTES = 5 // stop before the 6-min hard limit

function backfill30Days() {
  Logger.log('=== Backfill: Starting 30-day import ===')
  
  var props = PropertiesService.getScriptProperties()
  var startTime = new Date()
  
  // Track totals across resumes
  var stats = JSON.parse(props.getProperty('backfillStats') || '{"emailsSent":0,"emailsSkipped":0,"calendarSent":0}')
  
  // Phase 1: Emails
  var emailDone = backfillEmails(props, startTime, stats)
  
  // Phase 2: Calendar (only after emails finish)
  if (emailDone) {
    backfillCalendar(props, stats)
    
    // All done — clean up
    props.deleteProperty('backfillOffset')
    props.deleteProperty('backfillStats')
    removeContinueTrigger()
    
    Logger.log('=== Backfill COMPLETE ===')
    Logger.log('Emails sent: ' + stats.emailsSent)
    Logger.log('Emails skipped: ' + stats.emailsSkipped)
    Logger.log('Calendar events sent: ' + stats.calendarSent)
  } else {
    // Save stats and schedule continuation
    props.setProperty('backfillStats', JSON.stringify(stats))
    scheduleContinue()
    Logger.log('Backfill paused (nearing time limit). Will auto-resume. Emails so far: ' + stats.emailsSent)
  }
}

function backfillEmails(props, startTime, stats) {
  var processedLabel = GmailApp.getUserLabelByName('WorkScannerProcessed')
  if (!processedLabel) {
    processedLabel = GmailApp.createLabel('WorkScannerProcessed')
  }
  
  var offset = parseInt(props.getProperty('backfillOffset') || '0', 10)
  
  // Search last 30 days, skip already processed
  var query = 'newer_than:30d -label:WorkScannerProcessed -in:spam -in:trash'
  
  while (true) {
    // Check time — stop if we're close to the 6-min limit
    var elapsed = (new Date().getTime() - startTime.getTime()) / 60000
    if (elapsed > BACKFILL_MAX_MINUTES) {
      props.setProperty('backfillOffset', String(offset))
      return false // not done
    }
    
    var threads = GmailApp.search(query, offset, BACKFILL_BATCH)
    if (threads.length === 0) {
      Logger.log('No more emails to backfill (offset ' + offset + ')')
      return true // done
    }
    
    Logger.log('Backfill batch at offset ' + offset + ': ' + threads.length + ' threads')
    
    for (var i = 0; i < threads.length; i++) {
      var thread = threads[i]
      var messages = thread.getMessages()
      var latest = messages[messages.length - 1]
      var from = latest.getFrom().toLowerCase()
      
      // Skip automated senders
      var skip = false
      for (var s = 0; s < CONFIG.SKIP_SENDERS.length; s++) {
        if (from.indexOf(CONFIG.SKIP_SENDERS[s]) !== -1) {
          skip = true
          break
        }
      }
      if (skip) {
        thread.addLabel(processedLabel)
        stats.emailsSkipped++
        continue
      }
      
      var emailData = {
        source: 'email',
        messageId: latest.getId(),
        threadId: thread.getId(),
        from: latest.getFrom(),
        to: latest.getTo(),
        cc: latest.getCc() || '',
        subject: latest.getSubject(),
        body: getPlainBody(latest),
        timestamp: latest.getDate().toISOString(),
        isReply: messages.length > 1,
      }
      
      var success = sendToAPI(emailData)
      if (success) {
        thread.addLabel(processedLabel)
        stats.emailsSent++
      }
      
      // Small pause to avoid hammering the API
      Utilities.sleep(500)
    }
    
    offset += threads.length
  }
}

function backfillCalendar(props, stats) {
  var now = new Date()
  var thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  var sevenDaysAhead = new Date(now.getTime() + CONFIG.CALENDAR_DAYS_AHEAD * 24 * 60 * 60 * 1000)
  
  // Get events from past 30 days through next 7 days
  var events = CalendarApp.getDefaultCalendar().getEvents(thirtyDaysAgo, sevenDaysAhead)
  
  Logger.log('Backfill calendar: ' + events.length + ' events found')
  
  // Load already-sent set
  var sentEvents = props.getProperty('sentCalendarEvents')
  var sentSet = {}
  if (sentEvents) {
    try {
      var parsed = JSON.parse(sentEvents)
      for (var k = 0; k < parsed.length; k++) {
        sentSet[parsed[k]] = true
      }
    } catch (e) {
      sentSet = {}
    }
  }
  
  var newSentIds = Object.keys(sentSet)
  
  for (var i = 0; i < events.length; i++) {
    var event = events[i]
    var eventId = event.getId()
    
    if (sentSet[eventId]) continue
    
    var guests = event.getGuestList()
    var attendees = []
    for (var g = 0; g < guests.length; g++) {
      attendees.push(guests[g].getEmail())
    }
    
    var eventData = {
      source: 'calendar',
      eventId: eventId,
      title: event.getTitle(),
      description: event.getDescription() || '',
      startTime: event.getStartTime().toISOString(),
      endTime: event.getEndTime().toISOString(),
      location: event.getLocation() || '',
      attendees: attendees.join(', '),
      isAllDay: event.isAllDayEvent(),
    }
    
    var success = sendToAPI(eventData)
    if (success) {
      newSentIds.push(eventId)
      stats.calendarSent++
    }
    
    Utilities.sleep(500)
  }
  
  if (newSentIds.length > 500) {
    newSentIds = newSentIds.slice(newSentIds.length - 500)
  }
  props.setProperty('sentCalendarEvents', JSON.stringify(newSentIds))
  props.setProperty('lastCalendarScan', now.toISOString())
}

/* ── Backfill continuation trigger ── */

function scheduleContinue() {
  removeContinueTrigger()
  // Wait 1 minute then resume (avoids quota issues)
  ScriptApp.newTrigger('backfill30Days')
    .timeBased()
    .after(60 * 1000)
    .create()
  Logger.log('Scheduled continuation in 1 minute')
}

function removeContinueTrigger() {
  var triggers = ScriptApp.getProjectTriggers()
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'backfill30Days') {
      ScriptApp.deleteTrigger(triggers[i])
    }
  }
}

/* ── Stop a running backfill ── */

function stopBackfill() {
  var props = PropertiesService.getScriptProperties()
  var stats = props.getProperty('backfillStats')
  props.deleteProperty('backfillOffset')
  props.deleteProperty('backfillStats')
  removeContinueTrigger()
  Logger.log('Backfill stopped. Last stats: ' + (stats || 'none'))
}

/* ── Manual test functions ── */

function testScan() {
  runWorkScanner()
}

function testEmailOnly() {
  scanEmails()
}

function testCalendarOnly() {
  scanCalendar()
}
