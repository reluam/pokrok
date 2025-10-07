import { NextResponse } from 'next/server'
import { initializeAdminTables } from '@/lib/admin-db'
import { sql } from '@vercel/postgres'

export async function POST() {
  try {
    // Initialize the admin tables
    await initializeAdminTables()

    // Check if we need to seed default data
    const { rows: existingPackages } = await sql`SELECT COUNT(*) as count FROM coaching_packages`
    const { rows: existingSections } = await sql`SELECT COUNT(*) as count FROM offer_sections`

    if (parseInt(existingPackages[0].count) === 0) {
      console.log('Seeding default coaching packages...')
      
      const now = new Date().toISOString()
      
      // Seed default coaching packages
      await sql`
        INSERT INTO coaching_packages (
          id, title, subtitle, description, price, duration, features, 
          color, text_color, border_color, header_text_color, enabled, "order", created_at, updated_at
        ) VALUES 
        (
          'koucovy-balicek',
          'Koučovací balíček',
          'Plně přizpůsobitelný',
          'Komplexní koučovací program na míru - od 6 sezení, s individuálním přístupem a cenou',
          'Cena na domluvě',
          'Od 6 sezení',
          ${JSON.stringify([
            'První konzultace zdarma (30 min)',
            'Minimálně 6 sezení',
            'Individuální frekvence a délka',
            'Flexibilní cena podle vašich možností',
            'E-mailová podpora mezi sezeními',
            'Materiály a cvičení na míru'
          ])},
          'bg-primary-500',
          'text-primary-500',
          'border-primary-500',
          'text-white',
          true,
          1,
          ${now},
          ${now}
        ),
        (
          'jednorazovy-koucink',
          'Jednorázový koučing',
          '1 sezení',
          'Jednotlivé koučovací sezení pro řešení konkrétních výzev',
          '2 500 Kč',
          '60 minut',
          ${JSON.stringify([
            'Fokus na konkrétní téma',
            'Okamžité praktické řešení',
            'Individuální přístup',
            'Materiály k sezení',
            'E-mailová podpora 7 dní'
          ])},
          'bg-primary-100',
          'text-primary-600',
          'border-primary-500',
          'text-primary-500',
          true,
          2,
          ${now},
          ${now}
        ),
        (
          'vstupni-konzultace',
          'Zkušební hodina zdarma',
          '1 hodina',
          'Vyzkoušejte si koučing zdarma a uvidíte, zda vám vyhovuje. Plnohodnotné sezení bez závazků.',
          'Zdarma',
          '60 minut',
          ${JSON.stringify([
            'Plnohodnotné koučovací sezení',
            'Praktické ukázky technik',
            'Seznámení s koučovacím procesem',
            'Definování vašich cílů',
            'Doporučení dalšího postupu',
            'Bez závazků'
          ])},
          'bg-green-500',
          'text-green-500',
          'border-green-500',
          'text-white',
          true,
          3,
          ${now},
          ${now}
        )
      `
    }

    if (parseInt(existingSections[0].count) === 0) {
      console.log('Seeding default offer sections...')
      
      const now = new Date().toISOString()
      
      // Seed default offer sections
      await sql`
        INSERT INTO offer_sections (
          id, title, description, icon, href, enabled, "order", created_at, updated_at
        ) VALUES 
        (
          'inspirace',
          'Inspirace',
          'Gain focus, overcome obstacles, and take clear steps toward a fulfilling and meaningful life.',
          'Lightbulb',
          '/inspirace',
          true,
          1,
          ${now},
          ${now}
        ),
        (
          'zdroje',
          'Zdroje',
          'Discover your strengths, refine your skills, and confidently pursue the career you''ve always wanted.',
          'Flag',
          '#zdroje',
          true,
          2,
          ${now},
          ${now}
        ),
        (
          'koucink',
          'Koučing',
          'Develop a resilient mindset, embrace challenges, and create sustainable habits for long-term success.',
          'MessageCircle',
          '/koucink',
          true,
          3,
          ${now},
          ${now}
        )
      `
    }

    return NextResponse.json({ 
      message: 'Admin database initialized successfully',
      packagesSeeded: parseInt(existingPackages[0].count) === 0,
      sectionsSeeded: parseInt(existingSections[0].count) === 0
    })
    
  } catch (error) {
    console.error('Error initializing admin database:', error)
    return NextResponse.json(
      { error: 'Failed to initialize admin database' },
      { status: 500 }
    )
  }
}

