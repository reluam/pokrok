import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Lightbulb, Target, Users, Clock, CheckCircle, Calendar, ArrowRight } from 'lucide-react'
import { getAdminSetting } from '@/lib/admin-db'
import CoachingPackagesSection from '@/components/CoachingPackagesSection'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Funkce aplikace - Pokrok',
    description: 'Objevte všechny funkce aplikace Pokrok pro osobní rozvoj a smysluplné žití.',
  }
}


const appFeatures = [
  {
    step: '1',
    title: 'Stanovování cílů',
    description: 'Vytvářejte si jasné a dosažitelné cíle s pomocí inteligentních nástrojů aplikace.'
  },
  {
    step: '2',
    title: 'Sledování pokroku',
    description: 'Měřte svůj pokrok a oslavujte úspěchy na cestě k lepšímu životu.'
  },
  {
    step: '3',
    title: 'Osobní rozvoj',
    description: 'Rozvíjejte se systematicky pomocí personalizovaných cvičení a materiálů.'
  },
  {
    step: '4',
    title: 'Motivace a inspirace',
    description: 'Získejte denní dávku motivace a inspirace pro váš osobní růst.'
  }
]

export default async function AppFeaturesPage() {
  return (
    <main className="min-h-screen">
      <Header />
      
      {/* Page Header */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-h1 text-text-primary mb-4">
              Funkce aplikace
            </h1>
            <p className="text-p18 text-gray-600 max-w-3xl mx-auto">
              Objevte všechny funkce aplikace Pokrok, které vám pomohou najít smysl života 
              a dosáhnout osobního růstu.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-h2 text-text-primary mb-4">
              Klíčové funkce aplikace
            </h2>
            <p className="text-p18 text-gray-600">
              Vše, co potřebujete pro svůj osobní rozvoj na jednom místě
            </p>
          </div>

          <div className="space-y-8">
            {appFeatures.map((feature, index) => (
              <div key={index} className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{feature.step}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-h3 text-text-primary mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-p16 text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-h2 text-text-primary mb-4">
              Výhody aplikace
            </h2>
            <p className="text-p18 text-gray-600">
              Proč si vybrat právě aplikaci Pokrok
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Clock className="w-6 h-6 text-primary-500" />
                <h3 className="text-h4 text-text-primary">Dostupnost 24/7</h3>
              </div>
              <p className="text-p16 text-gray-600">
                Aplikace je k dispozici kdykoli a kdekoli. Pracujte na svém rozvoji ve svém vlastním tempu.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Target className="w-6 h-6 text-primary-500" />
                <h3 className="text-h4 text-text-primary">Personalizace</h3>
              </div>
              <p className="text-p16 text-gray-600">
                Aplikace se přizpůsobuje vašim potřebám a cílům pro maximální efektivitu.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Users className="w-6 h-6 text-primary-500" />
                <h3 className="text-h4 text-text-primary">Sledování pokroku</h3>
              </div>
              <p className="text-p16 text-gray-600">
                Měřte svůj pokrok a oslavujte úspěchy s detailními statistikami a grafy.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Lightbulb className="w-6 h-6 text-primary-500" />
                <h3 className="text-h4 text-text-primary">Vědecky podložené</h3>
              </div>
              <p className="text-p16 text-gray-600">
                Všechny metody jsou založeny na vědecky podložených přístupech k osobnímu rozvoji.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-h2 text-text-primary mb-4">
            Začněte svou cestu k lepšímu životu
          </h2>
          <p className="text-p18 text-gray-600 mb-8">
            Stáhněte si aplikaci Pokrok a začněte svou transformaci ještě dnes.
          </p>
          <a
            href="/muj"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors text-asul18"
          >
            <span>Otevřít aplikaci</span>
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
