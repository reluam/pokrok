import { NextRequest, NextResponse } from 'next/server'
import { getArticleById, getArticleBySlug, saveArticle, deleteArticle, generateSlug } from '@/lib/cms-db'
import { initializeDatabase } from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if DATABASE_URL is available
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }
    
    // Initialize database if needed
    await initializeDatabase()
    
    // Try to get by ID first, then by slug
    let article = await getArticleById(params.id)
    if (!article) {
      article = await getArticleBySlug(params.id)
    }
    
    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }
    return NextResponse.json(article)
  } catch (error) {
    console.error('Error fetching article:', error)
    return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if DATABASE_URL is available
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ 
        error: 'Database not configured. Please set DATABASE_URL environment variable.' 
      }, { status: 503 })
    }
    
    // Initialize database if needed
    await initializeDatabase()
    
    const body = await request.json()
    
    // Get existing article to preserve some fields
    const existingArticle = await getArticleById(params.id)
    if (!existingArticle) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }
    
    const article = {
      id: params.id,
      title: body.title,
      slug: generateSlug(body.title), // Generate new slug from title
      content: body.content,
      image: body.image || undefined,
      categories: body.categories || [], // Handle multiple categories
      publishedAt: existingArticle.publishedAt, // Keep original publish date
      featured: body.featured || false,
      // New inspiration fields
      icon: body.icon,
      detail: body.detail,
      resource: body.resource || undefined,
      resourceTitle: body.resourceTitle || undefined
    }
    
    await saveArticle(article)
    return NextResponse.json(article)
  } catch (error) {
    console.error('Error updating article:', error)
    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if DATABASE_URL is available
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ 
        error: 'Database not configured. Please set DATABASE_URL environment variable.' 
      }, { status: 503 })
    }
    
    // Initialize database if needed
    await initializeDatabase()
    
    await deleteArticle(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting article:', error)
    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 })
  }
}
