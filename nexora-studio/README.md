# NEXORA Studio

Premium website for NEXORA Studio — “Digital experiences, engineered to move.”

## Stack
- Vanilla HTML/CSS/JS
- Three-dimensional CSS motion / glassmorphism visual system
- Supabase Database for project enquiries
- Supabase publishable key for browser-side inserts

## Run
Open `index.html` directly or deploy the repository to GitHub Pages, Netlify, Vercel, or another static host.

## Backend
The live Supabase project is already configured and the `project_requests` table/RLS policy has been created. `supabase/schema.sql` contains the database definition for reference/redeployment.

Never replace the publishable key with a Supabase service-role key in frontend code.
