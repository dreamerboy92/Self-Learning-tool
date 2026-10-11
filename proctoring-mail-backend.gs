/**
 * Proctoring mail backend for the exam-prep app  (Google Apps Script)
 *
 * WHAT IT DOES
 *  - Receives the webcam recording parts the app uploads during the exam and saves them
 *    in your Google Drive (folder "STET Proctoring Recordings" > one sub-folder per attempt).
 *  - When the candidate submits, it emails you a summary + the link to that Drive folder.
 *    (Videos are shared by Drive link, not attached: Gmail limits attachments to 25 MB.)
 *
 * SETUP (about 5 minutes)
 *  1. Sign in to Google as umeshshah9097@gmail.com  ->  https://script.google.com  ->  New project.
 *  2. Delete the sample code, paste this whole file, click Save.
 *  3. Deploy > New deployment > type "Web app".
 *       Execute as:      Me
 *       Who has access:  Anyone
 *     Click Deploy and approve the permissions (Drive + Gmail send).
 *  4. Copy the Web app URL (ends with /exec).
 *  5. Open the app's HTML file in a text editor, find   endpoint:''   inside the PROCTOR object
 *     and paste the URL between the quotes. Save. Done.
 *
 * NOTES
 *  - The recipient is fixed below, so nobody can make this script email other people.
 *  - "Anyone" access means anyone who knows the URL could upload files to your Drive. Don't publish the
 *    URL anywhere except inside the app; if abused, delete the deployment and create a new one.
 *  - Candidates must be told (the app shows a consent box) that their video goes to you.
 */
const OWNER_EMAIL = 'umeshshah9097@gmail.com';
const ROOT_FOLDER = 'STET Proctoring Recordings';

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    const folder = sessionFolder_(d.session, d.name);
    if (d.action === 'segment') {
      const bytes = Utilities.base64Decode(d.data);
      const idx = ('0' + (d.idx || 0)).slice(-2);
      folder.createFile(Utilities.newBlob(bytes, d.mime || 'video/webm', 'part-' + idx + '.webm'));
    } else if (d.action === 'finish') {
      const s = d.summary || {};
      const v = (s.violations || []);
      const html =
        '<h3>Exam recording received</h3>' +
        '<p><b>Candidate:</b> ' + esc_(d.name) + '<br>' +
        '<b>Exam:</b> ' + esc_(d.exam) + '<br>' +
        '<b>Marks:</b> ' + esc_(s.marks) + ' / ' + esc_(s.maxMarks) + '<br>' +
        '<b>Attempted:</b> ' + esc_(s.attempted) + ' (correct ' + esc_(s.correct) + ', wrong ' + esc_(s.incorrect) + ')<br>' +
        '<b>Time taken:</b> ' + Math.round((s.timeTakenSec || 0) / 60) + ' min<br>' +
        '<b>Recording parts:</b> ' + esc_(d.segments) + '</p>' +
        '<p><b>Integrity warnings (' + v.length + '):</b> ' + (v.length ? '<br>' + v.map(esc_).join('<br>') : 'none') + '</p>' +
        (s.autoSubmitted ? '<p><b>Note:</b> ' + esc_(s.autoSubmitted) + '</p>' : '') +
        '<p><a href="' + folder.getUrl() + '">Open the recording folder in Google Drive</a></p>';
      MailApp.sendEmail({ to: OWNER_EMAIL, subject: '[Exam practice] Recording — ' + (d.name || 'candidate'), htmlBody: html });
    }
    return ContentService.createTextOutput('ok');
  } catch (err) {
    return ContentService.createTextOutput('error: ' + err);
  }
}

function sessionFolder_(session, name) {
  const roots = DriveApp.getFoldersByName(ROOT_FOLDER);
  const root = roots.hasNext() ? roots.next() : DriveApp.createFolder(ROOT_FOLDER);
  const label = String(name || 'candidate').replace(/[^\w .-]/g, '') + ' - ' + session;
  const subs = root.getFoldersByName(label);
  return subs.hasNext() ? subs.next() : root.createFolder(label);
}
function esc_(x) {
  return String(x === undefined || x === null ? '' : x).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Opening the /exec URL in a browser shows this line, proving the deployment is live. */
function doGet() {
  return ContentService.createTextOutput('Proctoring backend is running.');
}

/**
 * RUN THIS ONCE from the editor (select "authorizeAndTest" at the top, click Run).
 * It asks Google for Drive + Gmail permission and sends you a test email and creates the Drive folder.
 * Without this approval, uploads from the app fail silently.
 */
function authorizeAndTest() {
  const f = sessionFolder_('TEST-' + Date.now(), 'Test');
  MailApp.sendEmail({ to: OWNER_EMAIL, subject: '[Exam practice] Backend test OK',
    htmlBody: 'Your proctoring backend can send mail and write to Drive.<br><a href="' + f.getUrl() + '">Test folder</a>' });
}
