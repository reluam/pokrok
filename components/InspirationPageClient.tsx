'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Article, Category, InspirationIcon } from '@/lib/cms'
import InspirationIconComponent from '@/components/InspirationIcon'

interface InspirationPageClientProps {
  articles: Article[]
  categories: Category[]
}

export default function InspirationPageClient({ articles, categories }: InspirationPageClientProps) {
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
      thought: 'bg-[#FFFAF5] group-hover:from-slate-50 group-hover:to-slate-100/50',
      webpage: 'bg-[#FFFAF5] group-hover:from-purple-50 group-hover:to-purple-100/50',
      application: 'bg-[#FFFAF5] group-hover:from-indigo-50 group-hover:to-indigo-100/50',
      other: 'bg-[#FFFAF5] group-hover:from-gray-50 group-hover:to-gray-100/50'
    }
    return colorMap[icon] || 'bg-[#FFFAF5] group-hover:from-primary-50 group-hover:to-primary-100/50'
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
    return colorMap[icon] || 'border border-transparent group-hover:border-primary-300'
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
    return colorMap[icon] || 'from-primary-200/10 to-primary-300/10'
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
    return colorMap[icon] || 'bg-primary-100/50 group-hover:bg-primary-200/70 border border-primary-200 group-hover:border-primary-300'
  }

  // Function to get category colors based on icon type
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
    return colorMap[icon] || 'bg-primary-100/70 group-hover:bg-primary-200/90 group-hover:text-primary-900 border border-primary-200 group-hover:border-primary-300'
  }

  // Function to get card shape based on icon type
  const getCardShape = (icon: InspirationIcon) => {
    const shapeMap = {
      book: 'rounded-xl',
      video: 'rounded-xl',
      article: 'rounded-xl',
      thought: 'rounded-xl',
      webpage: 'rounded-xl',
      application: 'rounded-xl',
      other: 'rounded-xl'
    }
    return shapeMap[icon] || 'rounded-xl'
  }

  // Function to get card elements based on icon type
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
    return elementsMap[icon] || { progressBar: 'absolute bottom-0 left-0 right-0 h-1 bg-primary-200 rounded-b-xl group-hover:bg-primary-300 transition-colors duration-300' }
  }

  // Filter articles based on selected category and type
  const filterArticles = () => {
    let filtered = articles

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(article => 
        article.categories && article.categories.includes(selectedCategory)
      )
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(article => article.icon === selectedType)
    }

    setFilteredArticles(filtered)
  }

  // Update filtered articles when filters change
  React.useEffect(() => {
    filterArticles()
  }, [selectedCategory, selectedType, articles])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Inspirace</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Objevte zdroje inspirace, které vám pomohou na cestě k lepšímu životu
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-4 justify-center">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-primary-50 hover:text-primary-600 border border-gray-200'
              }`}
            >
              Všechny kategorie
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-primary-50 hover:text-primary-600 border border-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Type Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedType === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-primary-50 hover:text-primary-600 border border-gray-200'
              }`}
            >
              Všechny typy
            </button>
            {['book', 'video', 'article', 'thought', 'webpage', 'application'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type as InspirationIcon)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedType === type
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-primary-50 hover:text-primary-600 border border-gray-200'
                }`}
              >
                {type === 'book' ? 'Knihy' :
                 type === 'video' ? 'Videa' :
                 type === 'article' ? 'Články' :
                 type === 'thought' ? 'Myšlenky' :
                 type === 'webpage' ? 'Webové stránky' :
                 type === 'application' ? 'Aplikace' : type}
              </button>
            ))}
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => {
            const cardElements = getCardElements(article.icon)
            
            return (
              <Link
                key={article.id}
                href={`/inspirace/${article.slug}`}
                className={`group relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl ${getCardShape(article.icon)} ${getCardBackground(article.icon)} ${getCardBorder(article.icon)}`}
              >
                {/* Hover Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${getHoverOverlay(article.icon)} opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10`} />
                
                <div className="relative p-6 z-20">
                  {/* Icon and Title */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`p-3 rounded-xl ${getIconContainer(article.icon)}`}>
                      <InspirationIconComponent type={article.icon} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold text-gray-900 mb-2 ${getHoverTextColor(article.icon)}`}>
                        {article.title}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {article.detail}
                      </p>
                    </div>
                  </div>

                  {/* Categories */}
                  {article.categories && article.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {article.categories.map((categoryId) => {
                        const category = categories.find(cat => cat.id === categoryId)
                        return category ? (
                          <span
                            key={categoryId}
                            className={`px-3 py-1 rounded-full text-xs font-medium text-gray-600 ${getCategoryColors(article.icon)}`}
                          >
                            {category.name}
                          </span>
                        ) : null
                      })}
                    </div>
                  )}

                  {/* Resource Link */}
                  {article.resource && (
                    <div className="text-sm text-gray-500 mb-2">
                      {article.resourceTitle || 'Odkaz na zdroj'}
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                {cardElements.progressBar && (
                  <div className={cardElements.progressBar} />
                )}
              </Link>
            )
          })}
        </div>

        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Žádné inspirace nebyly nalezeny pro vybrané filtry.</p>
          </div>
        )}
      </div>
    </div>
  )
}
