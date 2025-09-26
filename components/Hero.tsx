'use client'

import { ArrowRight, Sparkles } from 'lucide-react'

export default function Hero() {
  return (
    <section className="bg-background py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Text content */}
          <div className="space-y-8">
            {/* Tagline */}
            <div className="flex items-center space-x-2 text-primary-500">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Smysluplné žití</span>
            </div>

            {/* Main heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary leading-tight">
              Najdi smysl v nesmyslném světě.
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-gray-600 leading-relaxed">
              Odemkni svůj účel a najdi smysl.
            </p>

            {/* CTA Button */}
            <div>
              <a
                href="/kontakt"
                className="inline-flex items-center space-x-2 bg-primary-500 text-white px-8 py-4 rounded-lg hover:bg-primary-600 transition-colors text-lg font-medium"
              >
                <span>Kontakt</span>
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Right side - Illustration */}
          <div className="relative">
            <div className="relative w-full h-96 lg:h-[500px]">
              {/* Background circle */}
              <div className="absolute inset-0 bg-primary-100 rounded-full opacity-50"></div>
              
              {/* Main illustration container */}
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Mountain path illustration */}
                <div className="w-80 h-80 relative">
                  {/* Mountain */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-64 h-48 bg-gradient-to-t from-amber-700 to-amber-500 rounded-t-full"></div>
                  
                  {/* Sun */}
                  <div className="absolute top-4 right-8 w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center">
                    <div className="w-12 h-12 bg-yellow-300 rounded-full"></div>
                  </div>
                  
                  {/* Sun rays */}
                  <div className="absolute top-2 right-6 w-20 h-20">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-1 h-6 bg-yellow-300 transform origin-bottom"
                        style={{
                          transform: `rotate(${i * 45}deg) translateY(-8px)`,
                          left: '50%',
                          top: '50%',
                        }}
                      />
                    ))}
                  </div>
                  
                  {/* Path */}
                  <div className="absolute bottom-8 left-8 w-32 h-1 bg-amber-300 transform rotate-12"></div>
                  
                  {/* Person */}
                  <div className="absolute bottom-12 left-12 w-6 h-8 bg-blue-500 rounded-t-full"></div>
                  <div className="absolute bottom-20 left-10 w-10 h-6 bg-blue-600 rounded-full"></div>
                  
                  {/* Decorative elements */}
                  <div className="absolute top-16 left-4 text-2xl">?</div>
                  <div className="absolute top-20 right-4 text-2xl">⚙️</div>
                  <div className="absolute bottom-16 right-8 text-2xl">🕐</div>
                  
                  {/* Compass */}
                  <div className="absolute top-24 left-1/2 transform -translate-x-1/2 w-8 h-8 border-2 border-gray-400 rounded-full flex items-center justify-center">
                    <div className="w-1 h-4 bg-gray-600"></div>
                    <div className="absolute text-xs font-bold">
                      <span className="absolute -top-2 left-1/2 transform -translate-x-1/2">N</span>
                      <span className="absolute -right-2 top-1/2 transform -translate-y-1/2">E</span>
                      <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">S</span>
                      <span className="absolute -left-2 top-1/2 transform -translate-y-1/2">W</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
