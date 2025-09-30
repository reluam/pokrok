import Header from '@/components/Header'
import Hero, { AboutCoach } from '@/components/Hero'
import Services from '@/components/Services'
import Inspiration from '@/components/Inspiration'
import Footer from '@/components/Footer'
import { Article, Category } from '@/lib/cms'

async function getArticles(): Promise<Article[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/articles?featured=true&limit=2`, {
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
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/categories`, {
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

export default async function Home() {
  // Fetch articles and categories from database
  const articles = await getArticles()
  const categories = await getCategories()

  return (
    <main>
      <Header />
      <Hero />
      <AboutCoach />
      <Services />
      <Inspiration articles={articles} categories={categories} />
      <Footer />
    </main>
  )
}
