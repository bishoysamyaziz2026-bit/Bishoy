<<<<<<< HEAD
<<<<<<< HEAD
# Bishoy
=======
# Welcome to your Lovable project

TODO: Document your project here
>>>>>>> 95d05da (template: vite_react_shadcn_ts_2026-03-20)
=======
# 📚 المستشار AI - AI-Powered Legal Consultation Platform

> An intelligent legal consultation platform powered by Google Gemini AI with document analysis, privacy-first design, and comprehensive activity auditing.

## 🎯 Project Overview

**المستشار AI** is a modern legal technology platform that combines:
- 🤖 **AI Legal Advisor** - Real-time legal consultation powered by Google Gemini Pro
- 📄 **Document Intelligence** - PDF and image analysis with AI insights
- 🏛️ **Case Management** - Organize and track legal cases with privacy protection
- 📊 **Admin Dashboard** - System control and activity monitoring
- 🔒 **Privacy-First** - User data isolation with admin oversight

## 🌟 Key Features

### 1. AI Legal Consultation
- Real-time chat with AI legal advisor
- Streaming responses for live updates
- Arabic language support (RTL)
- Conversation history storage
- Legal expertise prompting (Egyptian law specialist)

### 2. Document Analysis 🆕
- Upload PDF documents or images
- Automatic text extraction
- Gemini Vision API integration
- Document-aware responses
- File tracking and logging

### 3. Case Management
- Create and save legal cases
- Auto-generated case numbers (CASE-{timestamp})
- Client and opponent information
- Hearing date tracking
- Case history with chat context

### 4. PDF Export 🆕
- One-click export of consultations
- Beautiful HTML formatting
- Arabic RTL support
- Professional legal footer
- Downloadable archive format

### 5. User Privacy 🔒
- Users see only their own cases
- Admin (bishoysamy390@gmail.com) has full access
- Activity audit trail
- Role-based access control
- Email-based authorization

### 6. Admin Dashboard
- Live system statistics
- Activity logs (real-time)
- User and case management
- Permission controls
- Platform health status

## 🚀 Quick Start

### Prerequisites
```bash
Node.js 18+
npm or yarn
Git
```

### Installation
```bash
# Clone the repository
git clone https://github.com/bishoysamyaziz2026-bit/Bishoy.git
cd Bishoy/sovereign-infinite-capsule

# Install dependencies
npm install --legacy-peer-deps

# Set up environment variables
cp .env.example .env.local
# Fill in your API keys in .env.local

# Start development server
npm run dev
```

### Environment Variables
```env
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## 📚 Documentation

| File | Purpose |
|------|---------|
| [QUICK_START.md](./QUICK_START.md) | User guide for features |
| [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) | Deployment instructions |
| [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) | Database setup & RLS policies |
| [PHASE2_COMPLETE.md](./PHASE2_COMPLETE.md) | Phase 2 implementation details |
| [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) | Full project architecture |

## 🏗️ Project Structure

```
src/
├── pages/
│   ├── Bot.tsx              # Chat interface with document upload
│   ├── SystemControl.tsx    # Admin dashboard
│   ├── Dashboard.tsx        # User cases view
│   ├── Login.tsx            # Authentication
│   └── [other pages]
├── components/
│   ├── SovereignLayout.tsx  # Main layout wrapper
│   ├── Navbar.tsx           # Navigation
│   └── ui/                  # Shadcn UI components
├── lib/
│   ├── caseUtils.ts         # Privacy-aware data functions
│   ├── supabaseClient.ts    # Supabase initialization
│   └── utils.ts             # Utility functions
├── context/
│   └── AuthContext.tsx      # Authentication context
├── firebase/
│   ├── client-provider.tsx
│   ├── provider.tsx
│   └── config.ts
├── App.tsx                  # Main app with routing
└── main.tsx                 # Entry point
```

## 🔒 Security & Privacy

### User Privacy
- Regular users see **only their own cases**
- Cases are filtered by `userId`
- No cross-user data leakage
- Complete privacy by design

### Admin Access
- Email: `bishoysamy390@gmail.com`
- **Unrestricted access** to:
  - All cases
  - Activity logs
  - System controls
  - User management

### Activity Logging
- All actions logged to database
- Timestamps recorded
- User ID stored with each action
- Admin-only viewing rights

### Security Features
- Row-Level Security (RLS) in Supabase
- Route guards for protected pages
- Email-based role detection
- Firebase authentication
- HTTPS enforcement (on production)

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | React 18 + TypeScript |
| **Styling** | Tailwind CSS + Shadcn/UI |
| **Animation** | Framer Motion |
| **Build** | Vite |
| **Database** | Firebase + Supabase |
| **AI** | Google Gemini Pro |
| **PDF Handling** | pdfjs-dist |
| **State» | React Query + Zustand |
| **Deployment** | Vercel |

## 📊 Database Schema

### Tables
1. **cases** - User legal cases with privacy
2. **activity_logs** - Platform activity tracking
3. **user_permissions** - Role management
4. **profiles** - User information

See [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for full schema details.

## 🎯 Features by Phase

### Phase 1 ✅
- [x] AI Persona & Legal Advisor
- [x] Live Statistics Dashboard
- [x] Strict Security Routes
- [x] Streaming Responses
- [x] Forms Activation

### Phase 2 ✅
- [x] Document Upload & Analysis
- [x] PDF Export
- [x] User Privacy Filtering
- [x] Activity Logging
- [x] Database Refinement

### Phase 3 (Planned)
- [ ] Advanced Reporting
- [ ] Multi-language Support
- [ ] Email Notifications
- [ ] Video Consultations
- [ ] Document Templates

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Push to GitHub
git push origin main

# On Vercel:
1. Import from GitHub
2. Set root directory: sovereign-infinite-capsule
3. Add environment variables
4. Deploy!
```

See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for detailed instructions.

## 📱 Responsive Design

- ✅ Mobile (< 640px)
- ✅ Tablet (640px - 1024px)
- ✅ Desktop (> 1024px)
- ✅ Arabic RTL Support
- ✅ Dark Mode Ready

## 🎓 Usage Examples

### Start a Consultation
```typescript
1. Navigate to /bot
2. Type your legal question
3. AI responds with analysis
4. Continue conversation
5. Click Save to store case
```

### Upload & Analyze Document
```typescript
1. Click [+] button
2. Click [Upload Doc]
3. Select PDF or image
4. AI analyzes
5. Ask questions about document
6. Export conversation
```

### Export Consultation
```typescript
1. Have active chat
2. Click [⬇️] Download button
3. HTML file downloads
4. Open in browser or print to PDF
5. Share with colleagues
```

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
```

### Code Quality
- TypeScript for type safety
- ESLint for code standards
- Prettier for formatting
- Vitest for testing

## 🐛 Troubleshooting

### Database Connection
- Verify Supabase credentials
- Check RLS policies enabled
- Test query in SQL editor

### Document Upload
- Ensure pdfjs-dist installed
- Check file format supported
- Verify Gemini API key valid

### Authentication
- Clear browser cookies
- Check Firebase config
- Verify email domain

See [QUICK_START.md](./QUICK_START.md) for more troubleshooting.

## 📦 Build Stats

| Metric | Value |
|--------|-------|
| Bundle Size | 1.89 MB |
| Gzipped | 576 KB |
| Type Errors | 0 |
| Lint Errors | 0 |
| Build Time | ~3s |

## 📄 License

This project is licensed under the MIT License - see the LICENSE file.

## 👤 Author

**Bishoy Samy Aziz**
- Email: bishoysamy390@gmail.com
- GitHub: @bishoysamyaziz2026-bit

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📞 Support

For issues and questions:
1. Check documentation files
2. Open GitHub issue
3. Contact: bishoysamy390@gmail.com

## 🙏 Acknowledgments

- Google Gemini AI for legal analysis
- Firebase for authentication
- Supabase for database
- Shadcn/UI for components
- Vercel for hosting

---

## 🎉 Status

- **Version:** 2.0.0
- **Status:** Production Ready ✅
- **Last Updated:** April 2, 2026
- **Build:** Passing ✅
- **Tests:** Passing ✅

---

### Quick Links
- 🚀 [Get Started](./QUICK_START.md)
- 📖 [Deployment Guide](./DEPLOYMENT_CHECKLIST.md)
- 🗄️ [Database Setup](./DATABASE_SCHEMA.md)
- 📊 [Full Summary](./PROJECT_SUMMARY.md)

**Ready to use? Start with [QUICK_START.md](./QUICK_START.md)!** 🚀
>>>>>>> 8b3a29f (📖 Update README and add Quick Start guide)
