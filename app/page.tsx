'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { MessageCircle, Music } from 'lucide-react'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function Home() {
  const { questionnaire, setQuestionnaireData } = useStore()
  const [selectedBudget, setSelectedBudget] = useState<string | null>(
    questionnaire.budget
  )
  const [selectedSoftware, setSelectedSoftware] = useState<string | null>(
    questionnaire.softwareChoice
  )

  const budgetOptions = [
    { value: '100k', label: '₦100,000' },
    { value: '200k', label: '₦200,000' },
    { value: '300k', label: '₦300,000' },
    { value: 'above', label: 'Above ₦300,000' },
  ]

  const softwareOptions = [
    {
      value: 'capcut',
      label: 'CapCut',
      specs: '4GB RAM minimum',
      color: 'bg-blue-50 border-blue-200',
    },
    {
      value: 'adobe_premiere',
      label: 'Adobe Premiere Pro',
      specs: '8GB RAM recommended, 16GB+ ideal',
      color: 'bg-red-50 border-red-200',
    },
    {
      value: 'davinci_resolve',
      label: 'DaVinci Resolve',
      specs: '8GB RAM recommended, 16GB+ ideal',
      color: 'bg-orange-50 border-orange-200',
    },
  ]

  const handleContinue = () => {
    if (selectedBudget && selectedSoftware) {
      setQuestionnaireData({
        budget: selectedBudget,
        softwareChoice: selectedSoftware,
        answered: true,
      })
    }
  }

  const isReadyToContinue = selectedBudget && selectedSoftware

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-4 md:px-6 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/nova-gadgets-logo.jpg"
              alt="NOVA GADGETS"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900">
                NOVA GADGETS
              </h1>
              <p className="text-xs md:text-sm text-slate-600">
                For Video Editors
              </p>
            </div>
          </div>
          
          {/* Social Icons */}
          <div className="flex items-center gap-3 md:gap-4">
            {/* WhatsApp */}
            <a
              href="https://wa.me/2347036947900"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-green-50 hover:bg-green-100 text-green-600 hover:text-green-700 transition-all duration-200 shadow-sm hover:shadow-md"
              title="Message us on WhatsApp"
            >
              <MessageCircle className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" />
            </a>
            
            {/* TikTok */}
            <a
              href="https://www.tiktok.com/@muhammad.the.edit"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 hover:text-blue-600 transition-all duration-200 shadow-sm hover:shadow-md"
              title="Follow us on TikTok"
            >
              <Music className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 md:py-12">
        <div className="w-full max-w-2xl">
          <Card className="p-6 md:p-8 shadow-lg">
            {/* Welcome Section */}
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
                Welcome to NOVA GADGETS
              </h2>
              <p className="text-slate-600 mb-2">
                Premium gadgets for video editors
              </p>
              <p className="text-sm text-slate-500">
                Whether you&apos;re using Adobe Premiere Pro, DaVinci Resolve, or CapCut,
                we have the perfect devices for your needs—laptops, mobile phones, AirPods, and more.
              </p>
            </div>

            {/* Budget Selection */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                What&apos;s your budget?
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {budgetOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedBudget(option.value)}
                    className={`p-3 rounded-lg border-2 font-medium transition-all ${
                      selectedBudget === option.value
                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Software Selection */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                What video editing software do you use?
              </h3>
              <div className="space-y-3">
                {softwareOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedSoftware(option.value)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      selectedSoftware === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : `border-slate-200 bg-white hover:border-blue-300 ${option.color}`
                    }`}
                  >
                    <div className="font-semibold text-slate-900">
                      {option.label}
                    </div>
                    <div className="text-sm text-slate-600 mt-1">
                      {option.specs}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <div className="flex gap-3">
              <Link href="/products" className="flex-1">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={!isReadyToContinue}
                  onClick={handleContinue}
                >
                  Find Your Perfect Device
                </Button>
              </Link>
              <Link href="/products" className="flex-1">
                <Button
                  variant="outline"
                  className="w-full"
                >
                  Browse All
                </Button>
              </Link>
            </div>

            {/* Info Section */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    Curated
                  </div>
                  <p className="text-sm text-slate-600">
                    Handpicked for video editors
                  </p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    Verified
                  </div>
                  <p className="text-sm text-slate-600">
                    Specs match your software
                  </p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    Support
                  </div>
                  <p className="text-sm text-slate-600">
                    24/7 on WhatsApp +234 703 694 7900
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </main>
  )
}
