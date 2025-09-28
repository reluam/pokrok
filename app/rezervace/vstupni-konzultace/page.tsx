'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, Users, CheckCircle, Star, Target, Lightbulb, MessageCircle } from 'lucide-react'
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
  title: 'Zkušební hodina zdarma',
  subtitle: '1 hodina',
  price: 'Zdarma',
  duration: '60 minut',
  description: 'Vyzkoušejte si koučing zdarma a uvidíte, zda vám vyhovuje. Plnohodnotné koučovací sezení bez závazků. Ideální pro ty, kteří chtějí poznat můj styl práce a rozhodnout se, zda pokračovat.',
  features: [
    'Plnohodnotné koučovací sezení',
    'Praktické ukázky technik',
    'Seznámení s koučovacím procesem',
    'Definování vašich cílů a potřeb',
    'Doporučení vhodného typu koučingu',
    'Odpovědi na všechny vaše otázky',
    'Bez závazků - můžete se rozhodnout později',
    'Flexibilní termíny - online i osobně'
  ],
  benefits: [
    {
      icon: MessageCircle,
      title: 'Osobní seznámení',
      description: 'Poznáte svého kouče a zjistíte, zda si rozumíte'
    },
    {
      icon: Target,
      title: 'Jasné cíle',
      description: 'Definujete si, co skutečně chcete dosáhnout'
    },
    {
      icon: Lightbulb,
      title: 'Odborné doporučení',
      description: 'Získáte profesionální doporučení dalšího postupu'
    },
    {
      icon: Clock,
      title: 'Úspora času',
      description: 'Rychle zjistíte, zda je koučing pro vás vhodný'
    }
  ],
  whatToExpect: [
    {
      step: '1',
      title: 'Úvod a seznámení',
      description: 'Představíme se a probereme, co vás k konzultaci přivedlo'
    },
    {
      step: '2',
      title: 'Analýza situace',
      description: 'Probereme vaši současnou situaci a identifikujeme klíčové oblasti'
    },
    {
      step: '3',
      title: 'Definování cílů',
      description: 'Společně definujeme, čeho chcete dosáhnout'
    },
    {
      step: '4',
      title: 'Doporučení',
      description: 'Navrhneme nejvhodnější typ koučingu a další kroky'
    }
  ],
  testimonials: [
    {
      name: 'Jana Svobodová',
      role: 'Maminka na rodičovské',
      content: 'Konzultace mi pomohla ujasnit si, co skutečně chci. Byla jsem si nejistá, zda je koučing pro mě vhodný, ale po 30 minutách jsem to věděla.',
      rating: 5
    },
    {
      name: 'Martin Procházka',
      role: 'IT specialista',
      content: 'Skvělý způsob, jak se seznámit s koučingem bez závazků. Konzultace byla velmi přínosná a pomohla mi rozhodnout se pro koučovací balíček.',
      rating: 5
    }
  ]
}

export default function ConsultationPage() {
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
                <Calendar className="w-6 h-6 text-[#3E603B]" />
                <span className="text-asul18 text-[#3E603B]">Konzultace</span>
              </div>
              <h1 className="text-h1 text-text-primary mb-4">
                {serviceDetails.title}
              </h1>
              <p className="text-p18 text-gray-600 mb-6">
                {serviceDetails.description}
              </p>
              
              <div className="flex items-center space-x-4 mb-6">
                <div className="text-3xl font-bold text-[#3E603B]">
                  {serviceDetails.price}
                </div>
                <div className="text-lg text-gray-500">
                  za konzultaci
                </div>
              </div>

              <div className="flex items-center space-x-6 text-p16 text-gray-600 mb-8">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>{serviceDetails.duration}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Bez závazků</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#3E603B]/10 to-[#3E603B]/20 rounded-2xl p-6 mb-8 border border-[#3E603B]/30">
                <h3 className="text-h3 text-text-primary mb-4">Co získáte</h3>
                <div className="space-y-3">
                  {serviceDetails.features.slice(0, 4).map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-[#3E603B] flex-shrink-0 mt-0.5" />
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
                  Rezervujte si zkušební hodinu
                </h3>
                <p className="text-p16 text-gray-600">
                  Vyberte si vhodný termín
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
              Co je zahrnuto v konzultaci
            </h2>
            <p className="text-p18 text-gray-600">
              Kompletní přehled toho, co můžete očekávat
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {serviceDetails.features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 bg-white rounded-lg shadow-sm">
                <CheckCircle className="w-5 h-5 text-[#3E603B] flex-shrink-0 mt-0.5" />
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
              Výhody vstupní konzultace
            </h2>
            <p className="text-p18 text-gray-600">
              Proč je konzultace skvělým začátkem
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {serviceDetails.benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-[#3E603B] rounded-full flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-h4 text-text-primary mb-2">{benefit.title}</h3>
                <p className="text-p16 text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What to Expect Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-h2 text-text-primary mb-4">
              Co můžete očekávat
            </h2>
            <p className="text-p18 text-gray-600">
              Struktura 30minutové konzultace
            </p>
          </div>

          <div className="space-y-8">
            {serviceDetails.whatToExpect.map((step, index) => (
              <div key={index} className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-[#3E603B] rounded-full flex items-center justify-center">
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
              Reference od klientů, kteří využili vstupní konzultaci
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
            Začněte s konzultací
          </h2>
          <p className="text-p18 text-gray-600 mb-8">
            Rezervujte si vstupní konzultaci a zjistěte, jak vám koučing může pomoci
          </p>
          <a
            href="#booking"
            className="bg-[#3E603B]/10 text-[#3E603B] border-2 border-[#3E603B] px-8 py-4 rounded-lg hover:bg-[#3E603B]/20 transition-colors text-asul18 font-medium inline-block"
          >
            Rezervovat nyní
          </a>
        </div>
      </section>

      <Footer />
    </main>
  )
}
