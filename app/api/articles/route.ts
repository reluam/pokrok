import { NextRequest, NextResponse } from 'next/server'
import { getAllArticles, getFeaturedArticles, saveArticle, generateSlug, generateId } from '@/lib/cms-db'
import { initializeDatabase } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    // Initialize database if needed
    await initializeDatabase()
    
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get('featured')
    
    let articles
    if (featured === 'true') {
      articles = await getFeaturedArticles(parseInt(searchParams.get('limit') || '10'))
    } else {
      articles = await getAllArticles()
    }
    
    return NextResponse.json(articles)
  } catch (error) {
    console.error('Error fetching articles:', error)
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Initialize database if needed
    await initializeDatabase()
    
    const body = await request.json()
    
    const article = {
      id: generateId(),
      title: body.title,
      slug: generateSlug(body.title),
      content: body.content,
      image: body.image || undefined,
      categories: body.categories || [], // Handle multiple categories
      publishedAt: new Date().toISOString(),
      featured: body.featured || false,
      // New inspiration fields
      icon: body.icon,
      detail: body.detail,
      resource: body.resource || undefined,
      resourceTitle: body.resourceTitle || undefined
    }
    
    await saveArticle(article)
    return NextResponse.json(article, { status: 201 })
  } catch (error) {
    console.error('Error creating article:', error)
    return NextResponse.json({ 
      error: 'Failed to create article',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
