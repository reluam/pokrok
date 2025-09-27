import { NextRequest, NextResponse } from 'next/server'
import { getArticleById, getArticleBySlug, saveArticle, deleteArticle, generateSlug } from '@/lib/cms'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Try to get by ID first, then by slug
    let article = getArticleById(params.id)
    if (!article) {
      article = getArticleBySlug(params.id)
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
    const body = await request.json()
    
    // Get existing article to preserve some fields
    const existingArticle = getArticleById(params.id)
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
    
    saveArticle(article)
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
    deleteArticle(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting article:', error)
    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 })
  }
}
