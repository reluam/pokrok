'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, ArrowRight, Target, Heart, Zap } from 'lucide-react'

export function InitialOnboarding() {
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedValues, setSelectedValues] = useState<string[]>([])
  const [customValue, setCustomValue] = useState('')
  const [isCompleting, setIsCompleting] = useState(false)
  const router = useRouter()

  const predefinedValues = [
    { id: 'health', name: 'Zdraví', icon: '💪', description: 'Fyzické a duševní zdraví' },
    { id: 'family', name: 'Rodina', icon: '👨‍👩‍👧‍👦', description: 'Vztahy s blízkými' },
    { id: 'career', name: 'Kariéra', icon: '💼', description: 'Profesní růst a úspěch' },
    { id: 'learning', name: 'Učení', icon: '📚', description: 'Rozvoj znalostí a dovedností' },
    { id: 'adventure', name: 'Dobrodružství', icon: '🌍', description: 'Nové zážitky a cestování' },
    { id: 'creativity', name: 'Kreativita', icon: '🎨', description: 'Umělecké vyjádření' },
    { id: 'community', name: 'Komunita', icon: '🤝', description: 'Pomoc druhým' },
    { id: 'spirituality', name: 'Duchovno', icon: '🧘', description: 'Vnitřní klid a moudrost' }
  ]

  const steps = [
    {
      title: 'Vítejte na Cestě!',
      subtitle: 'Pojďme společně vytvořit váš osobní rozvojový plán',
      content: (
        <div className="text-center space-y-6">
          <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
            <Target className="w-12 h-12 text-primary-600" />
          </div>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            Tato aplikace vám pomůže definovat vaše hodnoty, stanovit cíle a sledovat pokrok na cestě k lepšímu životu.
          </p>
        </div>
      )
    },
    {
      title: 'Jaké jsou vaše hodnoty?',
      subtitle: 'Vyberte 3-5 hodnot, které jsou pro vás nejdůležitější',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {predefinedValues.map((value) => (
              <button
                key={value.id}
                onClick={() => {
                  if (selectedValues.includes(value.id)) {
                    setSelectedValues(prev => prev.filter(id => id !== value.id))
                  } else if (selectedValues.length < 5) {
                    setSelectedValues(prev => [...prev, value.id])
                  }
                }}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  selectedValues.includes(value.id)
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300'
                } ${selectedValues.length >= 5 && !selectedValues.includes(value.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{value.icon}</span>
                  <div>
                    <div className="font-medium">{value.name}</div>
                    <div className="text-sm text-gray-500">{value.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nebo přidejte vlastní hodnotu:
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                placeholder="Např. Svoboda, Mír, Rovnováha..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <button
                onClick={() => {
                  if (customValue.trim() && selectedValues.length < 5) {
                    setSelectedValues(prev => [...prev, customValue.trim()])
                    setCustomValue('')
                  }
                }}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                Přidat
              </button>
            </div>
          </div>
          
          <div className="text-sm text-gray-500 text-center">
            Vybráno: {selectedValues.length}/5 hodnot
          </div>
        </div>
      )
    },
    {
      title: 'Nastavte svůj první cíl',
      subtitle: 'Začněte s něčím konkrétním a dosažitelným',
      content: (
        <div className="text-center space-y-6">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <Zap className="w-12 h-12 text-green-600" />
          </div>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            Nyní můžete přidat svůj první cíl. Můžete to udělat později v aplikaci, nebo pokračovat hned teď.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => {
                setIsCompleting(true)
                completeOnboarding()
              }}
              className="w-full bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors font-medium"
            >
              Pokračovat do aplikace
            </button>
            <p className="text-sm text-gray-500">
              Cíle můžete přidat kdykoliv později
            </p>
          </div>
        </div>
      )
    }
  ]

  const completeOnboarding = async () => {
    try {
      // Save selected values to database
      const response = await fetch('/api/cesta/complete-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ values: selectedValues })
      })

      if (response.ok) {
        // Redirect to main dashboard
        router.push('/moje')
      } else {
        console.error('Failed to complete onboarding')
        // Still redirect to avoid getting stuck
        router.push('/moje')
      }
    } catch (error) {
      console.error('Error completing onboarding:', error)
      // Still redirect to avoid getting stuck
      router.push('/moje')
    }
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceed = () => {
    if (currentStep === 1) {
      return selectedValues.length >= 3
    }
    return true
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
              <span>Krok {currentStep + 1} z {steps.length}</span>
              <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Step Content */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {steps[currentStep].title}
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              {steps[currentStep].subtitle}
            </p>
            
            {steps[currentStep].content}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                currentStep === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Zpět
            </button>

            {currentStep < steps.length - 1 ? (
              <button
                onClick={nextStep}
                disabled={!canProceed()}
                className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                  canProceed()
                    ? 'bg-primary-500 text-white hover:bg-primary-600'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <span>Další</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsCompleting(true)
                  completeOnboarding()
                }}
                disabled={isCompleting}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center space-x-2 disabled:opacity-50"
              >
                {isCompleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Dokončuji...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Dokončit</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
