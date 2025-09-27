import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import InspirationIconComponent from '@/components/InspirationIcon'

async function getArticle(slug: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/articles/${slug}`, {
      cache: 'no-store' // Ensure fresh data
    })
    
    if (response.ok) {
      return await response.json()
    }
    return null
  } catch (error) {
    console.error('Error fetching article:', error)
    return null
  }
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await getArticle(params.slug)

  if (!article) {
    notFound()
  }

  return (
    <main className="min-h-screen">
      <Header />
      
      {/* Article Header */}
      <section className="pt-0 pb-5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/inspirace"
            className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Inspirace</span>
          </Link>

          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <InspirationIconComponent type={article.icon} size="lg" />
              <span className="inline-block bg-primary-100 text-primary-800 text-sm font-medium px-3 py-1 rounded-full">
                {article.category || 'Uncategorized'}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4 font-asul">
              {article.title}
            </h1>
            {article.detail && (
              <p className="text-xl text-gray-600 mb-6 font-asul">
                {article.detail}
              </p>
            )}
            <div className="text-sm text-gray-500">
              Published on {new Date(article.publishedAt).toLocaleDateString('cs-CZ')}
            </div>
          </div>

          {/* Article Image */}
          {article.image && (
            <div className="aspect-video bg-gray-200 relative overflow-hidden rounded-lg mb-12">
              <Image
                src={article.image}
                alt={article.title}
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>
      </section>

      {/* Article Content */}
      <section className="pt-0 pb-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Dynamic heading based on inspiration type */}
          {article.icon !== 'other' && article.icon !== 'thought' && (
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-h3">
              {article.icon === 'book' && 'O knize'}
              {article.icon === 'video' && 'O videu'}
              {article.icon === 'article' && 'O článku'}
              {article.icon === 'webpage' && 'O webové stránce'}
              {article.icon === 'application' && 'O aplikaci'}
            </h2>
          )}
          <div className="prose prose-lg max-w-none">
            <div 
              className="text-gray-700 leading-relaxed text-p16"
              dangerouslySetInnerHTML={{ 
                __html: article.content
                  .split('\n')
                  .map((line: string) => {
                    // Check if line starts with # (heading)
                    const headingMatch = line.match(/^(#{1,6})\s(.+)$/)
                    if (headingMatch) {
                      const level = headingMatch[1].length
                      const text = headingMatch[2]
                      return `<h${level} class="text-${level === 1 ? '3xl' : level === 2 ? '2xl' : 'xl'} font-bold text-gray-900 mb-${level === 1 ? '4' : level === 2 ? '3' : '2'} text-h3">${text}</h${level}>`
                    }
                    // Process bold and italic for non-heading lines
                    return line
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em>$1</em>')
                  })
                  .join('<br>')
              }}
            />
          </div>
        </div>
      </section>
        {/* Resource Section - Moved between header and content */}
        {article.resource && (
                <section className="py-8">
                  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <InspirationIconComponent type={article.icon} size="md" />
                          <div>
                            <h2 className="text-lg font-semibold text-text-primary font-asul">
                              {article.resourceTitle || 'Externí zdroj'}
                            </h2>
                            <p className="text-sm text-gray-600">
                              Prohlédněte si původní zdroj této inspirace
                            </p>
                          </div>
                        </div>
                        <a
                          href={article.resource}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm"
                        >
                          <span>Otevřít zdroj</span>
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                </section>
              )}
      <Footer />
    </main>
  )
}
