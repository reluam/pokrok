'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, Users, CheckCircle, Star, Target, Lightbulb } from 'lucide-react'
import { useEffect } from 'react'

// Declare Zaptime global
declare global {
  interface Window {
    Zaptime: (config: { config: { token: string } }) => {
      render: (selector: string) => void
    }
  }
}

const serviceDetails = {
  title: 'Koučovací balíček',
  subtitle: 'Plně přizpůsobitelný',
  price: 'Cena na domluvě',
  originalPrice: null,
  duration: 'Od 6 sezení',
  description: 'Komplexní koučovací program na míru - od 6 sezení, s individuálním přístupem, frekvencí a cenou. Program je navržený přesně podle vašich potřeb, možností a rozpočtu.',
  features: [
    'První konzultace zdarma (30 min) - seznámení a definování potřeb',
    'Minimálně 6 sezení - flexibilní délka podle vašich cílů',
    'Individuální frekvence - 1x týdně, 2x měsíčně, nebo jak potřebujete',
    'Flexibilní cena - přizpůsobíme se vašemu rozpočtu',
    'E-mailová podpora mezi sezeními - odpovědi na otázky a motivace',
    'Materiály a cvičení na míru - praktické nástroje pro vaše potřeby',
    'Flexibilní termíny - přizpůsobíme se vašemu rozvrhu',
    'Online i offline možnosti - sezení probíhají online nebo osobně'
  ],
  benefits: [
    {
      icon: Target,
      title: 'Individuální cíle',
      description: 'Společně definujeme vaše konkrétní cíle a vytvoříme plán na míru'
    },
    {
      icon: Lightbulb,
      title: 'Flexibilní přístup',
      description: 'Program je přizpůsoben vašim potřebám, možnostem a rozpočtu'
    },
    {
      icon: Users,
      title: 'Osobní podpora',
      description: 'Budete mít k dispozici profesionálního kouče po celou dobu programu'
    },
    {
      icon: Star,
      title: 'Dlouhodobé výsledky',
      description: 'Získáte nástroje pro udržitelné změny ve vašem životě'
    }
  ],
  process: [
    {
      step: '1',
      title: 'První konzultace zdarma',
      description: 'Společně probereme vaše cíle, očekávání a současnou situaci. Domluvíme si délku, frekvenci a cenu programu.'
    },
    {
      step: '2',
      title: 'Stanovení cílů',
      description: 'Definujeme konkrétní, měřitelné cíle a vytvoříme individuální plán koučovacího procesu na míru.'
    },
    {
      step: '3',
      title: 'Implementace programu',
      description: 'Realizujeme váš individuální program s pravidelnými sezeními, podporou a materiály podle domluvy.'
    },
    {
      step: '4',
      title: 'Hodnocení a plánování',
      description: 'Pravidelně hodnotíme pokrok a upravujeme program podle vašich potřeb a výsledků.'
    }
  ],
  testimonials: [
    {
      name: 'Marie Nováková',
      role: 'Manažerka',
      content: 'Koučovací balíček mi pomohl najít směr v kariéře a osobním životě. Měli jsme 8 sezení během 3 měsíců a dosáhla jsem všech svých cílů.',
      rating: 5
    },
    {
      name: 'Petr Svoboda',
      role: 'Podnikatel',
      content: 'Investice do koučovacího balíčku byla nejlepší rozhodnutí. Měli jsme 12 sezení během 6 měsíců - přesně to, co jsem potřeboval.',
      rating: 5
    }
  ]
}

export default function CoachingPackagePage() {
  // Zaptime configuration - you may need a different token for this service
  const zaptimeToken = "WpwdY9lclHB6cPan45FrIIbEGPGsr86D" // Your Zaptime token

  // Load Zaptime script
  useEffect(() => {
    const container = document.getElementById('zaptime-container')
    if (!container) return

    // Clear any existing content first
    container.innerHTML = ''

    // Check if script is already loaded
    if (window.Zaptime) {
      window.Zaptime({
        config: { token: zaptimeToken }
      }).render('#zaptime-container')
      return
    }

    // Check if script is already in DOM
    const existingScript = document.querySelector('script[src="https://iframe.zaptime.app/zaptime.js"]')
    if (existingScript) {
      existingScript.addEventListener('load', () => {
        if (window.Zaptime && container) {
          container.innerHTML = '' // Clear before rendering
          window.Zaptime({
            config: { token: zaptimeToken }
          }).render('#zaptime-container')
        }
      })
      return
    }

    const script = document.createElement('script')
    script.src = 'https://iframe.zaptime.app/zaptime.js'
    script.async = true
    document.body.appendChild(script)

    script.onload = () => {
      if (window.Zaptime && container) {
        container.innerHTML = '' // Clear before rendering
        window.Zaptime({
          config: { token: zaptimeToken }
        }).render('#zaptime-container')
      }
    }

    return () => {
      if (container) {
        container.innerHTML = ''
      }
    }
  }, [zaptimeToken])

  return (
    <main className="min-h-screen">
      <Header />
      
      {/* Back Button */}
      <section className="py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link 
            href="/rezervace" 
            className="inline-flex items-center space-x-2 text-primary-500 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-asul18">Zpět na rezervace</span>
          </Link>
        </div>
      </section>

      {/* Service Header */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left Column - Service Info */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Calendar className="w-6 h-6 text-primary-500" />
                <span className="text-asul18 text-primary-500">Koučing</span>
              </div>
              <h1 className="text-h1 text-text-primary mb-4">
                {serviceDetails.title}
              </h1>
              <p className="text-p18 text-gray-600 mb-6">
                {serviceDetails.description}
              </p>
              
              <div className="flex items-center space-x-4 mb-6">
                <div className="text-3xl font-bold text-primary-500">
                  {serviceDetails.price}
                </div>
                <div className="text-lg text-gray-500">
                  (minimálně 6 sezení)
                </div>
              </div>

              <div className="flex items-center space-x-6 text-p16 text-gray-600 mb-8">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>{serviceDetails.duration}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Individuální přístup</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-6 mb-8">
                <h3 className="text-h3 text-text-primary mb-4">Co získáte</h3>
                <div className="space-y-3">
                  {serviceDetails.features.slice(0, 4).map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                      <span className="text-p16 text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Calendar */}
            <div id="booking" className="lg:sticky lg:top-8">
              <div className="text-center mb-6">
                <h3 className="text-h3 text-text-primary mb-2">
                  Rezervujte si balíček
                </h3>
                <p className="text-p16 text-gray-600">
                  Vyberte si termín pro vaše první sezení
                </p>
              </div>
              
              <div 
                id="zaptime-container"
                className="w-full"
                style={{ 
                  minWidth: '320px', 
                  height: '600px'
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-h2 text-text-primary mb-4">
              Co je zahrnuto v balíčku
            </h2>
            <p className="text-p18 text-gray-600">
              Kompletní přehled všech služeb a výhod
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {serviceDetails.features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 bg-white rounded-lg shadow-sm">
                <CheckCircle className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                <span className="text-p16 text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-h2 text-text-primary mb-4">
              Výhody koučovacího balíčku
            </h2>
            <p className="text-p18 text-gray-600">
              Proč je přizpůsobitelný balíček nejlepší volbou pro váš rozvoj
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {serviceDetails.benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-h4 text-text-primary mb-2">{benefit.title}</h3>
                <p className="text-p16 text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-h2 text-text-primary mb-4">
              Jak koučovací balíček probíhá
            </h2>
            <p className="text-p18 text-gray-600">
              Strukturovaný proces pro maximální efektivitu
            </p>
          </div>

          <div className="space-y-8">
            {serviceDetails.process.map((step, index) => (
              <div key={index} className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{step.step}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-h3 text-text-primary mb-2">
                    {step.title}
                  </h3>
                  <p className="text-p16 text-gray-600">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-h2 text-text-primary mb-4">
              Co říkají klienti
            </h2>
            <p className="text-p18 text-gray-600">
              Reference od klientů, kteří prošli koučovacím balíčkem
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {serviceDetails.testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-p16 text-gray-600 mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <div className="font-semibold text-text-primary">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-h2 text-text-primary mb-4">
            Začněte svou transformaci
          </h2>
          <p className="text-p18 text-gray-600 mb-8">
            Rezervujte si koučovací balíček a začněte svou cestu k naplněnému životu
          </p>
          <a
            href="#booking"
            className="bg-primary-500 text-white px-8 py-4 rounded-lg hover:bg-primary-600 transition-colors text-asul18 font-medium inline-block"
          >
            Rezervovat nyní
          </a>
        </div>
      </section>

      <Footer />
    </main>
  )
}
