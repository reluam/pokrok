import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL || 'postgresql://dummy:dummy@dummy/dummy')

export async function GET(request: NextRequest) {
  try {
    console.log('Starting admin tables migration...')

    // Create offer_sections table
    await sql`
      CREATE TABLE IF NOT EXISTS offer_sections (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        icon VARCHAR(50) NOT NULL,
        href VARCHAR(255) NOT NULL,
        enabled BOOLEAN DEFAULT true,
        "order" INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log('Created offer_sections table')

    // Create video_content table
    await sql`
      CREATE TABLE IF NOT EXISTS video_content (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        video_url VARCHAR(500) NOT NULL,
        thumbnail_url VARCHAR(500),
        embed_code TEXT,
        enabled BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log('Created video_content table')

    // Create coaching_packages table
    await sql`
      CREATE TABLE IF NOT EXISTS coaching_packages (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        subtitle VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        price VARCHAR(100) NOT NULL,
        duration VARCHAR(100) NOT NULL,
        features TEXT[] NOT NULL,
        color VARCHAR(50) NOT NULL,
        text_color VARCHAR(50) NOT NULL,
        border_color VARCHAR(50) NOT NULL,
        header_text_color VARCHAR(50) DEFAULT '',
        enabled BOOLEAN DEFAULT true,
        "order" INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log('Created coaching_packages table')

    // Create workshops table
    await sql`
      CREATE TABLE IF NOT EXISTS workshops (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        subtitle VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        price VARCHAR(100) NOT NULL,
        duration VARCHAR(100) NOT NULL,
        features TEXT[] NOT NULL,
        color VARCHAR(50) NOT NULL,
        text_color VARCHAR(50) NOT NULL,
        border_color VARCHAR(50) NOT NULL,
        header_text_color VARCHAR(50) DEFAULT '',
        enabled BOOLEAN DEFAULT true,
        "order" INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log('Created workshops table')

    // Create admin_settings table
    await sql`
      CREATE TABLE IF NOT EXISTS admin_settings (
        id VARCHAR(255) PRIMARY KEY,
        key VARCHAR(255) UNIQUE NOT NULL,
        value TEXT NOT NULL,
        type VARCHAR(50) NOT NULL,
        description TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log('Created admin_settings table')

    return NextResponse.json({ 
      success: true, 
      message: 'Admin tables migration completed successfully' 
    })
  } catch (error) {
    console.error('Error during admin tables migration:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Error during admin tables migration', 
      error: error instanceof Error ? error.message : String(error) 
    }, { status: 500 })
  }
}
