import fs from 'fs'
import path from 'path'

export interface Article {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  image?: string
  category: string
  publishedAt: string
  featured: boolean
}

const articlesDir = path.join(process.cwd(), 'data', 'articles')

// Ensure articles directory exists
if (!fs.existsSync(articlesDir)) {
  fs.mkdirSync(articlesDir, { recursive: true })
}

export function getAllArticles(): Article[] {
  try {
    if (!fs.existsSync(articlesDir)) {
      return []
    }
    
    const files = fs.readdirSync(articlesDir)
    const articles = files
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const filePath = path.join(articlesDir, file)
        const content = fs.readFileSync(filePath, 'utf8')
        return JSON.parse(content) as Article
      })
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    
    return articles
  } catch (error) {
    console.error('Error reading articles:', error)
    return []
  }
}

export function getArticleBySlug(slug: string): Article | null {
  try {
    const articles = getAllArticles()
    return articles.find(article => article.slug === slug) || null
  } catch (error) {
    console.error('Error getting article:', error)
    return null
  }
}

export function getFeaturedArticles(limit: number = 2): Article[] {
  const articles = getAllArticles()
  return articles.filter(article => article.featured).slice(0, limit)
}

export function saveArticle(article: Article): void {
  try {
    const filePath = path.join(articlesDir, `${article.id}.json`)
    fs.writeFileSync(filePath, JSON.stringify(article, null, 2))
  } catch (error) {
    console.error('Error saving article:', error)
    throw error
  }
}

export function deleteArticle(id: string): void {
  try {
    const filePath = path.join(articlesDir, `${id}.json`)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
  } catch (error) {
    console.error('Error deleting article:', error)
    throw error
  }
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}
