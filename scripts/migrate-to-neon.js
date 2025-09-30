#!/usr/bin/env node

/**
 * Migration script to move articles from JSON files to Neon database
 * Run with: node scripts/migrate-to-neon.js
 */

const fs = require('fs')
const path = require('path')
const { neon } = require('@neondatabase/serverless')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL)

async function migrateArticles() {
  try {
    console.log('🚀 Starting migration to Neon database...')
    
    // Initialize database
    console.log('📊 Initializing database schema...')
    await sql`
      CREATE TABLE IF NOT EXISTS articles (
        id VARCHAR(255) PRIMARY KEY,
        title TEXT NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        content TEXT,
        image TEXT,
        categories JSONB DEFAULT '[]',
        published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        featured BOOLEAN DEFAULT FALSE,
        icon VARCHAR(50) NOT NULL,
        detail TEXT NOT NULL,
        resource TEXT,
        resource_title TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        color VARCHAR(7),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `

    // Insert default categories
    console.log('📂 Setting up default categories...')
    await sql`
      INSERT INTO categories (id, name, slug, color) VALUES
      ('cile', 'Cíle', 'cile', '#3B82F6'),
      ('planovani', 'Plánování', 'planovani', '#10B981'),
      ('aktualni-stav', 'Aktuální stav', 'aktualni-stav', '#F59E0B'),
      ('revize', 'Revize', 'revize', '#EF4444'),
      ('jine', 'Jiné', 'jine', '#6B7280')
      ON CONFLICT (id) DO NOTHING
    `

    // Migrate articles from JSON files
    console.log('📄 Migrating articles from JSON files...')
    const articlesDir = path.join(process.cwd(), 'data', 'articles')
    
    if (fs.existsSync(articlesDir)) {
      const files = fs.readdirSync(articlesDir).filter(file => file.endsWith('.json'))
      
      for (const file of files) {
        try {
          const filePath = path.join(articlesDir, file)
          const articleData = JSON.parse(fs.readFileSync(filePath, 'utf8'))
          
          await sql`
            INSERT INTO articles (
              id, title, slug, content, image, categories, 
              published_at, featured, icon, detail, resource, resource_title
            ) VALUES (
              ${articleData.id}, ${articleData.title}, ${articleData.slug}, 
              ${articleData.content || ''}, ${articleData.image || null}, 
              ${JSON.stringify(articleData.categories || [])}, 
              ${articleData.publishedAt}, ${articleData.featured || false}, 
              ${articleData.icon}, ${articleData.detail}, 
              ${articleData.resource || null}, ${articleData.resourceTitle || null}
            )
            ON CONFLICT (id) DO UPDATE SET
              title = EXCLUDED.title,
              slug = EXCLUDED.slug,
              content = EXCLUDED.content,
              image = EXCLUDED.image,
              categories = EXCLUDED.categories,
              published_at = EXCLUDED.published_at,
              featured = EXCLUDED.featured,
              icon = EXCLUDED.icon,
              detail = EXCLUDED.detail,
              resource = EXCLUDED.resource,
              resource_title = EXCLUDED.resource_title,
              updated_at = NOW()
          `
          
          console.log(`✅ Migrated: ${articleData.title}`)
        } catch (error) {
          console.error(`❌ Error migrating file ${file}:`, error.message)
        }
      }
    }

    console.log('🎉 Migration completed successfully!')
    console.log('💡 You can now safely delete the data/articles folder if you want.')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

// Run migration
migrateArticles()
