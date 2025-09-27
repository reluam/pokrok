'use client'

import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { Article, Category } from '@/lib/cms'
import InspirationIconComponent from '@/components/InspirationIcon'

interface InspirationProps {
  articles: Article[]
  categories: Category[]
}

export default function Inspiration({ articles, categories }: InspirationProps) {
  return (
    <section id="inspirace" className="py-20">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-12">
          <div className="mb-8 lg:mb-0">
                <h2 className="text-h2 text-text-primary mb-4">
                  Inspirace
                </h2>
                <p className="text-p18 text-gray-600 max-w-2xl">
                  Explore practical advice and empowering stories to support your personal growth.
                </p>
          </div>
          
          <div>
            <Link
              href="/inspirace"
              className="inline-flex items-center space-x-2 bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors"
            >
              <span>See more</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Featured Inspirations Bibliothèque */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {articles.slice(0, 4).map((article: Article) => (
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
      </div>
    </section>
  )
}
