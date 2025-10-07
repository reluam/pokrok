'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Play } from 'lucide-react'
import Link from 'next/link'
import { VideoContent } from '@/lib/admin-types'

export default function EditVideoContentPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    thumbnailUrl: '',
    embedCode: '',
    enabled: true
  })

  useEffect(() => {
    loadVideo()
  }, [params.id])

  const loadVideo = async () => {
    try {
      const response = await fetch(`/api/admin/video-content/${params.id}`)
      if (response.ok) {
        const videoData: VideoContent = await response.json()
        setFormData({
          title: videoData.title,
          description: videoData.description,
          videoUrl: videoData.videoUrl,
          thumbnailUrl: videoData.thumbnailUrl || '',
          embedCode: videoData.embedCode || '',
          enabled: videoData.enabled
        })
      } else {
        alert('Video nebylo nalezeno')
        router.push('/admin/video-content')
      }
    } catch (error) {
      console.error('Error loading video content:', error)
      alert('Chyba při načítání videa')
    } finally {
      setInitialLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/admin/video-content/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        router.push('/admin/video-content')
      } else {
        const error = await response.json()
        alert(`Chyba při aktualizaci videa: ${error.error}`)
      }
    } catch (error) {
      console.error('Error updating video content:', error)
      alert('Chyba při aktualizaci videa')
    } finally {
      setLoading(false)
    }
  }

  const getVideoPreview = () => {
    if (formData.embedCode) {
      return (
        <div 
          className="w-full aspect-video bg-gray-100 rounded-lg overflow-hidden"
          dangerouslySetInnerHTML={{ __html: formData.embedCode }}
        />
      )
    }

    if (formData.videoUrl) {
      // Check if it's a YouTube URL
      const youtubeMatch = formData.videoUrl.match(/(?:youtube\.com\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]+)/)
      if (youtubeMatch) {
        return (
          <iframe
            className="w-full aspect-video rounded-lg"
            src={formData.videoUrl}
            title={formData.title || 'Video preview'}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )
      }

      // Check if it's a Vimeo URL
      const vimeoMatch = formData.videoUrl.match(/vimeo\.com\/(\d+)/)
      if (vimeoMatch) {
        return (
          <iframe
            className="w-full aspect-video rounded-lg"
            src={`https://player.vimeo.com/video/${vimeoMatch[1]}`}
            title={formData.title || 'Video preview'}
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        )
      }

      // For other video URLs, show a placeholder
      return (
        <div className="w-full aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Play className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Video preview</p>
            <p className="text-sm text-gray-500">{formData.videoUrl}</p>
          </div>
        </div>
      )
    }

    return (
      <div className="w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <Play className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">Náhled videa se zobrazí zde</p>
        </div>
      </div>
    )
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Načítání videa...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link
              href="/admin/video-content"
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span>Zpět na videa</span>
            </Link>
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Upravit video obsah</h1>
          <p className="text-gray-600">Upravte video zobrazované na hlavní stránce</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Název videa *
                </label>
                <input
                  type="text"
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="např. Úvodní video"
                />
              </div>

              <div>
                <label htmlFor="thumbnailUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  URL náhledu (volitelné)
                </label>
                <input
                  type="url"
                  id="thumbnailUrl"
                  value={formData.thumbnailUrl}
                  onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="https://example.com/thumbnail.jpg"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Popis videa *
              </label>
              <textarea
                id="description"
                required
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Popište video obsah..."
              />
            </div>

            <div>
              <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-2">
                URL videa *
              </label>
              <input
                type="url"
                id="videoUrl"
                required
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="https://www.youtube.com/embed/VIDEO_ID nebo https://vimeo.com/VIDEO_ID"
              />
              <p className="text-xs text-gray-500 mt-1">
                Pro YouTube použijte embed URL: https://www.youtube.com/embed/VIDEO_ID
              </p>
            </div>

            <div>
              <label htmlFor="embedCode" className="block text-sm font-medium text-gray-700 mb-2">
                Vlastní embed kód (volitelné)
              </label>
              <textarea
                id="embedCode"
                rows={4}
                value={formData.embedCode}
                onChange={(e) => setFormData({ ...formData, embedCode: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                placeholder="<iframe src='...' ...></iframe>"
              />
              <p className="text-xs text-gray-500 mt-1">
                Pokud zadáte embed kód, bude použit místo URL videa
              </p>
            </div>

            {/* Settings */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="enabled"
                checked={formData.enabled}
                onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="enabled" className="ml-2 block text-sm text-gray-700">
                Aktivní (zobrazit na webu)
              </label>
            </div>

            {/* Preview */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Náhled</h3>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="max-w-2xl mx-auto">
                  <div className="text-center mb-4">
                    <h2 className="text-h2 text-text-primary mb-4">
                      Poznej svého kouče
                    </h2>
                  </div>
                  {getVideoPreview()}
                  {formData.title && (
                    <div className="mt-4 text-center">
                      <h3 className="text-lg font-medium text-gray-900">{formData.title}</h3>
                      {formData.description && (
                        <p className="text-gray-600 mt-2">{formData.description}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Link
                href="/admin/video-content"
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Zrušit
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors disabled:opacity-50"
              >
                {loading ? 'Ukládání...' : 'Uložit změny'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

