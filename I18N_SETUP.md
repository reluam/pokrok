# Internacionalizace (i18n) - Pokrok App

## Přehled

Aplikace Pokrok nyní podporuje dva jazyky:
- **Čeština (cs)** - výchozí jazyk
- **Angličtina (en)** - nově přidaný jazyk

## Struktura

### Jazykové soubory
```
locales/
├── cs/
│   └── common.json    # České překlady
└── en/
    └── common.json    # Anglické překlady
```

### URL struktura
- Česká verze: `https://domain.com/` nebo `https://domain.com/cs/`
- Anglická verze: `https://domain.com/en/`

## Použití

### 1. Přepínání jazyků
Uživatelé mohou přepínat jazyky pomocí přepínače v hlavičce aplikace (ikona zeměkoule).

### 2. Automatická detekce
Next.js automaticky detekuje preferovaný jazyk uživatele na základě:
- Nastavení prohlížeče
- Accept-Language header
- Geolokace

### 3. Trvalé uložení
Vybraný jazyk se ukládá do cookies a pamatuje si ho pro další návštěvy.

## Technické detaily

### Next.js konfigurace
```javascript
// next.config.js
const nextConfig = {
  i18n: {
    locales: ['cs', 'en'],
    defaultLocale: 'cs',
    localeDetection: true,
  },
}
```

### Načítání překladů
```typescript
import { loadTranslations, type Translations } from '@/lib/i18n'

// V komponentě
const [translations, setTranslations] = useState<Translations | null>(null)

useEffect(() => {
  const loadTranslationsData = async () => {
    const locale = (router.locale || 'cs') as 'cs' | 'en'
    const t = await loadTranslations(locale)
    setTranslations(t)
  }
  
  if (router.locale) {
    loadTranslationsData()
  }
}, [router.locale])
```

### Použití překladů
```tsx
{translations?.hero.title || 'Fallback text'}
```

## Přidávání nových překladů

### 1. Aktualizace typů
Nejdříve přidejte nové klíče do `lib/i18n.ts`:
```typescript
export interface Translations {
  // ... existující klíče
  newSection: {
    newKey: string
  }
}
```

### 2. Přidání překladů
Přidejte překlady do obou jazykových souborů:

**locales/cs/common.json**
```json
{
  "newSection": {
    "newKey": "Český překlad"
  }
}
```

**locales/en/common.json**
```json
{
  "newSection": {
    "newKey": "English translation"
  }
}
```

### 3. Použití v komponentách
```tsx
{translations?.newSection.newKey || 'Fallback'}
```

## Přidávání nových jazyků

### 1. Aktualizace Next.js konfigurace
```javascript
// next.config.js
const nextConfig = {
  i18n: {
    locales: ['cs', 'en', 'de'], // Přidat nový jazyk
    defaultLocale: 'cs',
    localeDetection: true,
  },
}
```

### 2. Vytvoření překladových souborů
```
locales/
├── cs/
├── en/
└── de/          # Nový jazyk
    └── common.json
```

### 3. Aktualizace typů
```typescript
export type Locale = 'cs' | 'en' | 'de'
```

### 4. Přidání do LanguageSwitcher
```typescript
const languages = [
  { code: 'cs' as Locale, name: 'Čeština', flag: '🇨🇿' },
  { code: 'en' as Locale, name: 'English', flag: '🇺🇸' },
  { code: 'de' as Locale, name: 'Deutsch', flag: '🇩🇪' } // Nový jazyk
]
```

## SEO a metadata

### Dynamické metadata
Pro lepší SEO můžete přidat dynamické metadata podle jazyka:

```typescript
export async function generateMetadata({ params }: { params: { locale: string } }) {
  const translations = await loadTranslations(params.locale as Locale)
  
  return {
    title: translations.hero.title,
    description: translations.hero.subtitle,
  }
}
```

## Testování

### Lokální testování
1. Spusťte dev server: `npm run dev`
2. Navštivte `http://localhost:3000` (čeština)
3. Navštivte `http://localhost:3000/en` (angličtina)
4. Otestujte přepínání jazyků pomocí přepínače

### Produkční testování
1. Deploy aplikace
2. Otestujte automatickou detekci jazyka
3. Otestujte přepínání jazyků
4. Ověřte, že se jazyk pamatuje mezi návštěvami

## Poznámky

- Všechny překlady jsou načítány dynamicky pro lepší výkon
- Fallback texty jsou zobrazeny během načítání překladů
- Překlady jsou cachovány pro lepší výkon
- Jazykové preference jsou uloženy v cookies
