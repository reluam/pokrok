'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { Article, Category, InspirationIcon } from '@/lib/cms'
import InspirationIconComponent from '@/components/InspirationIcon'
import { useState, useEffect } from 'react'

interface InspirationPageProps {
  articles: Article[]
  categories: Category[]
}

function InspirationPageClient({ articles, categories }: InspirationPageProps) {
  const [filteredArticles, setFilteredArticles] = useState(articles)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<InspirationIcon | 'all'>('all')

  const iconTypes: { value: InspirationIcon | 'all'; label: string }[] = [
    { value: 'all', label: 'Všechny typy' },
    { value: 'book', label: 'Knihy' },
    { value: 'video', label: 'Videa' },
    { value: 'article', label: 'Články' },
    { value: 'thought', label: 'Myšlenky' },
    { value: 'webpage', label: 'Webové stránky' },
    { value: 'application', label: 'Aplikace' },
    { value: 'other', label: 'Ostatní' }
  ]

  useEffect(() => {
    let filtered = articles

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(article => article.categories.includes(selectedCategory))
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(article => article.icon === selectedType)
    }

    setFilteredArticles(filtered)
  }, [articles, selectedCategory, selectedType])

  return (
    <main className="min-h-screen">
      <Header />
      
      {/* Page Header */}
      <section className="pt-10 pb-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
              Inspirace
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore practical advice and empowering stories to support your personal growth and find meaning in your journey.
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* Category Filter */}
            <div className="flex flex-col sm:flex-row gap-2">
              <label className="text-sm font-medium text-gray-700 self-center">Kategorie:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">Všechny kategorie</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div className="flex flex-col sm:flex-row gap-2">
              <label className="text-sm font-medium text-gray-700 self-center">Typ:</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as InspirationIcon | 'all')}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {iconTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Inspirations Bibliothèque */}
      <section className="pt- 10 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredArticles.map((article: Article) => (
                <Link
                  key={article.id}
                  href={`/inspirace/${article.slug}`}
                  className="group"
                >
                  <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-4 border border-gray-200 hover:border-primary-300">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        <InspirationIconComponent type={article.icon} size="md" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-text-primary group-hover:text-primary-600 transition-colors line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {article.detail}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex flex-wrap gap-1">
                            {article.categories.map((categoryId, index) => {
                              const category = categories.find(cat => cat.id === categoryId)
                              return (
                                <span key={index} className="text-xs text-gray-400">
                                  {category?.name || categoryId}{index < article.categories.length - 1 && ', '}
                                </span>
                              )
                            })}
                          </div>
                          {article.resource && (
                            <span className="text-xs text-primary-600 group-hover:text-primary-700">
                              Zobrazit →
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <h3 className="text-xl font-semibold text-text-primary mb-2">Žádné inspirace nenalezeny</h3>
              <p className="text-gray-600">Zkuste změnit filtry nebo se vraťte později.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}

async function getArticles(): Promise<Article[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/articles`, {
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

export default async function InspirationPage() {
  const articles = await getArticles()
  const categories = await getCategories()

  return (
    <InspirationPageClient articles={articles} categories={categories} />
  )
}
