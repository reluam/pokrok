'use client'

import { useState, useEffect } from 'react'
import { Article, Category } from '@/lib/cms'
import { Plus, Edit, Trash2, Eye, FileText } from 'lucide-react'
import Link from 'next/link'
import InspirationIconComponent from '@/components/InspirationIcon'
import AdminLayout from '@/components/AdminLayout'

function ArticlesContent() {
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadArticles()
    loadCategories()
  }, [])

  const loadArticles = async () => {
    try {
      const response = await fetch('/api/articles')
      if (response.ok) {
        const allArticles = await response.json()
        setArticles(allArticles)
      } else {
        console.error('Failed to load articles')
      }
    } catch (error) {
      console.error('Error loading articles:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const allCategories = await response.json()
        setCategories(allCategories)
      } else {
        console.error('Failed to load categories')
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this article?')) {
      try {
        const response = await fetch(`/api/articles/${id}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          setArticles(articles.filter(article => article.id !== id))
        } else {
          alert('Error deleting article')
        }
      } catch (error) {
        console.error('Error deleting article:', error)
        alert('Error deleting article')
      }
    }
  }


  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading articles...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <Link
          href="/admin/articles/new"
          className="bg-primary-500 text-white px-6 py-3 rounded-xl hover:bg-primary-600 transition-colors flex items-center space-x-2 shadow-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>Nová inspirace/materiál</span>
        </Link>
      </div>

        {/* Articles List */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-primary-100">
          {articles.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-primary-600" />
              </div>
              <p className="text-gray-500 mb-4 font-asul">Zatím žádné inspirace a materiály</p>
              <Link
                href="/admin/articles/new"
                className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create your first inspiration</span>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {articles.map((article) => (
                <div key={article.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    {/* Left side - Icon and content */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0 mt-1">
                        <InspirationIconComponent type={article.icon} size="sm" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {article.title}
                          </h3>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {article.featured && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Featured
                              </span>
                            )}
                            <span className="text-xs text-gray-500">
                              {new Date(article.publishedAt).toLocaleDateString('cs-CZ')}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 truncate mb-2">
                          {article.detail}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {article.categories.map((categoryId, index) => {
                            const category = categories.find(cat => cat.id === categoryId)
                            return (
                              <span key={index} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                                {category?.name || categoryId}
                              </span>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Link
                        href={`/inspirace/${article.slug}`}
                        className="text-gray-400 hover:text-gray-600 p-1"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/admin/articles/edit/${article.id}`}
                        className="text-primary-600 hover:text-primary-900 p-1"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(article.id)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
    </div>
  )
}

export default function ArticlesPage() {
  return (
    <AdminLayout title="Inspirace" description="Spravujte články a inspirace">
      <ArticlesContent />
    </AdminLayout>
  )
}
