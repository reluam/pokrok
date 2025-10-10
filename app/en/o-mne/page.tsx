'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Image from 'next/image'
import { getBaseUrl } from '@/lib/utils'
import { useTranslations } from '@/lib/use-translations'

export default function AboutPage() {
  const { translations, loading } = useTranslations()

  if (loading) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="animate-pulse text-gray-500">Loading...</div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      <Header />
      
      {/* Page Header */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-h1 text-text-primary mb-4">
              {translations?.about.pageTitle || 'About Progress App'}
            </h1>
            <p className="text-p18 text-gray-600 max-w-3xl mx-auto">
              {translations?.about.pageSubtitle || 'Discover the app that helps you find meaning in life and achieve personal growth.'}
            </p>
          </div>
        </div>
      </section>

      {/* About Content */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="space-y-6">
              <h2 className="text-h2 text-text-primary">
                {translations?.about.title || 'What is Progress?'}
              </h2>
              <p className="text-p16 text-gray-600">
                {translations?.about.description1 || 'Progress is a personal development app that helps you find meaning in life, set clear goals and achieve them systematically. The app combines proven coaching methods with modern technologies.'}
              </p>
              <p className="text-p16 text-gray-600">
                {translations?.about.description2 || 'Using intelligent tools, you can track your progress, celebrate achievements and create lasting positive changes in your life. The app is designed to be your personal guide on the path to a better life.'}
              </p>
              <p className="text-p16 text-gray-600">
                {translations?.about.description3 || 'All features are based on scientifically proven personal development methods and are tailored to your individual needs and goals.'}
              </p>
            </div>

            {/* Image Placeholder */}
            <div className="relative">
              <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden shadow-lg">
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold text-xl">P</span>
                    </div>
                    <p className="text-asul16 text-gray-600">App Screenshot</p>
                    <p className="text-asul10 text-gray-500 mt-2">to /public/images/app-screenshot.jpg</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-h2 text-text-primary mb-3">
              {translations?.about.featuresTitle || 'Key Features'}
            </h2>
            <p className="text-p16 text-gray-600">
              {translations?.about.featuresSubtitle || 'What Progress app can do and how it can help you'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="text-center space-y-3 p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="text-4xl mb-2">🎯</div>
              <h3 className="text-h4 text-text-primary">{translations?.about.goalSetting || 'Goal Setting'}</h3>
              <p className="text-p14 text-gray-600 leading-relaxed">
                {translations?.about.goalSettingDesc || 'Create clear and achievable goals with the help of intelligent tools.'}
              </p>
            </div>

            <div className="text-center space-y-3 p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="text-4xl mb-2">📊</div>
              <h3 className="text-h4 text-text-primary">{translations?.about.progressTracking || 'Progress Tracking'}</h3>
              <p className="text-p14 text-gray-600 leading-relaxed">
                {translations?.about.progressTrackingDesc || 'Measure your progress and celebrate achievements on your path to a better life.'}
              </p>
            </div>

            <div className="text-center space-y-3 p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="text-4xl mb-2">🧠</div>
              <h3 className="text-h4 text-text-primary">{translations?.about.personalDevelopment || 'Personal Development'}</h3>
              <p className="text-p14 text-gray-600 leading-relaxed">
                {translations?.about.personalDevelopmentDesc || 'Develop systematically with personalized exercises.'}
              </p>
            </div>

            <div className="text-center space-y-3 p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="text-4xl mb-2">💡</div>
              <h3 className="text-h4 text-text-primary">{translations?.about.inspiration || 'Inspiration'}</h3>
              <p className="text-p14 text-gray-600 leading-relaxed">
                {translations?.about.inspirationDesc || 'Get motivation and inspiration for every day of your life.'}
              </p>
            </div>

            <div className="text-center space-y-3 p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="text-4xl mb-2">🤝</div>
              <h3 className="text-h4 text-text-primary">{translations?.about.support || 'Support'}</h3>
              <p className="text-p14 text-gray-600 leading-relaxed">
                {translations?.about.supportDesc || 'Get support and guidance on your path to personal growth.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-h2 text-text-primary mb-4">
            {translations?.about.ctaTitle || 'Start your journey to a better life'}
          </h2>
          <p className="text-p18 text-gray-600 mb-8">
            {translations?.about.ctaSubtitle || 'Download Progress app and start your transformation today.'}
          </p>
          <a
            href={`${getBaseUrl()}/muj`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors text-asul18"
          >
            <span>{translations?.hero.cta || 'Open App'}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </section>

      <Footer />
    </main>
  )
}
