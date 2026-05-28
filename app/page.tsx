'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
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
              <svg
                className="w-5 h-5 md:w-6 md:h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.935 1.205l-.335.203-3.479-.913.928 3.6-.235.374a9.86 9.86 0 001.516 5.394l.087.133a9.85 9.85 0 005.378 2.655l.41.035c.393 0 .77-.025 1.148-.08 1.832-.213 3.522-1.024 4.869-2.33.827-.823 1.538-1.847 2.09-3.03.55-1.18.85-2.47.85-3.81 0-.31-.01-.62-.031-.926A6.975 6.975 0 0012 5.75c-3.872 0-7 3.128-7 7s3.128 7 7 7 7-3.128 7-7-3.128-7-7-7z" />
              </svg>
            </a>
            
            {/* TikTok */}
            <a
              href="https://www.tiktok.com/@muhammad.the.edit"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 hover:text-blue-600 transition-all duration-200 shadow-sm hover:shadow-md"
              title="Follow us on TikTok"
            >
              <svg
                className="w-5 h-5 md:w-6 md:h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M19.498 3.094c-.281-.423-.769-.484-1.063-.472-.494.024-3.356 1.126-5.435 4.972-.203.35-.37.693-.526 1.029-1.079-.243-2.261.194-2.926 1.237-.773 1.266-.49 2.848.543 3.654-.05.183-.105.365-.158.545-.732 2.404-.965 5.05-.73 6.536.151.95.777 1.743 1.634 2.083.501.208 1.026.225 1.525.06.926-.314 1.676-1.104 1.902-2.035.106-.444.217-1.254.304-2.207.133-1.422.278-3.124.577-4.29.088-.341.195-.673.315-.984.66 1.066 1.784 1.738 3.073 1.738 2.036 0 3.697-1.661 3.697-3.696 0-1.633-.997-3.041-2.42-3.58.37-1.193.98-3.065 1.527-4.477z" />
              </svg>
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
              <Button
                asChild
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={!isReadyToContinue}
                onClick={handleContinue}
              >
                <Link href="/products">
                  Find Your Perfect Device
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="flex-1"
              >
                <Link href="/products">
                  Browse All
                </Link>
              </Button>
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
