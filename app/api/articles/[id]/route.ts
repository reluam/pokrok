import { NextRequest, NextResponse } from 'next/server'
import { getArticleBySlug, saveArticle, deleteArticle } from '@/lib/cms'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const article = getArticleBySlug(params.id)
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
    
    const article = {
      id: params.id,
      title: body.title,
      slug: body.slug,
      excerpt: body.excerpt || '',
      content: body.content,
      image: body.image || undefined,
      category: body.category,
      publishedAt: body.publishedAt,
      featured: body.featured || false
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
