# Database Schema - Supabase Configuration

## Required Tables & Columns

### 1. `cases` Table
```sql
CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId TEXT NOT NULL,
  case_number VARCHAR(50) UNIQUE NOT NULL,
  client_name VARCHAR(255),
  opponent VARCHAR(255),
  next_hearing_date TIMESTAMP,
  title VARCHAR(500),
  messages JSONB,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_cases_userId ON cases(userId);
CREATE INDEX idx_cases_case_number ON cases(case_number);
CREATE INDEX idx_cases_createdAt ON cases(createdAt);
```

### 2. `activity_logs` Table
```sql
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId TEXT NOT NULL,
  action VARCHAR(100) NOT NULL,
  details TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_activity_logs_userId ON activity_logs(userId);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);
CREATE INDEX idx_activity_logs_timestamp ON activity_logs(timestamp);
```

### 3. `user_permissions` Table
```sql
CREATE TABLE user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId TEXT NOT NULL,
  role VARCHAR(50) NOT NULL,
  permissions TEXT[] DEFAULT ARRAY[]::text[],
  grantedAt TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_user_permissions_userId ON user_permissions(userId);
CREATE INDEX idx_user_permissions_role ON user_permissions(role);
```

### 4. `profiles` Table
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId TEXT NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL,
  fullName VARCHAR(255),
  phone VARCHAR(20),
  profileImage VARCHAR(500),
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_profiles_userId ON profiles(userId);
CREATE INDEX idx_profiles_email ON profiles(email);
```

---

## Security Policies (RLS)

### cases table - Row Level Security
```sql
-- Enable RLS
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

-- Regular users see only their own cases
CREATE POLICY "Users can view own cases"
  ON cases FOR SELECT
  USING (userId = current_user_id() OR current_user_email() = 'bishoysamy390@gmail.com');

-- Users can insert their own cases
CREATE POLICY "Users can create cases"
  ON cases FOR INSERT
  WITH CHECK (userId = current_user_id());

-- Users can update their own cases
CREATE POLICY "Users can update own cases"
  ON cases FOR UPDATE
  USING (userId = current_user_id() OR current_user_email() = 'bishoysamy390@gmail.com');
```

### activity_logs table - Row Level Security
```sql
-- Enable RLS
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Only admin can view activity logs
CREATE POLICY "Admin can view all activity logs"
  ON activity_logs FOR SELECT
  USING (current_user_email() = 'bishoysamy390@gmail.com');

-- Users can insert their own activity
CREATE POLICY "Users can log their activity"
  ON activity_logs FOR INSERT
  WITH CHECK (TRUE);
```

---

## Fields Description

### cases table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| userId | TEXT | Firebase user ID (for privacy filtering) |
| case_number | VARCHAR | Unique case identifier (auto-generated) |
| client_name | VARCHAR | Name of the client |
| opponent | VARCHAR | Name of the opposing party |
| next_hearing_date | TIMESTAMP | Next court date |
| title | VARCHAR | Case title/description |
| messages | JSONB | Chat history (MongoDB-like storage) |
| createdAt | TIMESTAMP | Creation timestamp |
| updatedAt | TIMESTAMP | Last update timestamp |

### activity_logs table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| userId | TEXT | User who performed the action |
| action | VARCHAR | Action type (e.g., 'حفظ_قضية', 'رفع_مستند') |
| details | TEXT | Additional details about the action |
| timestamp | TIMESTAMP | When the action occurred |

### user_permissions table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| userId | TEXT | User ID |
| role | VARCHAR | Role name (admin, user, consultant) |
| permissions | TEXT[] | Array of permission strings |
| grantedAt | TIMESTAMP | When permissions were granted |

### profiles table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| userId | TEXT | Firebase user ID (unique) |
| email | VARCHAR | User email |
| fullName | VARCHAR | User's full name |
| phone | VARCHAR | Contact phone |
| profileImage | VARCHAR | URL to profile picture |
| createdAt | TIMESTAMP | Creation date |
| updatedAt | TIMESTAMP | Last update |

---

## Setup Instructions

1. **Go to Supabase Console**
   - Navigate to https://supabase.com/dashboard

2. **Run the SQL queries above**
   - Open SQL Editor
   - Copy and paste each CREATE TABLE statement
   - Execute each one

3. **Enable RLS (Optional but Recommended)**
   - Go to Table Editor
   - Select each table
   - Click "Row Level Security"
   - Enable RLS
   - Add the policies above

4. **Test the connection**
   - Verify `supabaseClient.ts` has correct credentials
   - Check that VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set

---

## Privacy Implementation

### User Privacy Filter (Active in codeUtils.ts)
```typescript
// Regular users only see their own cases
if (userEmail !== "bishoysamy390@gmail.com") {
  query = query.eq("userId", userId);
}

// Admin (bishoysamy390@gmail.com) sees everything
```

### Case Access Control
- ✅ Users cannot access other users' cases
- ✅ Admin has unrestricted access
- ✅ Activity logs show who accessed what and when
- ✅ Document uploads are tracked per user

---

## Verifying Setup

Run these queries to verify:

```sql
-- Check all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Count records in each table
SELECT 
  'cases' as table_name, COUNT(*) as count FROM cases
UNION ALL SELECT 'activity_logs', COUNT(*) FROM activity_logs
UNION ALL SELECT 'user_permissions', COUNT(*) FROM user_permissions
UNION ALL SELECT 'profiles', COUNT(*) FROM profiles;

-- View latest activity
SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT 10;
```
