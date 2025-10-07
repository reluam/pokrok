import { Article, Category } from '@/lib/cms'
import { getBaseUrl } from '@/lib/utils'
import MaterialyPageClient from '@/components/MaterialyPageClient'

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

export default async function MaterialyPage() {
  const articles = await getArticles()
  const categories = await getCategories()

  return <MaterialyPageClient articles={articles} categories={categories} />
}