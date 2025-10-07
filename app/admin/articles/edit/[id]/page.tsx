'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import { InspirationIcon, Category, Article, ExperienceLevel } from '@/lib/cms'

export default function EditArticlePage() {
  const router = useRouter()
  const params = useParams()
  const articleId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categories: [] as string[], // Changed to array for multiple categories
    image: '',
    featured: false,
    icon: 'book' as InspirationIcon,
    detail: '',
    resource: '',
    resourceTitle: '',
    downloadUrl: '',
    fileSize: '',
    isDownloadable: false,
    experienceLevel: 'beginner' as ExperienceLevel
  })

  useEffect(() => {
    // Fetch categories and article data
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoriesResponse = await fetch('/api/categories')
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json()
          setCategories(categoriesData)
        }

        // Fetch article data
        const articleResponse = await fetch(`/api/articles/${articleId}`)
        if (articleResponse.ok) {
          const article: Article = await articleResponse.json()
          setFormData({
            title: article.title,
            content: article.content,
            categories: article.categories || [], // Handle multiple categories
            image: article.image || '',
            featured: article.featured,
            icon: article.icon,
            detail: article.detail,
            resource: article.resource || '',
            resourceTitle: article.resourceTitle || '',
            downloadUrl: article.downloadUrl || '',
            fileSize: article.fileSize || '',
            isDownloadable: article.isDownloadable || false,
            experienceLevel: article.experienceLevel || 'beginner'
          })
        } else {
          console.error('Failed to load article')
          router.push('/admin/articles')
        }
      } catch (error) {
        console.error('Error loading data:', error)
        router.push('/admin/articles')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [articleId, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        router.push('/admin/articles')
      } else {
        const error = await response.json()
        alert(`Error updating inspiration: ${error.error}`)
      }
    } catch (error) {
      console.error('Error updating inspiration:', error)
      alert('Error updating inspiration')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      categories: checked 
        ? [...prev.categories, categoryId]
        : prev.categories.filter(id => id !== categoryId)
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading inspiration...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link
            href="/admin/articles"
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Edit Inspiration</h1>
            <p className="text-gray-600 mt-2">Update inspiration details and content</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter inspiration title"
              />
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categories *
              </label>
              <div className="space-y-2">
                {categories.map((category) => (
                  <label key={category.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.categories.includes(category.id)}
                      onChange={(e) => handleCategoryChange(category.id, e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{category.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="icon" className="block text-sm font-medium text-gray-700 mb-2">
                Icon Type *
              </label>
              <select
                id="icon"
                name="icon"
                required
                value={formData.icon}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="book">📚 Kniha</option>
                <option value="article">📄 Článek</option>
                <option value="video">🎥 Video</option>
                <option value="application">📱 Aplikace</option>
                <option value="thought">💡 Myšlenka</option>
                <option value="downloadable">📥 Ke stažení</option>
                <option value="other">🔗 Jiné</option>
              </select>
            </div>

            <div>
              <label htmlFor="experienceLevel" className="block text-sm font-medium text-gray-700 mb-2">
                Úroveň zkušenosti *
              </label>
              <select
                id="experienceLevel"
                name="experienceLevel"
                required
                value={formData.experienceLevel}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="beginner">🟢 Začátečník</option>
                <option value="intermediate">🟡 Pokročilý</option>
              </select>
            </div>

            <div>
              <label htmlFor="detail" className="block text-sm font-medium text-gray-700 mb-2">
                Detail (Short Description) *
              </label>
              <textarea
                id="detail"
                name="detail"
                rows={3}
                required
                value={formData.detail}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Brief description of the inspiration (this will be shown in the bibliothèque view)"
              />
            </div>

            <div>
              <label htmlFor="resource" className="block text-sm font-medium text-gray-700 mb-2">
                Resource URL
              </label>
              <input
                type="url"
                id="resource"
                name="resource"
                value={formData.resource}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="https://example.com/resource (optional)"
              />
            </div>

            <div>
              <label htmlFor="resourceTitle" className="block text-sm font-medium text-gray-700 mb-2">
                Resource Title
              </label>
              <input
                type="text"
                id="resourceTitle"
                name="resourceTitle"
                value={formData.resourceTitle}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Display title for the resource (optional)"
              />
            </div>

            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                Image URL
              </label>
              <input
                type="url"
                id="image"
                name="image"
                value={formData.image}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {/* Downloadable Material Fields */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Materiál ke stažení</h3>
              
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="isDownloadable"
                  name="isDownloadable"
                  checked={formData.isDownloadable}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="isDownloadable" className="ml-2 block text-sm text-gray-700">
                  Tento materiál je ke stažení
                </label>
              </div>

              {formData.isDownloadable && (
                <>
                  <div className="mb-4">
                    <label htmlFor="downloadUrl" className="block text-sm font-medium text-gray-700 mb-2">
                      URL souboru ke stažení
                    </label>
                    <input
                      type="url"
                      id="downloadUrl"
                      name="downloadUrl"
                      value={formData.downloadUrl}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="https://example.com/file.pdf"
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="fileSize" className="block text-sm font-medium text-gray-700 mb-2">
                      Velikost souboru
                    </label>
                    <input
                      type="text"
                      id="fileSize"
                      name="fileSize"
                      value={formData.fileSize}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="2.5 MB"
                    />
                  </div>
                </>
              )}
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Content *
              </label>
              <textarea
                id="content"
                name="content"
                rows={15}
                required
                value={formData.content}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                placeholder="Write your inspiration content here. You can use Markdown formatting:

# Heading 1
## Heading 2
### Heading 3

**Bold text**
*Italic text*

- List item 1
- List item 2

1. Numbered item 1
2. Numbered item 2"
              />
              <p className="mt-2 text-sm text-gray-500">
                You can use Markdown formatting for headings, bold, italic, and lists.
              </p>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="featured"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
                Featured inspiration (will appear on homepage)
              </label>
            </div>

            <div className="flex justify-end space-x-4">
              <Link
                href="/admin/articles"
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Update Inspiration'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
