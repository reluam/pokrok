'use client'

import { useState } from 'react'
import { Database, CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function TestDbPage() {
  const [status, setStatus] = useState<'idle' | 'testing' | 'initializing' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [details, setDetails] = useState('')

  const testConnection = async () => {
    setStatus('testing')
    setMessage('Testing database connection...')
    setDetails('')

    try {
      // Test a simple API call first
      const response = await fetch('/api/admin/coaching-packages')
      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage('✅ Database connection successful!')
        setDetails(`Found ${data.length} coaching packages`)
      } else if (response.status === 503) {
        setStatus('error')
        setMessage('❌ Database not configured')
        setDetails(data.error || 'POSTGRES_URL environment variable not found')
      } else {
        setStatus('error')
        setMessage('❌ Database error')
        setDetails(data.error || `HTTP ${response.status}`)
      }
    } catch (error) {
      setStatus('error')
      setMessage('❌ Connection failed')
      setDetails(error instanceof Error ? error.message : 'Unknown error')
    }
  }

  const initializeDatabase = async () => {
    setStatus('initializing')
    setMessage('Initializing database tables...')
    setDetails('')

    try {
      const response = await fetch('/api/admin/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage('✅ Database initialized successfully!')
        setDetails('All tables created and seeded with default data')
      } else {
        setStatus('error')
        setMessage('❌ Initialization failed')
        setDetails(data.error || `HTTP ${response.status}`)
      }
    } catch (error) {
      setStatus('error')
      setMessage('❌ Initialization failed')
      setDetails(error instanceof Error ? error.message : 'Unknown error')
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'testing':
      case 'initializing':
        return <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-500" />
      case 'error':
        return <XCircle className="h-6 w-6 text-red-500" />
      default:
        return <Database className="h-6 w-6 text-gray-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <Database className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Database Test Page</h1>
            <p className="text-gray-600">Test your database connection and initialize admin tables</p>
          </div>

          <div className="space-y-6">
            {/* Status Display */}
            {status !== 'idle' && (
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center mb-3">
                  {getStatusIcon()}
                  <span className="ml-3 text-lg font-medium">{message}</span>
                </div>
                {details && (
                  <div className="ml-9 text-sm text-gray-600 bg-white p-3 rounded border">
                    {details}
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={testConnection}
                disabled={status === 'testing' || status === 'initializing'}
                className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {status === 'testing' ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <Database className="h-5 w-5 mr-2" />
                )}
                Test Connection
              </button>

              <button
                onClick={initializeDatabase}
                disabled={status === 'testing' || status === 'initializing'}
                className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {status === 'initializing' ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="h-5 w-5 mr-2" />
                )}
                Initialize Database
              </button>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Instructions:</h3>
              <ol className="list-decimal list-inside space-y-2 text-blue-800">
                <li>First, click <strong>"Test Connection"</strong> to verify your database is accessible</li>
                <li>If the connection works, click <strong>"Initialize Database"</strong> to create tables</li>
                <li>Once initialized, you can use the admin panel at <code className="bg-blue-100 px-2 py-1 rounded">/admin</code></li>
              </ol>
            </div>

            {/* Environment Check */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-900 mb-3">Environment Check:</h3>
              <p className="text-yellow-800 mb-2">
                Make sure your <code className="bg-yellow-100 px-2 py-1 rounded">.env.local</code> file contains:
              </p>
              <pre className="bg-yellow-100 p-3 rounded text-sm text-yellow-900 overflow-x-auto">
{`POSTGRES_URL=postgresql://username:password@host/database
DATABASE_URL=postgresql://username:password@host/database`}
              </pre>
              <p className="text-yellow-800 mt-2 text-sm">
                After adding the environment variables, restart your development server.
              </p>
            </div>

            {/* Quick Links */}
            {status === 'success' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-900 mb-3">Quick Links:</h3>
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href="/admin"
                    className="block text-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    Admin Panel
                  </a>
                  <a
                    href="/admin/offer-sections"
                    className="block text-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    Manage Sections
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
