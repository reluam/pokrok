'use client'

import { useState, useEffect } from 'react'
import { Note, Goal } from '@/lib/cesta-db'
import { FileText, Plus, X, Edit, Trash2, Target, Calendar, StickyNote } from 'lucide-react'
import { usePageContext } from '@/components/PageContext'

export default function NotesPage() {
  const { setTitle, setSubtitle } = usePageContext()
  const [notes, setNotes] = useState<Note[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [filter, setFilter] = useState<'all' | 'standalone' | 'assigned'>('all')

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    goalId: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [notesRes, goalsRes] = await Promise.all([
        fetch('/api/cesta/notes'),
        fetch('/api/cesta/goals')
      ])

      const [notesData, goalsData] = await Promise.all([
        notesRes.json(),
        goalsRes.json()
      ])

      setNotes(notesData.notes || [])
      setGoals(goalsData.goals || [])
      
      // Set page title and subtitle
      setTitle('Poznámky')
      setSubtitle(`${(notesData.notes || []).length} poznámek`)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.content.trim()) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/cesta/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          content: formData.content.trim(),
          goalId: formData.goalId || null
        })
      })

      if (response.ok) {
        const result = await response.json()
        setNotes(prev => [result.note, ...prev])
        setShowAddModal(false)
        setFormData({ title: '', content: '', goalId: '' })
      } else {
        const error = await response.json()
        alert(`Chyba při vytváření poznámky: ${error.error || 'Neznámá chyba'}`)
      }
    } catch (error) {
      console.error('Error adding note:', error)
      alert('Chyba při vytváření poznámky')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingNote || !formData.title.trim() || !formData.content.trim()) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/cesta/notes/${editingNote.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          content: formData.content.trim()
        })
      })

      if (response.ok) {
        const result = await response.json()
        setNotes(prev => 
          prev.map(note => 
            note.id === editingNote.id ? result.note : note
          )
        )
        setEditingNote(null)
        setFormData({ title: '', content: '', goalId: '' })
      } else {
        const error = await response.json()
        alert(`Chyba při ukládání poznámky: ${error.error || 'Neznámá chyba'}`)
      }
    } catch (error) {
      console.error('Error saving note:', error)
      alert('Chyba při ukládání poznámky')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Opravdu chcete smazat tuto poznámku?')) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/cesta/notes/${noteId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setNotes(prev => prev.filter(note => note.id !== noteId))
      } else {
        alert('Chyba při mazání poznámky')
      }
    } catch (error) {
      console.error('Error deleting note:', error)
      alert('Chyba při mazání poznámky')
    } finally {
      setIsDeleting(false)
    }
  }

  const startEdit = (note: Note) => {
    setEditingNote(note)
    setFormData({
      title: note.title,
      content: note.content,
      goalId: note.goal_id || ''
    })
  }

  const cancelEdit = () => {
    setEditingNote(null)
    setFormData({ title: '', content: '', goalId: '' })
  }

  const filteredNotes = notes.filter(note => {
    switch (filter) {
      case 'standalone':
        return !note.goal_id
      case 'assigned':
        return note.goal_id
      default:
        return true
    }
  })

  const getGoalTitle = (goalId: string | undefined) => {
    if (!goalId) return null
    return goals.find(goal => goal.id === goalId)?.title
  }

  const getDaysRemaining = (targetDate: string | Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const target = new Date(targetDate)
    target.setHours(0, 0, 0, 0)
    const diffTime = target.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-gray-200 rounded-xl"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Poznámky</h1>
            <p className="text-gray-600 mt-2">Spravujte své poznámky a myšlenky</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            <span>Nová poznámka</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <StickyNote className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Celkem poznámek</p>
                <p className="text-2xl font-bold text-gray-900">{notes.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Na volno</p>
                <p className="text-2xl font-bold text-gray-900">{notes.filter(n => !n.goal_id).length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Přiřazené</p>
                <p className="text-2xl font-bold text-gray-900">{notes.filter(n => n.goal_id).length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-primary-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Všechny ({notes.length})
          </button>
          <button
            onClick={() => setFilter('standalone')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'standalone' 
                ? 'bg-primary-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Na volno ({notes.filter(n => !n.goal_id).length})
          </button>
          <button
            onClick={() => setFilter('assigned')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'assigned' 
                ? 'bg-primary-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Přiřazené ({notes.filter(n => n.goal_id).length})
          </button>
        </div>

        {/* Sticky Notes Grid */}
        {filteredNotes.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <StickyNote className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Žádné poznámky</h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? 'Zatím nemáte žádné poznámky.' 
                : filter === 'standalone'
                ? 'Nemáte žádné poznámky na volno.'
                : 'Nemáte žádné poznámky přiřazené k cílům.'}
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Vytvořit první poznámku
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredNotes.map((note) => (
              <div 
                key={note.id} 
                onClick={() => startEdit(note)}
                className="group relative bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 cursor-pointer"
                style={{
                  minHeight: '200px',
                  maxHeight: '300px'
                }}
              >
                {/* Modern Note Content */}
                <div className="p-5 h-full flex flex-col">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">
                        {note.title}
                      </h3>
                      <div className="flex items-center space-x-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteNote(note.id)
                          }}
                          disabled={isDeleting}
                          className="p-1.5 bg-gray-100 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Smazat poznámku"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm line-clamp-6 whitespace-pre-wrap">
                      {note.content}
                    </p>
                  </div>
                  
                  {/* Modern Metadata */}
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(note.created_at).toLocaleDateString('cs-CZ')}</span>
                      </div>
                      {note.goal_id && (
                        <div className="flex items-center space-x-1">
                          <Target className="w-3 h-3" />
                          <span className="truncate max-w-20">
                            {getGoalTitle(note.goal_id)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Subtle accent line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-blue-500 rounded-t-xl"></div>
                
                {/* Click hint */}
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span className="text-xs text-gray-400">(klikněte pro úpravu)</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Note Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Nová poznámka</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddNote} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Název poznámky
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
                    placeholder="Zadejte název poznámky..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Přiřadit k cíli (volitelné)
                  </label>
                  <select
                    value={formData.goalId}
                    onChange={(e) => setFormData(prev => ({ ...prev, goalId: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Bez přiřazení k cíli</option>
                    {goals.filter(goal => goal.status === 'active').map((goal) => (
                      <option key={goal.id} value={goal.id}>
                        {goal.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Obsah poznámky
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={8}
                    placeholder="Zadejte obsah poznámky..."
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Zrušit
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 font-medium flex items-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Ukládám...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Vytvořit poznámku</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Note Modal */}
        {editingNote && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Upravit poznámku</h2>
                <button
                  onClick={cancelEdit}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleEditNote} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Název poznámky
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
                    placeholder="Zadejte název poznámky..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Obsah poznámky
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={8}
                    placeholder="Zadejte obsah poznámky..."
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Zrušit
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 font-medium flex items-center space-x-2"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Ukládám...</span>
                      </>
                    ) : (
                      <>
                        <Edit className="w-4 h-4" />
                        <span>Uložit změny</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
