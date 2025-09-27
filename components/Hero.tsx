'use client'

import { ArrowRight, Sparkles } from 'lucide-react'
import Image from 'next/image'

export default function Hero() {
  return (
    <section className="h-[85vh] flex items-start pt-32 -mt-10">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Left side - Text content */}
          <div className="space-y-10">
            {/* Tagline */}
            <div className="flex items-center space-x-3 text-primary-500">
              <Sparkles className="w-5 h-5" />
              <span className="text-asul18">Smysluplné žití</span>
            </div>

            {/* Main heading */}
            <h1 className="text-h1 text-text-primary">
              Najdi smysl v nesmyslném světě.
            </h1>

            {/* Subtitle */}
            <p className="text-asul18 text-gray-600">
              Odemkni svůj účel a najdi smysl.
            </p>

                {/* CTA Button */}
                <div>
                  <a
                    href="/kontakt"
                    className="inline-flex items-center space-x-2 bg-primary-500 text-white px-4 py-3 rounded-lg hover:bg-primary-600 transition-colors text-asul18"
                  >
                    <span>Kontakt</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
          </div>

          {/* Right side - Illustration */}
          <div className="relative">
            <div className="relative w-full h-[600px]">
              {/* Orange oval background - positioned behind and to the right */}
              <div className="absolute top-0 right-12 w-[400px] h-[600px] bg-primary-500 rounded-full"></div>
              
              {/* Picture oval - main oval with high quality image */}
              <div className="absolute top-0 left-12 w-[400px] h-[600px] bg-white rounded-full flex items-center justify-center overflow-hidden">
                {/* High quality image */}
                <Image
                  src="/images/hero-image.jpg"
                  alt="Hero image"
                  width={400}
                  height={600}
                  className="w-full h-full object-cover rounded-full"
                  quality={100}
                  priority
                  onError={(e) => {
                    // Fallback to placeholder if image doesn't exist
                    e.currentTarget.style.display = 'none'
                    const nextSibling = e.currentTarget.nextElementSibling as HTMLElement
                    if (nextSibling) {
                      nextSibling.style.display = 'flex'
                    }
                  }}
                />
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center hidden">
                  <span className="text-gray-600 text-sm">Add your picture to /public/images/hero-image.jpg</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// New About Coach Section Component
export function AboutCoach() {
  return (
    <section className="pt-28 pb-20">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-h2 text-text-primary mb-8">
            Poznej svého kouče
          </h1>
        </div>
        
        <div className="flex justify-center">
          <div className="w-full max-w-[65%]">
            {/* Video Placeholder */}
            <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden shadow-lg">
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                  <p className="text-asul16 text-gray-600">Video placeholder</p>
                  <p className="text-asul10 text-gray-500 mt-2">Add your video here</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
