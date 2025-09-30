'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { Article, Category, InspirationIcon } from '@/lib/cms'
import InspirationIconComponent from '@/components/InspirationIcon'
import { useState, useEffect } from 'react'
import { getBaseUrl } from '@/lib/utils'

interface InspirationPageProps {
  articles: Article[]
  categories: Category[]
}

function InspirationPageClient({ articles, categories }: InspirationPageProps) {
  const [filteredArticles, setFilteredArticles] = useState(articles)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<InspirationIcon | 'all'>('all')


  // Function to get hover text color based on icon type
  const getHoverTextColor = (icon: InspirationIcon) => {
    const colorMap = {
      book: 'group-hover:text-primary-700',
      video: 'group-hover:text-red-600',
      article: 'group-hover:text-amber-700',
      thought: 'group-hover:text-slate-700',
      webpage: 'group-hover:text-purple-600',
      application: 'group-hover:text-indigo-700',
      other: 'group-hover:text-gray-600'
    }
    return colorMap[icon] || 'group-hover:text-primary-600'
  }

  // Function to get category hover color based on icon type
  const getCategoryHoverColor = (icon: InspirationIcon) => {
    const colorMap = {
      book: 'group-hover:text-primary-600',
      video: 'group-hover:text-red-600',
      article: 'group-hover:text-amber-600',
      thought: 'group-hover:text-slate-600',
      webpage: 'group-hover:text-purple-600',
      application: 'group-hover:text-indigo-700',
      other: 'group-hover:text-gray-600'
    }
    return colorMap[icon] || 'group-hover:text-primary-600'
  }

  // Function to get card background colors based on icon type
  const getCardBackground = (icon: InspirationIcon) => {
    const colorMap = {
      book: 'bg-[#FFFAF5] group-hover:from-orange-50 group-hover:to-orange-100/50',
      video: 'bg-[#FFFAF5] group-hover:from-red-50 group-hover:to-red-100/50',
      article: 'bg-[#FFFAF5] group-hover:from-amber-50 group-hover:to-amber-100/50',
      thought: 'bg-[#FFFAF5] group-hover:from-slate-100 group-hover:to-slate-200',
      webpage: 'bg-[#FFFAF5] group-hover:from-purple-50 group-hover:to-purple-100/50',
      application: 'bg-[#FFFAF5] group-hover:from-indigo-50 group-hover:to-indigo-100/50',
      other: 'bg-[#FFFAF5] group-hover:from-gray-50 group-hover:to-gray-100/50'
    }
    return colorMap[icon] || 'bg-[#FFFAF5] group-hover:from-orange-50 group-hover:to-amber-100/50'
  }

  // Function to get card border colors based on icon type
  const getCardBorder = (icon: InspirationIcon) => {
    const colorMap = {
      book: 'border border-transparent group-hover:border-orange-300',
      video: 'border border-transparent group-hover:border-red-300',
      article: 'border border-transparent group-hover:border-amber-300',
      thought: 'border border-transparent group-hover:border-slate-300',
      webpage: 'border border-transparent group-hover:border-purple-300',
      application: 'border border-transparent group-hover:border-indigo-300',
      other: 'border border-transparent group-hover:border-gray-300'
    }
    return colorMap[icon] || 'border border-transparent group-hover:border-orange-300'
  }

  // Function to get hover overlay colors based on icon type
  const getHoverOverlay = (icon: InspirationIcon) => {
    const colorMap = {
      book: 'from-orange-200/10 to-orange-300/10',
      video: 'from-red-200/10 to-red-300/10',
      article: 'from-amber-200/10 to-amber-300/10',
      thought: 'from-slate-200/10 to-slate-300/10',
      webpage: 'from-purple-200/10 to-purple-300/10',
      application: 'from-indigo-200/10 to-indigo-300/10',
      other: 'from-gray-200/10 to-gray-300/10'
    }
    return colorMap[icon] || 'from-orange-200/10 to-amber-300/10'
  }

  // Function to get icon container colors based on icon type
  const getIconContainer = (icon: InspirationIcon) => {
    const colorMap = {
      book: 'bg-orange-100/50 group-hover:bg-orange-200/70 border border-orange-200 group-hover:border-orange-300',
      video: 'bg-red-100/50 group-hover:bg-red-200/70 border border-red-200 group-hover:border-red-300',
      article: 'bg-amber-100/50 group-hover:bg-amber-200/70 border border-amber-200 group-hover:border-amber-300',
      thought: 'bg-slate-100/50 group-hover:bg-slate-200/70 border border-slate-200 group-hover:border-slate-300',
      webpage: 'bg-purple-100/50 group-hover:bg-purple-200/70 border border-purple-200 group-hover:border-purple-300',
      application: 'bg-indigo-100/50 group-hover:bg-indigo-200/70 border border-indigo-200 group-hover:border-indigo-300',
      other: 'bg-gray-100/50 group-hover:bg-gray-200/70 border border-gray-200 group-hover:border-gray-300'
    }
    return colorMap[icon] || 'bg-orange-100/50 group-hover:bg-orange-200/70 border border-orange-200 group-hover:border-orange-300'
  }

  // Function to get category tag colors based on icon type
  const getCategoryColors = (icon: InspirationIcon) => {
    const colorMap = {
      book: 'bg-orange-100/70 group-hover:bg-orange-200/90 group-hover:text-orange-900 border border-orange-200 group-hover:border-orange-300',
      video: 'bg-red-100/70 group-hover:bg-red-200/90 group-hover:text-red-900 border border-red-200 group-hover:border-red-300',
      article: 'bg-amber-100/70 group-hover:bg-amber-200/90 group-hover:text-amber-900 border border-amber-200 group-hover:border-amber-300',
      thought: 'bg-slate-100/70 group-hover:bg-slate-200/90 group-hover:text-slate-900 border border-slate-200 group-hover:border-slate-300',
      webpage: 'bg-purple-100/70 group-hover:bg-purple-200/90 group-hover:text-purple-900 border border-purple-200 group-hover:border-purple-300',
      application: 'bg-indigo-100/70 group-hover:bg-indigo-200/90 group-hover:text-indigo-900 border border-indigo-200 group-hover:border-indigo-300',
      other: 'bg-gray-100/70 group-hover:bg-gray-200/90 group-hover:text-gray-900 border border-gray-200 group-hover:border-gray-300'
    }
    return colorMap[icon] || 'bg-orange-100/70 group-hover:bg-orange-200/90 group-hover:text-orange-900 border border-orange-200 group-hover:border-orange-300'
  }

  // Function to get card shape and styling based on icon type
  const getCardShape = (icon: InspirationIcon) => {
    const shapeMap = {
      book: 'rounded-xl shadow-sm hover:shadow-md transform hover:scale-102 transition-all duration-300',
      video: 'rounded-xl shadow-sm hover:shadow-md transform hover:scale-102 transition-all duration-300',
      article: 'rounded-xl shadow-sm hover:shadow-md transform hover:scale-102 transition-all duration-300',
      thought: 'rounded-xl shadow-sm hover:shadow-md transform hover:scale-102 transition-all duration-300',
      webpage: 'rounded-xl shadow-sm hover:shadow-md transform hover:scale-102 transition-all duration-300',
      application: 'rounded-xl shadow-sm hover:shadow-md transform hover:scale-102 transition-all duration-300',
      other: 'rounded-xl shadow-sm hover:shadow-md transform hover:scale-102 transition-all duration-300'
    }
    return shapeMap[icon] || 'rounded-xl shadow-sm hover:shadow-md transform hover:scale-102 transition-all duration-300'
  }

  // Function to get card-specific visual elements
  const getCardElements = (icon: InspirationIcon) => {
    const elementsMap = {
      book: {
        progressBar: 'absolute bottom-0 left-0 right-0 h-1 bg-orange-200 rounded-b-xl group-hover:bg-orange-300 transition-colors duration-300'
      },
      video: {
        progressBar: 'absolute bottom-0 left-0 right-0 h-1 bg-red-200 rounded-b-xl group-hover:bg-red-300 transition-colors duration-300'
      },
      article: {
        progressBar: 'absolute bottom-0 left-0 right-0 h-1 bg-amber-200 rounded-b-xl group-hover:bg-amber-300 transition-colors duration-300'
      },
      thought: {
        progressBar: 'absolute bottom-0 left-0 right-0 h-1 bg-slate-200 rounded-b-xl group-hover:bg-slate-300 transition-colors duration-300'
      },
      webpage: {
        progressBar: 'absolute bottom-0 left-0 right-0 h-1 bg-purple-200 rounded-b-xl group-hover:bg-purple-300 transition-colors duration-300'
      },
      application: {
        progressBar: 'absolute bottom-0 left-0 right-0 h-1 bg-indigo-200 rounded-b-xl group-hover:bg-indigo-300 transition-colors duration-300'
      },
      other: {
        progressBar: 'absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b-xl group-hover:bg-gray-300 transition-colors duration-300'
      }
    }
    return elementsMap[icon] || {}
  }

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredArticles.map((article: Article) => (
                <Link
                  key={article.id}
                  href={`/inspirace/${article.slug}`}
                  className="group"
                >
                  <div className={`${getCardBackground(article.icon)} ${getCardShape(article.icon)} p-6 border-2 ${getCardBorder(article.icon)} relative overflow-hidden`}>
                    {/* Icon-based overlay on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${getHoverOverlay(article.icon)} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                    
                    {/* Card-specific visual elements */}
                    <div className={(getCardElements(article.icon) as any).progressBar}></div>
                    
                    <div className="relative z-10">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 mt-1">
                          <div className={`p-3 rounded-xl bg-gradient-to-br ${getIconContainer(article.icon)} shadow-sm group-hover:shadow-lg group-hover:scale-105 transition-all duration-300 video-animation`}>
                            <InspirationIconComponent type={article.icon} size="md" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className={`text-h4 text-text-primary transition-colors line-clamp-2 group-hover:text-gray-900 ${getHoverTextColor(article.icon)}`}>
                            {article.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-2 line-clamp-3 leading-relaxed">
                            {article.detail}
                          </p>
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex flex-wrap gap-2">
                              <span className={`text-xs font-medium text-gray-500 ${getCategoryHoverColor(article.icon)} transition-colors duration-200`}>
                                {article.categories.map((categoryId, index) => {
                                  const category = categories.find(cat => cat.id === categoryId)
                                  return (category?.name || categoryId) + (index < article.categories.length - 1 ? ', ' : '')
                                }).join('')}
                              </span>
                            </div>
                            {article.resource && (
                              <span className="text-sm font-medium text-primary-600 group-hover:text-primary-700 flex items-center gap-1 transition-colors duration-200">
                                <svg className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </span>
                            )}
                          </div>
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
    <InspirationPageClient articles={articles} categories={categories} />
  )
}
