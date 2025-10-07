# Automatické kroky - Nastavení

## Přehled
Systém automatických kroků umožňuje uživatelům vytvářet šablony kroků, které se pak automaticky generují podle nastavené frekvence.

## Jak to funguje

### 1. Vytvoření šablony kroku
- Uživatel vytvoří krok s typem, frekvencí a časem
- Systém automaticky označí krok jako šablonu (`is_automated = true`)
- Šablona se používá pro generování budoucích kroků

### 2. Automatické generování
- Cron job spouští generování každý den
- Systém kontroluje všechny šablony a generuje kroky podle frekvence
- Nové kroky se vytvářejí s `is_automated = true` a `automation_template_id`

### 3. Typy kroků
- **Update**: Pravidelné aktualizace
- **Revize**: Kontrola a revize
- **Vlastní**: Uživatelsky definovaný typ

### 4. Frekvence
- **Denně**: Každý den
- **Týdně**: Podle nastaveného dne v týdnu
- **Měsíčně**: Podle nastaveného dne v měsíci

## Nastavení Cron Jobu

### Vercel (doporučeno)
1. Přejděte do Vercel Dashboard
2. Vyberte váš projekt
3. Přejděte na "Functions" → "Cron Jobs"
4. Vytvořte nový cron job:
   - **URL**: `https://your-domain.vercel.app/api/cron/generate-steps`
   - **Schedule**: `0 6 * * *` (každý den v 6:00)
   - **Headers**: `Authorization: Bearer YOUR_CRON_SECRET`

### Environment Variables
Přidejte do `.env.local`:
```bash
CRON_SECRET=your-secret-key-here
```

### Manuální spuštění
```bash
curl -X POST https://your-domain.vercel.app/api/cesta/generate-automated-steps
```

## API Endpoints

### Generování automatických kroků
- **POST** `/api/cesta/generate-automated-steps`
- **POST** `/api/cron/generate-steps` (s autentizací)

### Vytvoření kroku
- **POST** `/api/cesta/daily-steps`
- Automaticky označí kroky jako šablony podle typu a frekvence

## Databázové změny

### Nové sloupce v `daily_steps`:
- `step_type`: 'update' | 'revision' | 'custom'
- `custom_type_name`: string (pro vlastní typy)
- `frequency`: 'daily' | 'weekly' | 'monthly'
- `frequency_time`: string (čas frekvence)
- `is_automated`: boolean (šablona nebo generovaný krok)
- `automation_template_id`: string (ID šablony pro generované kroky)

## Zobrazení v UI

### Barevné označení:
- **Update**: Modrá
- **Revize**: Zelená
- **Vlastní**: Fialová
- **Frekvence**: Oranžová (denně), Žlutá (týdně), Indigo (měsíčně)
- **Automatické**: Šedá s ikonou robota 🤖

### Místa zobrazení:
- Hlavní stránka (Další kroky)
- Stránka Kroky (kanban board)
- Detail cíle (související kroky)

## Testování

### 1. Vytvoření testovacího kroku
```javascript
// Vytvořte krok s frekvencí "weekly" a časem "Monday 10:00"
// Systém ho automaticky označí jako šablonu
```

### 2. Spuštění generování
```bash
curl -X POST http://localhost:3000/api/cesta/generate-automated-steps
```

### 3. Kontrola výsledků
- Zkontrolujte databázi pro nové kroky
- Ověřte správné nastavení `is_automated` a `automation_template_id`

## Troubleshooting

### Kroky se negenerují
1. Zkontrolujte, že existují šablony (`is_automated = true`)
2. Ověřte správnost frekvence a času
3. Zkontrolujte logy v konzoli

### Duplicitní kroky
- Systém kontroluje existenci kroků pro dané datum
- Duplicity by se neměly vytvářet

### Nesprávné datum
- Všechna data se ukládají v lokálním čase
- Kontrola se provádí podle lokálního času
