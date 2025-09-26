import { NextRequest, NextResponse } from 'next/server'
import { getAllArticles, getFeaturedArticles, saveArticle, generateSlug, generateId } from '@/lib/cms'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get('featured')
    
    let articles
    if (featured === 'true') {
      articles = getFeaturedArticles(parseInt(searchParams.get('limit') || '10'))
    } else {
      articles = getAllArticles()
    }
    
    return NextResponse.json(articles)
  } catch (error) {
    console.error('Error fetching articles:', error)
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const article = {
      id: generateId(),
      title: body.title,
      slug: generateSlug(body.title),
      excerpt: body.excerpt || '',
      content: body.content,
      image: body.image || undefined,
      category: body.category,
      publishedAt: new Date().toISOString(),
      featured: body.featured || false
    }
    
    saveArticle(article)
    return NextResponse.json(article, { status: 201 })
  } catch (error) {
    console.error('Error creating article:', error)
    return NextResponse.json({ error: 'Failed to create article' }, { status: 500 })
  }
}
