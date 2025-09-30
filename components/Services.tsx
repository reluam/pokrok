'use client'

import { Lightbulb, Flag, MessageCircle } from 'lucide-react'

const services = [
  {
    icon: Lightbulb,
    title: 'Inspirace',
    description: 'Gain focus, overcome obstacles, and take clear steps toward a fulfilling and meaningful life.',
    href: '/inspirace'
  },
  {
    icon: Flag,
    title: 'Zdroje',
    description: 'Discover your strengths, refine your skills, and confidently pursue the career you\'ve always wanted.',
    href: '#zdroje'
  },
  {
    icon: MessageCircle,
    title: 'Koučing',
    description: 'Develop a resilient mindset, embrace challenges, and create sustainable habits for long-term success.',
    href: '/koucink'
  }
]

export default function Services() {
  return (
    <section className="py-20">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 dashed-border">
          {services.map((service, index) => (
            <div key={index} className="text-center space-y-4 p-8">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center">
                  <service.icon className="w-8 h-8 text-white" />
                </div>
              </div>
                  <h3 className="text-h3 text-text-primary underline decoration-primary-500 decoration-2 underline-offset-4">
                    {service.title}
                  </h3>
                  <p className="text-p16 text-gray-600">
                    {service.description}
                  </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
