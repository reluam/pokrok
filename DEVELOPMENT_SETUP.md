# Development Setup Guide

## Clerk Development Configuration

Pro správné fungování Clerk v development prostředí je potřeba nastavit správné URL.

### 1. Environment Variables

Vytvořte soubor `.env.local` s následujícími proměnnými:

```bash
# Development URLs (for localhost)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=http://localhost:3000/muj/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=http://localhost:3000/muj/sign-up
NEXT_PUBLIC_CLERK_FALLBACK_REDIRECT_URL=http://localhost:3000/muj
NEXT_PUBLIC_CLERK_AFTER_SIGN_OUT_URL=http://localhost:3000/muj/sign-in

# Production URLs (uncomment for production deployment)
# NEXT_PUBLIC_CLERK_SIGN_IN_URL=https://accounts.pokrok.app/sign-in
# NEXT_PUBLIC_CLERK_SIGN_UP_URL=https://accounts.pokrok.app/sign-up
# NEXT_PUBLIC_CLERK_FALLBACK_REDIRECT_URL=https://muj.pokrok.app
```

### 2. Clerk Dashboard Configuration

V Clerk dashboardu nastavte:

1. **Allowed redirect URLs:**
   - `http://localhost:3000/muj`
   - `http://localhost:3000/muj/sign-in`
   - `http://localhost:3000/muj/sign-up`

2. **Allowed origins:**
   - `http://localhost:3000`

3. **Development host:**
   - Clerk automaticky detekuje `localhost:3000` jako development host

### 3. Troubleshooting

**Problém:** Clerk přesměrovává na produkční doménu místo localhost

**Řešení:**
1. Zkontrolujte `.env.local` - musí obsahovat localhost URL
2. Restartujte dev server: `npm run dev`
3. Vymažte cookies v prohlížeči
4. Zkontrolujte Clerk dashboard - musí mít nastavené localhost URL

**Problém:** "Invalid redirect URL" error

**Řešení:**
1. Přidejte `http://localhost:3000/muj` do Allowed redirect URLs v Clerk dashboardu
2. Zkontrolujte, že `NEXT_PUBLIC_CLERK_FALLBACK_REDIRECT_URL` je správně nastaveno

### 4. Production Deployment

Pro produkční nasazení:

1. Zakomentujte development URL v `.env.local`
2. Odkomentujte production URL
3. Nastavte správné domény v Clerk dashboardu
4. Deploy na Vercel/produkční server

### 5. Dynamic URL Detection

Aplikace automaticky detekuje prostředí a nastavuje správné URL:

- **Development:** `http://localhost:3000/muj/*`
- **Production:** `https://muj.pokrok.app/*`

Tato logika je implementována v `lib/utils.ts` funkci `getClerkUrls()`.
