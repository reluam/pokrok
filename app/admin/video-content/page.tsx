'use client'

import { useState, useEffect } from 'react'
import { VideoContent } from '@/lib/admin-types'
import { Plus, Edit, Trash2, Eye, ToggleLeft, ToggleRight, Play } from 'lucide-react'
import Link from 'next/link'
import AdminLayout from '@/components/AdminLayout'

function VideoContentComponent() {
  const [videos, setVideos] = useState<VideoContent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadVideos()
  }, [])

  const loadVideos = async () => {
    try {
      const response = await fetch('/api/admin/video-content')
      if (response.ok) {
        const allVideos = await response.json()
        setVideos(allVideos)
      } else {
        console.error('Failed to load video content')
      }
    } catch (error) {
      console.error('Error loading video content:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Opravdu chcete smazat toto video?')) {
      try {
        const response = await fetch(`/api/admin/video-content/${id}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          setVideos(videos.filter(video => video.id !== id))
        } else {
          alert('Chyba při mazání videa')
        }
      } catch (error) {
        console.error('Error deleting video content:', error)
        alert('Chyba při mazání videa')
      }
    }
  }

  const handleToggleEnabled = async (id: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/admin/video-content/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabled: !enabled })
      })
      
      if (response.ok) {
        const updatedVideo = await response.json()
        setVideos(videos.map(video => 
          video.id === id ? updatedVideo : video
        ))
      } else {
        alert('Chyba při změně stavu videa')
      }
    } catch (error) {
      console.error('Error toggling video status:', error)
      alert('Chyba při změně stavu videa')
    }
  }


  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Načítání video obsahu...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <Link
          href="/admin/video-content/new"
          className="bg-primary-500 text-white px-6 py-3 rounded-xl hover:bg-primary-600 transition-colors flex items-center space-x-2 shadow-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>Nové video</span>
        </Link>
      </div>

        {/* Videos List */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-primary-100">
          {videos.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Play className="w-8 h-8 text-primary-600" />
              </div>
              <p className="text-gray-500 mb-4 font-asul">Zatím žádný video obsah</p>
              <Link
                href="/admin/video-content/new"
                className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Přidejte první video</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Video
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      URL
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stav
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vytvořeno
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Akce
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {videos.map((video) => (
                    <tr key={video.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 mr-4">
                            {video.thumbnailUrl ? (
                              <img
                                src={video.thumbnailUrl}
                                alt={video.title}
                                className="w-16 h-12 object-cover rounded"
                              />
                            ) : (
                              <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center">
                                <Play className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-text-primary">
                              {video.title}
                            </div>
                            <div className="text-sm text-gray-500 max-w-xs truncate">
                              {video.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {video.videoUrl}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleEnabled(video.id, video.enabled)}
                          className="flex items-center space-x-2"
                        >
                          {video.enabled ? (
                            <>
                              <ToggleRight className="w-6 h-6 text-green-500" />
                              <span className="text-sm text-green-600">Aktivní</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-6 h-6 text-gray-400" />
                              <span className="text-sm text-gray-500">Neaktivní</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(video.createdAt).toLocaleDateString('cs-CZ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <a
                            href={video.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-gray-600"
                            title="Zobrazit video"
                          >
                            <Eye className="w-4 h-4" />
                          </a>
                          <Link
                            href={`/admin/video-content/edit/${video.id}`}
                            className="text-primary-600 hover:text-primary-900"
                            title="Upravit"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(video.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Smazat"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info section */}
        <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-900 mb-2">Informace o video obsahu</h3>
          <div className="text-sm text-red-800 space-y-2">
            <p>• Pouze jedno video může být aktivní současně</p>
            <p>• Aktivní video se zobrazuje na hlavní stránce v sekci "Poznej svého kouče"</p>
            <p>• Podporované formáty: YouTube, Vimeo, nebo přímý odkaz na video soubor</p>
            <p>• Pro YouTube videa použijte embed URL (např. https://www.youtube.com/embed/VIDEO_ID)</p>
            <p>• Můžete také vložit vlastní embed kód pro pokročilé nastavení</p>
          </div>
        </div>
    </div>
  )
}

export default function VideoContentPage() {
  return (
    <AdminLayout title="Video obsah" description="Spravujte video zobrazované na hlavní stránce">
      <VideoContentComponent />
    </AdminLayout>
  )
}

