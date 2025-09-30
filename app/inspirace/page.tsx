import { Article, Category } from '@/lib/cms'
import { getBaseUrl } from '@/lib/utils'
import InspirationPageClient from '@/components/InspirationPageClient'

async function getArticles(): Promise<Article[]> {
  try {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/articles`, {
      cache: 'no-store' // Ensure fresh data
    })
    
    if (response.ok) {
      return await response.json()
    }
    return []
  } catch (error) {
    console.error('Error fetching articles:', error)
    return []
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/categories`, {
      cache: 'no-store' // Ensure fresh data
    })
    
    if (response.ok) {
      return await response.json()
    }
    return []
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

export default async function InspirationPage() {
  const articles = await getArticles()
  const categories = await getCategories()

  return <InspirationPageClient articles={articles} categories={categories} />
}