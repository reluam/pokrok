import Header from '@/components/Header'
import Hero from '@/components/Hero'
import Services from '@/components/Services'
import Inspiration from '@/components/Inspiration'
import Footer from '@/components/Footer'
import { Article } from '@/lib/cms'

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

export default async function Home() {
  const articles = await getArticles()

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Hero />
      <Services />
      <Inspiration articles={articles} />
      <Footer />
    </main>
  )
}
