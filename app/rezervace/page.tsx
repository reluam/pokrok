'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { Calendar, Clock, Users, CheckCircle, ArrowRight } from 'lucide-react'
import { getBaseUrl } from '@/lib/utils'
import { CoachingPackage } from '@/lib/admin-types'

// App download options
const downloadOptions = [
  {
    id: 'web-app',
    title: 'Webová aplikace',
    subtitle: 'Okamžitě dostupná',
    description: 'Používejte aplikaci Pokrok přímo ve vašem prohlížeči. Žádné stahování, žádná instalace.',
    price: 'Zdarma',
    duration: 'Okamžitě',
    features: [
      'Přístup z jakéhokoli zařízení',
      'Automatické synchronizace',
      'Všechny funkce aplikace',
      'Bezpečné uložení dat',
      'Pravidelné aktualizace',
      'Bez instalace'
    ],
    color: 'bg-primary-500',
    textColor: 'text-primary-500',
    borderColor: 'border-primary-500',
    headerTextColor: 'text-white'
  },
  {
    id: 'mobile-app',
    title: 'Mobilní aplikace',
    subtitle: 'Na cestách',
    description: 'Mobilní verze aplikace pro iOS a Android. Váš osobní rozvoj vždy po ruce.',
    price: 'Zdarma',
    duration: 'Stažení',
    features: [
      'Offline přístup',
      'Push notifikace',
      'Mobilní optimalizace',
      'Rychlý přístup',
      'Synchronizace s webem',
      'Intuitivní ovládání'
    ],
    color: 'bg-primary-100',
    textColor: 'text-primary-600',
    borderColor: 'border-primary-500',
    headerTextColor: 'text-primary-500'
  },
  {
    id: 'desktop-app',
    title: 'Desktop aplikace',
    subtitle: 'Pro počítač',
    description: 'Desktop verze pro Windows, macOS a Linux. Plná funkčnost na vašem počítači.',
    price: 'Zdarma',
    duration: 'Instalace',
    features: [
      'Plná funkcionalita',
      'Rychlý výkon',
      'Offline režim',
      'Systémové notifikace',
      'Automatické aktualizace',
      'Lepší soustředění'
    ],
    color: 'bg-[#3E603B]',
    textColor: 'text-[#3E603B]',
    borderColor: 'border-[#3E603B]'
  }
]

export default function DownloadPage() {
  const [downloadOptions, setDownloadOptions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setDownloadOptions(downloadOptions)
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Načítání...</p>
          </div>
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
              Stáhnout aplikaci
            </h1>
            <p className="text-p18 text-gray-600 max-w-3xl mx-auto">
              Vyberte si způsob, jak chcete používat aplikaci Pokrok. 
              Všechny verze jsou zdarma a obsahují stejné funkce.
            </p>
          </div>
        </div>
      </section>

      {/* Download Options */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {downloadOptions.map((option, index) => (
              <div 
                key={option.id}
                className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-2 ${option.borderColor} border-opacity-20 flex flex-col`}
              >
                {/* Header */}
                <div className={`${option.color} rounded-t-2xl p-6 ${option.headerTextColor || 'text-white'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-6 h-6" />
                      <span className="text-asul18 font-medium">Aplikace</span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{option.price}</div>
                      <div className="text-sm opacity-90">{option.duration}</div>
                    </div>
                  </div>
                  <h3 className="text-h3 mb-2">{option.title}</h3>
                  <p className="text-asul18 opacity-90">{option.subtitle}</p>
                </div>

                {/* Content */}
                <div className="p-6 flex-grow flex flex-col">
                  <p className="text-p16 text-gray-600 mb-6">
                    {option.description}
                  </p>

                  {/* Features */}
                  <div className="space-y-3 mb-8 flex-grow">
                    {option.features.map((feature: string, featureIndex: number) => (
                      <div key={featureIndex} className="flex items-start space-x-3">
                        <CheckCircle className={`w-5 h-5 ${option.textColor} flex-shrink-0 mt-0.5`} />
                        <span className="text-p16 text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <a
                    href={`${getBaseUrl()}/muj`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full ${option.color} ${option.headerTextColor || 'text-white'} px-6 py-4 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center space-x-2 text-asul18 font-medium`}
                  >
                    <span>Otevřít aplikaci</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Start */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-h2 text-text-primary mb-4">
              Jak začít
            </h2>
            <p className="text-p18 text-gray-600">
              Jednoduchý proces k začátku vaší cesty k lepšímu životu. Začněte ještě dnes!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h3 className="text-h4 text-text-primary mb-2">Otevřete aplikaci</h3>
              <p className="text-p16 text-gray-600">
                Klikněte na "Otevřít aplikaci" a přejděte do aplikace Pokrok
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h3 className="text-h4 text-text-primary mb-2">Vytvořte účet</h3>
              <p className="text-p16 text-gray-600">
                Zaregistrujte se nebo se přihlaste do aplikace
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h3 className="text-h4 text-text-primary mb-2">Začněte svou cestu</h3>
              <p className="text-p16 text-gray-600">
                Stanovte si první cíle a začněte svou transformaci
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-h2 text-text-primary mb-4">
              Často kladené otázky
            </h2>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-h4 text-text-primary mb-2">Je aplikace zdarma?</h3>
              <p className="text-p16 text-gray-600">
                Ano, aplikace Pokrok je zcela zdarma. Všechny funkce jsou dostupné bez omezení 
                a bez skrytých poplatků. Můžete ji používat tak dlouho, jak potřebujete.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-h4 text-text-primary mb-2">Jak funguje aplikace?</h3>
              <p className="text-p16 text-gray-600">
                Aplikace vám pomáhá stanovit si cíle, sledovat pokrok a rozvíjet se systematicky. 
                Obsahuje nástroje pro plánování, sledování pokroku a motivaci. Vše je navrženo 
                tak, aby vám pomohlo dosáhnout vašich cílů.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-h4 text-text-primary mb-2">Mohu používat aplikaci na více zařízeních?</h3>
              <p className="text-p16 text-gray-600">
                Ano, aplikace synchronizuje vaše data mezi všemi zařízeními. Můžete začít na 
                počítači a pokračovat na mobilu nebo naopak. Všechna vaše data jsou vždy aktuální.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
