# Cron Job Setup pro Vercel

## 1. Environment Variables

Přidejte do Vercel environment variables:

```bash
CRON_SECRET=your-secret-key-here
```

## 2. Vercel Cron Jobs

Cron job je nakonfigurován v `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-reset",
      "schedule": "0 4 * * *"
    }
  ]
}
```

- **Schedule**: `0 4 * * *` = každý den ve 4:00 ráno
- **Path**: `/api/cron/daily-reset` = endpoint pro cron job

## 3. Jak to funguje

1. **Každý den ve 4:00 ráno** Vercel zavolá `/api/cron/daily-reset`
2. **Endpoint resetuje** všechny uživatele s `daily_planning` workflow
3. **Pro každého uživatele** resetuje denní plán a uloží statistiky
4. **Čas resetu je pevně nastaven** na 4:00 ráno (nelze měnit v nastavení)

## 4. Testování

### Lokálně:
```bash
curl -X POST http://localhost:3000/api/cron/daily-reset \
  -H "Authorization: Bearer your-secret-key-here"
```

### Na produkci:
```bash
curl -X POST https://your-app.vercel.app/api/cron/daily-reset \
  -H "Authorization: Bearer your-secret-key-here"
```

## 5. Monitoring

Cron job logy najdete v:
- Vercel Dashboard → Functions → Cron Jobs
- Vercel Dashboard → Functions → Logs

## 6. Alternativní řešení

Pokud Vercel Cron Jobs nefungují, můžete použít:

### A) GitHub Actions
```yaml
name: Daily Reset
on:
  schedule:
    - cron: '0 * * * *'  # Every hour
jobs:
  reset:
    runs-on: ubuntu-latest
    steps:
      - name: Call Reset API
        run: |
          curl -X POST https://your-app.vercel.app/api/cron/daily-reset \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

### B) External Cron Service
- **cron-job.org**
- **EasyCron**
- **Cronitor**

### C) Serverless Functions
- **AWS Lambda + EventBridge**
- **Google Cloud Functions + Cloud Scheduler**
- **Azure Functions + Logic Apps**

## 7. Troubleshooting

### Cron job se nespouští:
1. Zkontrolujte `vercel.json` syntax
2. Zkontrolujte Vercel deployment logs
3. Zkontrolujte environment variables

### Cron job se spouští, ale nefunguje:
1. Zkontrolujte `CRON_SECRET` v environment variables
2. Zkontrolujte database connection
3. Zkontrolujte function logs v Vercel Dashboard

### Cron job se spouští příliš často:
1. Zkontrolujte `schedule` v `vercel.json`
2. Zkontrolujte timezone nastavení
3. Zkontrolujte logiku v endpointu
