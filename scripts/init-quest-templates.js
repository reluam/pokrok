const { sql } = require('@vercel/postgres')

async function initQuestTemplates() {
  try {
    console.log('Initializing quest templates...')

    // Insert quest templates
    await sql`
      INSERT INTO quest_templates (id, title, description, type, xp_reward, coin_reward, cost, category, difficulty, created_at) VALUES
      ('daily-meditation', 'Denní meditace', 'Meditujte 10 minut', 'daily', 50, 10, 0, 'wellness', 'easy', NOW()),
      ('daily-exercise', 'Denní cvičení', 'Cvičte 30 minut', 'daily', 75, 15, 0, 'fitness', 'medium', NOW()),
      ('daily-reading', 'Denní čtení', 'Přečtěte 20 stránek knihy', 'daily', 60, 12, 0, 'learning', 'easy', NOW()),
      ('weekly-goal-review', 'Týdenní přehled cílů', 'Zkontrolujte a aktualizujte své cíle', 'weekly', 100, 25, 0, 'planning', 'medium', NOW()),
      ('weekly-reflection', 'Týdenní reflexe', 'Napište reflexi o uplynulém týdnu', 'weekly', 80, 20, 0, 'mindfulness', 'medium', NOW()),
      ('special-30-day-challenge', '30denní výzva', 'Dokončete 30denní výzvu podle vašeho výběru', 'special', 500, 100, 50, 'challenge', 'hard', NOW()),
      ('special-value-focus', 'Týdenní zaměření na hodnotu', 'Zaměřte se na jednu ze svých hodnot celý týden', 'special', 200, 40, 25, 'values', 'medium', NOW()),
      ('special-skill-learning', 'Naučte se novou dovednost', 'Začněte se učit novou dovednost', 'special', 300, 60, 35, 'learning', 'hard', NOW()),
      ('premium-mastery-quest', 'Mistrovská výzva', 'Dokončete komplexní projekt za 3 měsíce', 'special', 1000, 200, 100, 'mastery', 'expert', NOW()),
      ('premium-life-transformation', 'Transformace života', 'Proveďte významnou změnu ve svém životě', 'special', 1500, 300, 150, 'transformation', 'expert', NOW())
      ON CONFLICT (id) DO NOTHING
    `

    console.log('Quest templates initialized successfully!')
  } catch (error) {
    console.error('Error initializing quest templates:', error)
  }
}

initQuestTemplates()
