# 🚀 Quick Start Guide - المستشار AI Platform

## ⚡ Get Started in 5 Minutes

### 1️⃣ **Login/Signup**
```
👉 Navigate to /auth/login
📧 Enter your email
🔐 Verify (Firebase auth)
✅ You're in!
```

### 2️⃣ **Start Legal Consultation**
```
🤖 Go to /bot
💬 Type your legal question
⏳ Wait for AI analysis
✨ Get instant advice
```

### 3️⃣ **Upload Legal Document** 🆕
```
1. Click [+] button in chat
2. Click [Upload Doc] icon
3. Select PDF or Image file
4. Gemini analyzes automatically
5. Ask AI about the document
```

### 4️⃣ **Export Consultation** 🆕
```
1. Click [⬇️] Download button (violet)
2. HTML file downloads
3. View in browser or print as PDF
4. Share with lawyers or clients
```

### 5️⃣ **Save as Case** 🆕
```
1. Click [💾] Save button (amber)
2. Case auto-saved to Supabase
3. Assigned unique case number
4. View in dashboard later
5. Activity logged automatically
```

---

## 🎨 New Features Overview

### Document Intelligence
- **Upload:** PDF, PNG, JPG, GIF files
- **Analysis:** Gemini extracts and analyzes text
- **Chat:** Ask AI about document content
- **Tracking:** File names logged with timestamps

### PDF Export
- **One-click:** Download button in toolbar
- **Format:** Beautiful HTML with RTL support
- **Contents:** Full chat history + metadata
- **Usage:** Print to PDF, email, or archive

### Privacy Shield
- **Your Data:** Only YOU see your cases
- **Admin Access:** System can see everything
- **Audit:** Every action logged
- **Security:** Email-based role detection

### Activity Tracking
- **What's Logged:** Document uploads, case saves
- **Who Sees It:** Admins only (bishoysamy390@gmail.com)
- **Access:** System Control > Activity Logs
- **Format:** Timestamp, user ID, action details

---

## 📊 Understanding Your Dashboard

### Bot Page (`/bot`)
```
┌─────────────────────────────────┐
│  Chat Area (Messages)           │
│  ► Show AI Legal Advisor icon   │
│  ► Display all conversation     │
│  ► Messages from both sides     │
└─────────────────────────────────┘
         ↓
┌─────────────────────────────────┐
│  Control Bar (Bottom)           │
│ [+]  Input Field   [⬇️][💾][➜]  │
│┌──────────────────────────────┐ │
││ Upload Doc │Legal Vault │...│ │ (when + open)
│└──────────────────────────────┘ │
└─────────────────────────────────┘
```

### Dashboard Page (`/dashboard`)
```
Shows your saved cases
- Case number
- Date created
- Number of messages
- Quick actions
```

### System Control (`/system-control`) 🔒
```
⚠️ Admin only! (bishoysamy390@gmail.com)

Dashboard:
├─ Users Count (Live from Supabase)
├─ Cases Count (Live from Supabase)
├─ System Status (Health check)
└─ Controls:
   ├─ Activity Logs (last 50 actions)
   └─ Manage Permissions
```

---

## 💡 Common Tasks

### Task: Upload & Analyze Contract
```
1. Click [+] in chat → Upload Doc
2. Select contract.pdf
3. Gemini extracts text automatically
4. Chat shows: "تم تحميل مستند: contract.pdf"
5. Ask: "اشرح شروط العقد"
6. AI analyzes and explains
7. Click [⬇️] to export conversation
```

### Task: Save Legal Consultation
```
1. Have a conversation with AI
2. Click [💾] Save button
3. Case is saved to Supabase
4. Case number: CASE-{timestamp}
5. Activity logged: "حفظ_قضية"
6. View later in /dashboard
```

### Task: View Activity (Admin Only)
```
1. Go to /system-control
2. Click "Activity Logs"
3. Dialog shows:
   - حفظ_قضية: CASE-123...
   - رفع_مستند: contract.pdf...
   - ⏰ Timestamps
   - 👤 User IDs
```

### Task: Download Consultation as PDF
```
1. Have chat messages
2. Click violet [⬇️] button
3. Browser downloads HTML
4. Open in browser
5. Print (Ctrl+P or Cmd+P)
6. Save as PDF ✅
```

---

## 🔒 Privacy Explained

### You See
✅ Your own cases  
✅ Your own chats  
✅ Your own documents  
✅ Your own activity  

### You DON'T See
❌ Other users' cases  
❌ Other users' chats  
❌ System activity logs  
❌ Admin actions  

### Admin (bishoysamy390@gmail.com) Sees
✅ ALL cases (all users)  
✅ ALL activity logs  
✅ System statistics  
✅ User permissions  

---

## ⚙️ Settings & Configuration

### Your Profile
```
🚧 Coming Soon
- Update name
- Change password
- Manage notifications
- Delete account
```

### Document Preferences
```
Supported formats:
- PDF (.pdf)
- PNG (.png)
- JPG/JPEG (.jpg, .jpeg)
- GIF (.gif)

Size limits:
- Max file size: Depends on Gemini API
- Larger files take longer
```

### Consultation Export
```bash
# Downloaded file format:
استشارة-قانونية-YYYY-MM-DD.html

# Open with:
- Any web browser
- Print to PDF
- Email as attachment
- Share with team
```

---

## 🆘 Troubleshooting

### Can't Upload Document
❌ File format not supported?  
✅ Use PDF or image (.png, .jpg)  

❌ File too large?  
✅ Try smaller file  

❌ Upload button disabled?  
✅ Type something first to enable chat  

### Export Not Working
❌ Download button disabled?  
✅ Need at least 1 message  

❌ HTML file opens blank?  
✅ Try in Chrome or Firefox  

### Case Not Saved
❌ Save button is gray?  
✅ Need at least 1 message  

❌ Get error message?  
✅ Check internet connection  

### Activity Logs Empty
❌ No logs showing?  
✅ Only appears for admins  

❌ Need to see your activity?  
✅ Check your cases instead  

---

## 📈 Tips & Tricks

### Pro Tip 1: Document Analysis
Upload contracts BEFORE asking questions -> AI understands full context

### Pro Tip 2: Organizing Cases
Save frequently -> Each save gets unique case number for reference

### Pro Tip 3: PDF Backup
Export after important consultations -> Keep HTML copies as backup

### Pro Tip 4: Sharing Results
Export consultation -> Share HTML with other lawyers for review

### Pro Tip 5: Multiple Documents
Upload multiple items in same chat -> AI sees full document context

---

## 🎯 Best Practices

✅ **DO:**
- Review AI advice carefully
- Consult licensed lawyers
- Save important cases
- Export for records
- Keep activity logs clean

❌ **DON'T:**
- Trust AI as legal authority
- Share sensitive data casually
- Delete important cases
- Ignore security warnings
- Use for urgent emergencies

---

## 🔐 Security Reminders

1. **Login Safety**
   - Use strong passwords
   - Don't share login details
   - Logout on shared devices

2. **Data Privacy**
   - Your data is private
   - Admins have oversight
   - All actions are logged
   - GDPR compliant

3. **Document Security**
   - Don't upload personal IDs
   - Redact sensitive info
   - Use secure connection (HTTPS)
   - Clear browser cache

---

## 📞 Support

### For Technical Issues
1. Check browser console (F12)
2. Verify internet connection
3. Clear browser cache
4. Try different browser
5. Contact admin

### For Legal Questions
⚠️ This is an AI assistant, not a lawyer
- Consult licensed attorney
- Use for general guidance only
- No legal privilege
- Not confidential

---

## 🚀 Ready to Start?

```bash
npm run dev         # Start development
# OR
Visit deployed site # If already live
```

### First Steps:
1. ✅ Login
2. ✅ Go to /bot
3. ✅ Ask a legal question
4. ✅ Try uploading a document
5. ✅ Export the chat
6. ✅ Save as case
7. ✅ Check activity logs (if admin)

---

## 📊 What You Can Do

| Feature | Status | Access |
|---------|--------|--------|
| Chat with AI | ✅ Live | Everyone |
| Upload Documents | ✅ Live | Everyone |
| Export PDF | ✅ Live | Everyone |
| Save Cases | ✅ Live | Everyone |
| View Your Cases | ✅ Live | Everyone |
| Activity Logs | ✅ Live | Admin Only |
| System Control | ✅ Live | Admin Only |
| Manage Users | 🚧 Soon | Admin Only |

---

**Now you're ready! 🎉**

Start by asking a legal question or uploading a document.

The AI Legal Advisor is here to help! ⚖️

---

*Last Updated: April 2, 2026*  
*Version: 2.0.0*  
*Platform: المستشار AI*
