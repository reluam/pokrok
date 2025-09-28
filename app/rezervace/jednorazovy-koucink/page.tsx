'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, Users, CheckCircle, Star, Target, Lightbulb, Zap, MessageCircle, Brain, TrendingUp, HelpCircle } from 'lucide-react'
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
  title: 'Jednorázový koučing',
  subtitle: '1 sezení',
  price: '2 500 Kč',
  duration: '60 minut',
  description: 'Fokusované koučovací sezení pro řešení konkrétních výzev nebo otázek. Ideální pro ty, kteří potřebují rychlé řešení nebo chtějí vyzkoušet koučing.',
  features: [
    'Fokus na konkrétní téma nebo výzvu',
    'Okamžité praktické řešení a doporučení',
    'Individuální přístup na míru',
    'Materiály a cvičení k sezení',
    'E-mailová podpora 7 dní po sezení',
    'Flexibilní termíny - online i osobně',
    'Bez závazků - můžete pokračovat kdykoli',
    'Rychlé výsledky během jednoho sezení'
  ],
  benefits: [
    {
      icon: Zap,
      title: 'Rychlé výsledky',
      description: 'Získáte konkrétní řešení a doporučení během jednoho sezení'
    },
    {
      icon: Target,
      title: 'Fokusované řešení',
      description: 'Zaměříme se na váš konkrétní problém nebo cíl'
    },
    {
      icon: Lightbulb,
      title: 'Nové perspektivy',
      description: 'Získáte nový pohled na situaci a možnosti řešení'
    },
    {
      icon: Clock,
      title: 'Úspora času',
      description: 'Efektivní využití času s okamžitými praktickými výsledky'
    }
  ],
  suitableFor: [
    'Řešení konkrétního problému',
    'Rozhodování o důležité životní změně',
    'Příprava na důležitou situaci',
    'Vyzkoušení koučingu',
    'Rychlé posouzení situace',
    'Získání nové perspektivy',
    'Motivace a podpora',
    'Plánování dalších kroků'
  ],
  testimonials: [
    {
      name: 'Anna Kratochvílová',
      role: 'Učitelka',
      content: 'Jednorázové sezení mi pomohlo vyřešit dilema ohledně změny zaměstnání. Během hodiny jsem získala jasno a věděla, co dělat.',
      rating: 5
    },
    {
      name: 'Tomáš Dvořák',
      role: 'Student',
      content: 'Perfektní způsob, jak vyzkoušet koučing. Sezení bylo velmi přínosné a pomohlo mi s rozhodováním o budoucí kariéře.',
      rating: 5
    }
  ]
}

export default function SingleCoachingPage() {
  // Zaptime configuration
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
                <Calendar className="w-6 h-6 text-primary-600" />
                <span className="text-asul18 text-primary-600">Koučing</span>
              </div>
              <h1 className="text-h1 text-text-primary mb-4">
                {serviceDetails.title}
              </h1>
              <p className="text-p18 text-gray-600 mb-6">
                {serviceDetails.description}
              </p>
              
              <div className="flex items-center space-x-4 mb-6">
                <div className="text-3xl font-bold text-primary-600">
                  {serviceDetails.price}
                </div>
                <div className="text-lg text-gray-500">
                  za sezení
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

              <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-6 mb-8 border border-primary-500/20">
                <h3 className="text-h3 text-text-primary mb-4">Co získáte</h3>
                <div className="space-y-3">
                  {serviceDetails.features.slice(0, 4).map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
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
                   Rezervujte si sezení
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
              Co je zahrnuto v sezení
            </h2>
            <p className="text-p18 text-gray-600">
              Kompletní přehled toho, co můžete očekávat
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {serviceDetails.features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 bg-white rounded-lg shadow-sm">
                <CheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
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
              Výhody jednorázového koučingu
            </h2>
            <p className="text-p18 text-gray-600">
              Proč je jednorázové sezení ideální volbou
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {serviceDetails.benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-h4 text-text-primary mb-2">{benefit.title}</h3>
                <p className="text-p16 text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Suitable For Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-h2 text-text-primary mb-4">
              Pro koho je sezení vhodné
            </h2>
            <p className="text-p18 text-gray-600">
              Situace, kdy je jednorázový koučing nejlepší volbou
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {serviceDetails.suitableFor.map((item, index) => {
              const icons = [Target, MessageCircle, Brain, TrendingUp, Lightbulb, Zap, HelpCircle, Clock]
              const IconComponent = icons[index % icons.length]
              return (
                <div key={index} className="bg-white rounded-lg p-6 shadow-sm text-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-6 h-6 text-primary-600" />
                  </div>
                  <p className="text-p16 text-gray-700">{item}</p>
                </div>
              )
            })}
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
              Reference od klientů, kteří využili jednorázový koučing
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
            Vyřešte svou výzvu ještě dnes
          </h2>
          <p className="text-p18 text-gray-600 mb-8">
            Rezervujte si jednorázové koučovací sezení a získejte jasno v tom, co vás trápí
          </p>
          <a
            href="#booking"
            className="bg-primary-100 text-primary-600 border-2 border-primary-500 px-8 py-4 rounded-lg hover:bg-primary-200 transition-colors text-asul18 font-medium inline-block"
          >
            Rezervovat nyní
          </a>
        </div>
      </section>

      <Footer />
    </main>
  )
}
