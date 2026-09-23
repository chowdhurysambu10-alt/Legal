# Cloudflare Infrastructure & Deployment Architecture Guide

This guide details how to deploy the 4-tier **LexiFlow Legal AI Assistant Ecosystem** across Cloudflare, FastAPI, and Supabase.

---

## Architecture Overview

```
[ User Browser ]
       │
       ▼ (HTTPS / Global Anycast CDN)
[ Cloudflare Pages ] ──(Hosts Static SPA)──► React.js Frontend
       │
       ├──(Reverse Proxy Rule: /api/*)
       ▼
[ Python FastAPI Backend ] (Fly.io / Railway / Render / AWS / Cloudflare Tunnel)
       ├── 1. PyPDF Parser
       ├── 2. ChromaDB Vector Store
       └── 3. Gemini API Model Service
       │
       ▼
[ Supabase PostgreSQL ] (Tables: users, documents, analyses, chat_messages)
```

---

## Tier 1: Frontend Deployment on Cloudflare Pages

### Option A: Direct Git Integration (Recommended)
1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/) and navigate to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
2. Select your repository.
3. Configure Build Settings:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `frontend`
4. Click **Save and Deploy**. Cloudflare edge CDN will build and distribute your static assets globally with sub-second latency.

### Option B: Cloudflare Wrangler CLI
```bash
cd frontend
npm run build
npx wrangler pages deploy dist --project-name=lexiflow-legal-ai
```

---

## Tier 2: Backend Deployment & API Routing

### 1. Hosting FastAPI
FastAPI can be deployed on any container platform or VPS:
- **Fly.io**: `fly launch` in `backend-fastapi`
- **Render / Railway**: Select Python, build command `pip install -r requirements.txt`, start command `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Cloudflare Tunnel (`cloudflared`)**: For private server hosting behind Cloudflare with zero open public ports:
  ```bash
  cloudflared tunnel create legal-api
  cloudflared tunnel route dns legal-api api.yourdomain.com
  cloudflared tunnel run --url http://localhost:8000 legal-api
  ```

### 2. Cloudflare Reverse Proxy Configuration
To serve both frontend and backend on the same domain (avoiding CORS issues):
1. In Cloudflare Pages, add a **Worker Function** in `frontend/functions/api/[[path]].js`:
```javascript
export async function onRequest(context) {
  const url = new URL(context.request.url);
  const backendUrl = "https://your-backend-api.fly.dev" + url.pathname + url.search;
  
  return fetch(new Request(backendUrl, context.request));
}
```
2. Or use Cloudflare Page Rules / Transform Rules:
   - Match: `yourdomain.com/api/*`
   - Forward to: `https://api.yourdomain.com/api/*`

---

## Tier 3: Supabase Setup & Security

1. In your [Supabase Dashboard](https://supabase.com/dashboard), navigate to the **SQL Editor**.
2. Open and run the provided SQL migration file:
   [backend-fastapi/supabase_schema.sql](file:///Users/sambu/Desktop/legal%20AI/backend-fastapi/supabase_schema.sql)
3. Copy your project connection details:
   - **Project URL**: `https://your-project.supabase.co`
   - **Service Role Key**: (Found under Project Settings > API)
4. Update `backend-fastapi/.env`:
   ```bash
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your_service_role_key
   ```
*(Note: If you run locally without Supabase credentials, the backend automatically uses the embedded SQLite database at `backend-fastapi/legal_local.db`).*

---

## Tier 4: Cloudflare Security, SSL, and WAF

### 1. SSL/TLS Encryption
- Navigate to **SSL/TLS** > **Overview** in Cloudflare.
- Set encryption mode to **Full (strict)** to guarantee end-to-end encryption from the browser through Cloudflare edge to the backend origin.

### 2. Web Application Firewall (WAF) & Abuse Prevention
- **Rate Limiting Rule**:
  - Path: `/api/upload` and `/api/ask`
  - Action: Block or Managed Challenge if requests exceed 20 requests per minute per IP.
- **Bot Fight Mode**: Enable under **Security** > **Bots** to protect AI endpoints from automated scraping.
- **Payload Inspection**: Filter requests where `http.request.uri.path contains "/api/upload"` with `http.request.body.size > 25MB` to prevent memory exhaustion attacks.
