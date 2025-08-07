# Document Manager

A full-featured document management system powered by Supabase, featuring real-time updates, secure file storage, and user authentication.

## Features

- 🔐 **Secure Authentication** - Email/password login with JWT sessions
- 📝 **Rich Document Editing** - Create and edit documents with markdown support
- 📁 **File Management** - Upload/download files with progress tracking
- ⚡ **Real-time Sync** - Instant updates across all devices
- 🔒 **Row-Level Security** - Granular access control for all data
- 📱 **Responsive Design** - Works on desktop and mobile

## Tech Stack

**Frontend:**
- React 18
- Vite
- React Bootstrap
- React Icons

**Backend:**
- Supabase (PostgreSQL)
- Supabase Auth
- Supabase Storage
- Supabase Realtime

## Prerequisites

- Node.js v20 min
- npm v8+
- Supabase account (free tier works)

## Installation

1. Clone the repository
```bash
git clone https://github.com/SabirDivs/document-manager
cd document-manager


Install dependencies

bash
npm install
Set up environment variables

bash
cp .env.example .env.local
Edit .env.local with your Supabase credentials:

env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_KEY=your-anon-key
Initialize database (run in Supabase SQL Editor):

sql
-- Create documents table
CREATE TABLE documents (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT NOT NULL,
  content TEXT,
  user_id UUID REFERENCES auth.users NOT NULL,
  is_public BOOLEAN DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false);

-- Document access policies
CREATE POLICY "User can manage their docs" ON documents
FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Public docs are viewable" ON documents
FOR SELECT USING (is_public = true);

-- Storage policies
CREATE POLICY "User can upload to their folder" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "User can manage their files" ON storage.objects
FOR ALL TO authenticated USING (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Add storage policies (see full SQL in docs)
Running Locally
Start the development server:

bash
npm run start
Open http://localhost:5173 in your browser.