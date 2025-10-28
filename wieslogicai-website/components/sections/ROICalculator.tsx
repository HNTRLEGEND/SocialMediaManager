'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Calculator, TrendingUp, Clock, DollarSign, AlertCircle, CheckCircle } from 'lucide-react'

export default function ROICalculator() {
  // Input states
  const [missedCalls, setMissedCalls] = useState(10)
  const [avgOrderValue, setAvgOrderValue] = useState(140)
  const [employeeWage, setEmployeeWage] = useState(20)
  const [hoursOnPhone, setHoursOnPhone] = useState(15)

  // Calculated results
  const [results, setResults] = useState({
    lostRevenue: 0,
    timeCost: 0,
    totalLoss: 0,
    yearlyLoss: 0,
    roi: 0,
    paybackMonths: 0,
    hoursSaved: 0,
  })

  useEffect(() => {
    calculateROI()
  }, [missedCalls, avgOrderValue, employeeWage, hoursOnPhone])

  const calculateROI = () => {
    // Lost revenue from missed calls (assume 30% would convert)
    const conversionRate = 0.3
    const lostRevenue = missedCalls * avgOrderValue * conversionRate * 20 // per month (20 working days)

    // Time cost (staff hours on phone)
    const timeCost = hoursOnPhone * employeeWage * 4 // per month (4 weeks)

    // Total monthly loss
    const totalLoss = lostRevenue + timeCost

    // Yearly projections
    const yearlyLoss = totalLoss * 12

    // ROI calculation (compared to AI Agent cost of €999/month)
    const aiAgentCost = 999
    const monthlySavings = totalLoss - aiAgentCost
    const roi = ((monthlySavings * 12) / (aiAgentCost * 12)) * 100

    // Payback period
    const paybackMonths = aiAgentCost / monthlySavings

    // Hours saved per week (assume AI handles 80% of phone work)
    const hoursSaved = hoursOnPhone * 0.8

    setResults({
      lostRevenue: Math.round(lostRevenue),
      timeCost: Math.round(timeCost),
      totalLoss: Math.round(totalLoss),
      yearlyLoss: Math.round(yearlyLoss),
      roi: Math.round(roi),
      paybackMonths: Math.max(0.1, paybackMonths),
      hoursSaved: Math.round(hoursSaved * 10) / 10,
    })
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <section id="roi" className="relative py-24 lg:py-32 overflow-hidden bg-primary-900">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[800px]
        bg-electric-500/10 blur-[200px]" />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full
            bg-electric-500/10 border border-electric-500/30
            text-electric-500 text-sm font-semibold uppercase tracking-wider mb-6">
            <Calculator className="w-4 h-4" />
            ROI-Rechner
          </div>

          <h2 className="font-display text-4xl md:text-6xl font-bold text-white mb-6">
            <span className="block">Wie viel verlieren Sie</span>
            <span className="block">
              durch{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-500 to-electric-500">
                verpasste Anrufe?
              </span>
            </span>
          </h2>

          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Berechnen Sie in 60 Sekunden Ihr Einsparpotenzial mit unserem KI Voice Agent
          </p>
        </motion.div>

        {/* Calculator Grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left: Input Controls */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-primary-800/50 to-primary-900/50
              backdrop-blur-xl border border-white/10 rounded-3xl p-8 space-y-8"
          >
            <h3 className="text-2xl font-display font-bold text-white mb-6">
              Ihre aktuellen Zahlen
            </h3>

            {/* Input 1: Missed Calls */}
            <div>
              <label className="flex items-center justify-between mb-3">
                <span className="text-white font-semibold">
                  Verpasste Anrufe pro Tag
                </span>
                <span className="text-electric-500 text-2xl font-bold">{missedCalls}</span>
              </label>
              <input
                type="range"
                min="1"
                max="50"
                value={missedCalls}
                onChange={(e) => setMissedCalls(Number(e.target.value))}
                className="w-full h-2 bg-primary-700 rounded-lg appearance-none cursor-pointer
                  accent-electric-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>1</span>
                <span>50 Anrufe</span>
              </div>
            </div>

            {/* Input 2: Average Order Value */}
            <div>
              <label className="flex items-center justify-between mb-3">
                <span className="text-white font-semibold">
                  Durchschn. Auftragswert
                </span>
                <span className="text-electric-500 text-2xl font-bold">
                  {formatCurrency(avgOrderValue)}
                </span>
              </label>
              <input
                type="range"
                min="20"
                max="1000"
                step="20"
                value={avgOrderValue}
                onChange={(e) => setAvgOrderValue(Number(e.target.value))}
                className="w-full h-2 bg-primary-700 rounded-lg appearance-none cursor-pointer
                  accent-electric-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>€20</span>
                <span>€1.000</span>
              </div>
            </div>

            {/* Input 3: Employee Wage */}
            <div>
              <label className="flex items-center justify-between mb-3">
                <span className="text-white font-semibold">
                  Mitarbeiter-Stundenlohn
                </span>
                <span className="text-electric-500 text-2xl font-bold">
                  {formatCurrency(employeeWage)}
                </span>
              </label>
              <input
                type="range"
                min="12"
                max="50"
                value={employeeWage}
                onChange={(e) => setEmployeeWage(Number(e.target.value))}
                className="w-full h-2 bg-primary-700 rounded-lg appearance-none cursor-pointer
                  accent-electric-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>€12/Std</span>
                <span>€50/Std</span>
              </div>
            </div>

            {/* Input 4: Hours on Phone */}
            <div>
              <label className="flex items-center justify-between mb-3">
                <span className="text-white font-semibold">
                  Stunden am Telefon/Woche
                </span>
                <span className="text-electric-500 text-2xl font-bold">{hoursOnPhone}h</span>
              </label>
              <input
                type="range"
                min="5"
                max="40"
                value={hoursOnPhone}
                onChange={(e) => setHoursOnPhone(Number(e.target.value))}
                className="w-full h-2 bg-primary-700 rounded-lg appearance-none cursor-pointer
                  accent-electric-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>5h</span>
                <span>40h</span>
              </div>
            </div>

            {/* Info Box */}
            <div className="flex items-start gap-3 p-4 bg-electric-500/10 border border-electric-500/30
              rounded-2xl">
              <AlertCircle className="w-5 h-5 text-electric-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-300">
                <strong className="text-white">Konservative Schätzung:</strong> Wir rechnen mit 30% Conversion-Rate
                bei verpassten Anrufen - die reale Zahl kann höher liegen.
              </p>
            </div>
          </motion.div>

          {/* Right: Results */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {/* Main Result Card */}
            <div className="bg-gradient-to-br from-neon-500/20 to-electric-500/20
              backdrop-blur-xl border-2 border-neon-500/60 rounded-3xl p-8
              shadow-[0_0_60px_rgba(255,0,128,0.3)]">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-8 h-8 text-neon-500" />
                <h3 className="text-xl font-display font-bold text-white">
                  Ihr Einsparpotenzial
                </h3>
              </div>

              <div className="space-y-4">
                {/* Total Monthly Loss */}
                <div>
                  <div className="text-gray-400 text-sm uppercase tracking-wider mb-2">
                    Monatlicher Verlust (aktuell)
                  </div>
                  <div className="text-5xl font-display font-bold text-white">
                    {formatCurrency(results.totalLoss)}
                  </div>
                  <div className="text-sm text-gray-300 mt-1">
                    ≈ {formatCurrency(results.yearlyLoss)} pro Jahr
                  </div>
                </div>

                {/* Breakdown */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                  <div>
                    <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                      Entgangener Umsatz
                    </div>
                    <div className="text-xl font-bold text-neon-500">
                      {formatCurrency(results.lostRevenue)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                      Personalkosten
                    </div>
                    <div className="text-xl font-bold text-electric-500">
                      {formatCurrency(results.timeCost)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Savings with AI */}
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20
              backdrop-blur-xl border-2 border-green-500/60 rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <h3 className="text-xl font-display font-bold text-white">
                  Mit WiesLogic AI Voice Agent
                </h3>
              </div>

              <div className="space-y-6">
                {/* Monthly Savings */}
                <div>
                  <div className="text-gray-400 text-sm uppercase tracking-wider mb-2">
                    Monatliche Ersparnis
                  </div>
                  <div className="text-4xl font-display font-bold text-green-400">
                    {formatCurrency(results.totalLoss - 999)}
                  </div>
                  <div className="text-sm text-gray-300 mt-1">
                    nach Abzug von €999 Abo-Kosten
                  </div>
                </div>

                {/* KPIs Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-2xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-electric-500" />
                      <div className="text-gray-400 text-xs uppercase tracking-wider">
                        Zeit gespart
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {results.hoursSaved}h
                    </div>
                    <div className="text-xs text-gray-400">pro Woche</div>
                  </div>

                  <div className="p-4 bg-white/5 rounded-2xl">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-electric-500" />
                      <div className="text-gray-400 text-xs uppercase tracking-wider">
                        ROI
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {results.roi > 0 ? '+' : ''}{results.roi}%
                    </div>
                    <div className="text-xs text-gray-400">im ersten Jahr</div>
                  </div>

                  <div className="p-4 bg-white/5 rounded-2xl col-span-2">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-electric-500" />
                      <div className="text-gray-400 text-xs uppercase tracking-wider">
                        Amortisation
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {results.paybackMonths.toFixed(1)} Monate
                    </div>
                    <div className="text-xs text-gray-400">
                      bis sich die Investition rentiert
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="text-center"
            >
              <button className="w-full px-8 py-5 bg-gradient-to-r from-electric-500 to-neon-500
                text-primary-900 rounded-full font-display font-bold text-lg
                shadow-[0_0_40px_rgba(0,240,255,0.4)]
                hover:shadow-[0_0_60px_rgba(0,240,255,0.6)]
                transition-all duration-300">
                Jetzt kostenlose Beratung buchen & {formatCurrency(results.totalLoss - 999)}/Monat sparen
              </button>
              <p className="text-sm text-gray-400 mt-4">
                ✓ 30 Tage testen ✓ Keine Einrichtungsgebühr ✓ Monatlich kündbar
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
