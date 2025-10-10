'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Hero, { AboutCoach } from '@/components/Hero'
import Services from '@/components/Services'
import Inspiration from '@/components/Inspiration'
import Footer from '@/components/Footer'
import { Article, Category } from '@/lib/cms'
import { getBaseUrl } from '@/lib/utils'

async function getArticles(): Promise<Article[]> {
  try {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/articles?featured=true&limit=2`, {
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

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [articlesData, categoriesData] = await Promise.all([
          getArticles(),
          getCategories()
        ])
        setArticles(articlesData)
        setCategories(categoriesData)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <main>
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="animate-pulse text-gray-500">Loading...</div>
        </div>
        <Footer />
      </main>
    )
  }

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
