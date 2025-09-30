import Header from '@/components/Header'
import Footer from '@/components/Footer'
import InspirationPageClient from '@/components/InspirationPageClient'
import { getBaseUrl } from '@/lib/utils'
import { Article, Category } from '@/lib/cms'

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

  return (
    <main>
      <Header />
      <InspirationPageClient articles={articles} categories={categories} />
      <Footer />
    </main>
  )
}