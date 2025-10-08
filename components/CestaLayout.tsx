'use client'

import { useRouter } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { Settings, Home, Target, Footprints, BarChart3, Zap } from 'lucide-react'
import { memo } from 'react'

interface CestaLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  currentPage?: string
}

export const CestaLayout = memo(function CestaLayout({ children, title, subtitle, currentPage }: CestaLayoutProps) {
  const router = useRouter()


  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-primary-100 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/muj')}
                className={`flex items-center space-x-2 transition-all duration-200 ${
                  currentPage === '/muj' 
                    ? 'text-primary-600 bg-primary-50 px-3 py-2 rounded-lg' 
                    : 'text-gray-600 hover:text-primary-600'
                }`}
              >
                <Home className="w-5 h-5 text-primary-500" />
                <span className="text-sm font-medium">Hlavní panel</span>
                {currentPage === '/muj' && subtitle && (
                  <span className="text-xs text-gray-500 ml-2">{subtitle}</span>
                )}
              </button>
            </div>
            <div className="flex items-center space-x-4">
              {/* Menu items */}
              <button
                onClick={() => router.push('/muj/cile')}
                className={`flex items-center space-x-2 transition-all duration-200 ${
                  currentPage === '/muj/cile' 
                    ? 'text-primary-600 bg-primary-50 px-3 py-2 rounded-lg' 
                    : 'text-gray-600 hover:text-primary-600'
                }`}
              >
                <Target className="w-5 h-5 text-primary-500" />
                <span className="text-sm font-medium">Cíle</span>
                {currentPage === '/muj/cile' && subtitle && (
                  <span className="text-xs text-gray-500 ml-2">{subtitle}</span>
                )}
              </button>
              <button
                onClick={() => router.push('/muj/kroky')}
                className={`flex items-center space-x-2 transition-all duration-200 ${
                  currentPage === '/muj/kroky' 
                    ? 'text-primary-600 bg-primary-50 px-3 py-2 rounded-lg' 
                    : 'text-gray-600 hover:text-primary-600'
                }`}
              >
                <Footprints className="w-5 h-5 text-primary-500" />
                <span className="text-sm font-medium">Kroky</span>
                {currentPage === '/muj/kroky' && subtitle && (
                  <span className="text-xs text-gray-500 ml-2">{subtitle}</span>
                )}
              </button>
              <button
                onClick={() => router.push('/muj/prehled')}
                className={`flex items-center space-x-2 transition-all duration-200 ${
                  currentPage === '/muj/prehled' 
                    ? 'text-primary-600 bg-primary-50 px-3 py-2 rounded-lg' 
                    : 'text-gray-600 hover:text-primary-600'
                }`}
              >
                <BarChart3 className="w-5 h-5 text-primary-500" />
                <span className="text-sm font-medium">Přehled</span>
                {currentPage === '/muj/prehled' && subtitle && (
                  <span className="text-xs text-gray-500 ml-2">{subtitle}</span>
                )}
              </button>
              <button
                onClick={() => router.push('/muj/automatizace')}
                className={`flex items-center space-x-2 transition-all duration-200 ${
                  currentPage === '/muj/automatizace' 
                    ? 'text-primary-600 bg-primary-50 px-3 py-2 rounded-lg' 
                    : 'text-gray-600 hover:text-primary-600'
                }`}
              >
                <Zap className="w-5 h-5 text-primary-500" />
                <span className="text-sm font-medium">Automatizace</span>
                {currentPage === '/muj/automatizace' && subtitle && (
                  <span className="text-xs text-gray-500 ml-2">{subtitle}</span>
                )}
              </button>
              <button
                onClick={() => router.push('/muj/metriky')}
                className={`flex items-center space-x-2 transition-all duration-200 ${
                  currentPage === '/muj/metriky' 
                    ? 'text-primary-600 bg-primary-50 px-3 py-2 rounded-lg' 
                    : 'text-gray-600 hover:text-primary-600'
                }`}
              >
                <BarChart3 className="w-5 h-5 text-primary-500" />
                <span className="text-sm font-medium">Metriky</span>
                {currentPage === '/muj/metriky' && subtitle && (
                  <span className="text-xs text-gray-500 ml-2">{subtitle}</span>
                )}
              </button>
              <button
                onClick={() => router.push('/muj/nastaveni')}
                className={`flex items-center space-x-2 transition-all duration-200 ${
                  currentPage === '/muj/nastaveni' 
                    ? 'text-primary-600 bg-primary-50 px-3 py-2 rounded-lg' 
                    : 'text-gray-600 hover:text-primary-600'
                }`}
              >
                <Settings className="w-5 h-5 text-primary-500" />
                <span className="text-sm font-medium">Nastavení</span>
                {currentPage === '/muj/nastaveni' && subtitle && (
                  <span className="text-xs text-gray-500 ml-2">{subtitle}</span>
                )}
              </button>
              <UserButton afterSignOutUrl="https://accounts.pokrok.app/sign-in" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 min-h-0">
        {children}
      </main>
    </div>
  )
})
