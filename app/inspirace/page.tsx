import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Image from 'next/image'
import Link from 'next/link'

async function getArticles() {
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

export default async function InspirationPage() {
  const articles = await getArticles()

  return (
    <main className="min-h-screen">
      <Header />
      
      {/* Page Header */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Inspirace
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore practical advice and empowering stories to support your personal growth and find meaning in your journey.
            </p>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article) => (
                <Link
                  key={article.id}
                  href={`/inspirace/${article.slug}`}
                  className="group"
                >
                  <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden h-full">
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
                    <div className="p-6 flex flex-col h-full">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                          {article.title}
                        </h3>
                        {article.excerpt && (
                          <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                            {article.excerpt}
                          </p>
                        )}
                      </div>
                      
                      {/* Article Meta */}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{article.category || 'Uncategorized'}</span>
                        <span>
                          {new Date(article.publishedAt).toLocaleDateString('cs-CZ')}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No articles yet</h3>
              <p className="text-gray-600">Check back soon for inspiring content!</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
