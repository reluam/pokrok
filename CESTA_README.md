# Aplikace Cesta - Moje Cesta

Aplikace pro sledování osobního rozvoje s metaforou cesty. Uživatelé si mohou nastavit své hodnoty, cíle a sledovat svůj denní pokrok.

## Funkce

### 1. Onboarding
- Výběr hodnot z přednastavené knihovny
- Možnost přidat vlastní hodnoty
- Nastavení prvního cíle

### 2. Hlavní dashboard
- **Mapa cesty**: Vizuální reprezentace pokroku s cíli jako zastávkami
- **Kompas hodnot**: Přehled vybraných hodnot
- **Denní kroky**: Přidávání a sledování denních akcí
- **Sledování pokroku**: Statistiky a reflexe

### 3. Denní check-in
- Přidávání kroků pro konkrétní cíle a hodnoty
- Označování dokončených kroků
- Sledování denního pokroku

### 4. Sledování pokroku
- Přehled aktivit za posledních 7 dní
- Výkonnost podle hodnot
- Pokrok jednotlivých cílů
- Týdenní reflexe

## Technologie

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Autentifikace**: Clerk
- **Databáze**: Neon PostgreSQL
- **Styling**: Tailwind CSS s custom komponenty

## Instalace

1. Nainstalujte závislosti:
```bash
npm install
```

2. Nastavte environment proměnné:
```bash
cp env.example .env.local
```

3. Nakonfigurujte Clerk:
   - Vytvořte účet na [clerk.com](https://clerk.com)
   - Vytvořte novou aplikaci
   - Zkopírujte klíče do `.env.local`

4. Inicializujte databázi:
```bash
npm run init-cesta
```

5. Spusťte vývojový server:
```bash
npm run dev
```

## Struktura databáze

### Tabulky
- `users` - Uživatelé aplikace
- `values` - Hodnoty (systémové i uživatelské)
- `goals` - Cíle uživatelů
- `goal_values` - Propojení cílů s hodnotami
- `daily_steps` - Denní kroky
- `weekly_reflections` - Týdenní reflexe
- `progress_milestones` - Milníky pokroku

## API Endpointy

### Uživatelé
- `GET /api/cesta/users` - Získat uživatele
- `POST /api/cesta/users` - Vytvořit uživatele
- `PATCH /api/cesta/users` - Aktualizovat uživatele

### Hodnoty
- `GET /api/cesta/values` - Získat hodnoty
- `POST /api/cesta/values` - Vytvořit hodnotu

### Cíle
- `GET /api/cesta/goals` - Získat cíle
- `POST /api/cesta/goals` - Vytvořit cíl

### Denní kroky
- `GET /api/cesta/daily-steps` - Získat kroky pro datum
- `POST /api/cesta/daily-steps` - Vytvořit krok
- `PATCH /api/cesta/daily-steps/[id]/complete` - Označit krok jako dokončený

### Týdenní reflexe
- `GET /api/cesta/weekly-reflections` - Získat reflexe

## Deployment

Aplikace je připravena pro deployment na Vercel:

1. Připojte GitHub repository k Vercel
2. Nastavte environment proměnné v Vercel dashboard
3. Deploy automaticky proběhne při push do main branch

## Doména

Aplikace bude dostupná na `moje.smysluplnacesta.cz` po nastavení DNS záznamů.

## Vývoj

### Přidání nové funkce
1. Vytvořte databázové schéma (pokud potřebné)
2. Implementujte API endpointy
3. Vytvořte React komponenty
4. Přidejte routing

### Testování
```bash
npm run lint
npm run build
```

## Licence

Všechna práva vyhrazena.
