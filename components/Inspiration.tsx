'use client'

import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Article } from '@/lib/cms'

interface InspirationProps {
  articles: Article[]
}

export default function Inspiration({ articles }: InspirationProps) {
  return (
    <section id="inspirace" className="py-20 textured-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-12">
          <div className="mb-8 lg:mb-0">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Inspirace
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl">
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

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {articles.slice(0, 2).map((article) => (
            <Link
              key={article.id}
              href={`/inspirace/${article.slug}`}
              className="group"
            >
              <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                {/* Article Image */}
                <div className="aspect-video bg-gray-200 relative overflow-hidden">
                  {article.image ? (
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <div className="text-gray-500 text-sm">No image</div>
                    </div>
                  )}
                </div>
                
                {/* Article Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {article.title}
                  </h3>
                  {article.excerpt && (
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {article.excerpt}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
