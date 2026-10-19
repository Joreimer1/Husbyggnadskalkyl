'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { CalculationInput } from '@/types/calculation';
import { DEFAULT_CALCULATION_INPUT } from '@/config/presets';
import { calculateHouseProject } from '@/lib/calculator';
import { Header } from '@/components/Header';
import { StepProgressBar, StepItem } from '@/components/StepProgressBar';
import { SummaryCard } from '@/components/SummaryCard';
import { BreakdownModal } from '@/components/BreakdownModal';
import { Step1PlotDimensions } from '@/components/steps/Step1PlotDimensions';
import { Step2GroundDemolition } from '@/components/steps/Step2GroundDemolition';
import { Step3BuildingKit } from '@/components/steps/Step3BuildingKit';
import { Step4MunicipalityPermits } from '@/components/steps/Step4MunicipalityPermits';
import { Step5InfrastructureLogistics } from '@/components/steps/Step5InfrastructureLogistics';
import { Step6InteriorOptions } from '@/components/steps/Step6InteriorOptions';
import { Step7LandscapeFinance } from '@/components/steps/Step7LandscapeFinance';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/formatters';

const STEPS: StepItem[] = [
  {
    id: 1,
    title: 'Tomt och byggnadsdimensioner',
    shortTitle: '1. Dimensioner',
    description: 'Tomtpris, boyta och komplementbyggnader.',
  },
  {
    id: 2,
    title: 'Markarbete, schakt och rivning',
    shortTitle: '2. Mark & Rivning',
    description: 'Schaktning, bergsprängning, VA-rörgrav och rivningsbehov.',
  },
  {
    id: 3,
    title: 'Byggnation, husmaterialsats och montering',
    shortTitle: '3. Bygg & Material',
    description: 'Husmaterialsats (10–14 tkr/m²), montering och målning.',
  },
  {
    id: 4,
    title: 'Kommunala avgifter, tillstånd och KA',
    shortTitle: '4. Kommun & Tillstånd',
    description: 'VA-anslutning (Värmdö vs Standard), bygglov, planavgift och KA.',
  },
  {
    id: 5,
    title: 'Infrastruktur och logistik',
    shortTitle: '5. Infrastruktur',
    description: 'Fiber, omlastning för trång väg och byggelskåp.',
  },
  {
    id: 6,
    title: 'Inredning, tillval och material',
    shortTitle: '6. Inredning & Tillval',
    description: 'Kök, badrumskakel, golvuppgradering och snickerier.',
  },
  {
    id: 7,
    title: 'Utemiljö, tomt och finansiering',
    shortTitle: '7. Utemiljö & Finans',
    description: 'Finplanering tomt, altan, byggnadskreditiv och pantbrev.',
  },
];

export default function HouseCalculatorPage() {
  const [input, setInput] = useState<CalculationInput>(DEFAULT_CALCULATION_INPUT);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isAllStepsMode, setIsAllStepsMode] = useState<boolean>(false);
  const [isBreakdownOpen, setIsBreakdownOpen] = useState<boolean>(false);

  // Realtidsberäkning
  const result = useMemo(() => {
    return calculateHouseProject(input);
  }, [input]);

  // Uppdatera formulärvärden
  const handleInputChange = useCallback((updates: Partial<CalculationInput>) => {
    setInput((prev) => ({ ...prev, ...updates }));
  }, []);

  // Återställ till standard
  const handleReset = useCallback(() => {
    setInput(DEFAULT_CALCULATION_INPUT);
    setCurrentStep(1);
  }, []);

  // Snabbscenarier
  const applyScenario = useCallback((scenario: 'standard' | 'varmdo' | 'inaccessible') => {
    if (scenario === 'standard') {
      setInput((prev) => ({
        ...prev,
        tomtPris: 1200000,
        grundarbetePreset: 'flat_near_sewer',
        extraAvloppEnabled: false,
        kommunTyp: 'standard',
        fiberPreset: 'campaign',
        harRivningsbehov: false,
        omlastningBehov: false,
        invasivaVaxterTyp: 'none',
      }));
    } else if (scenario === 'varmdo') {
      setInput((prev) => ({
        ...prev,
        tomtPris: 2200000,
        grundarbetePreset: 'blasting_slope',
        extraAvloppEnabled: true,
        extraAvloppMeter: 30,
        extraAvloppTerrain: 'difficult',
        kommunTyp: 'growth', // Värmdö 360 000 kr
        fiberPreset: 'no_campaign', // Efteranslutning 150 000 kr
        harRivningsbehov: true,
        rivningsYta: 55,
        harAsbestrisk: false,
        omlastningBehov: false,
      }));
    } else if (scenario === 'inaccessible') {
      setInput((prev) => ({
        ...prev,
        tomtPris: 1800000,
        grundarbetePreset: 'inaccessible_blasting_road',
        extraAvloppEnabled: true,
        extraAvloppMeter: 60,
        extraAvloppTerrain: 'blasting',
        kommunTyp: 'growth',
        fiberPreset: 'no_campaign',
        harRivningsbehov: true,
        rivningsYta: 70,
        harAsbestrisk: true,
        omlastningBehov: true,
        invasivaVaxterTyp: 'small_knotweed',
      }));
    }
  }, []);

  // Utskrift
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Stegnavigering
  const goToNextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setIsBreakdownOpen(true);
    }
  };

  const goToPrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      {/* Header */}
      <Header onReset={handleReset} onPrint={handlePrint} />

      {/* Stegindikator & lägesväljare */}
      <StepProgressBar
        steps={STEPS}
        currentStep={currentStep}
        onSelectStep={(stepId) => setCurrentStep(stepId)}
        isAllStepsMode={isAllStepsMode}
        onToggleAllStepsMode={() => setIsAllStepsMode((prev) => !prev)}
      />

      {/* Huvudinnehåll */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Snabbscenarier */}
        <div className="mb-6 p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-800 uppercase tracking-wider text-[11px]">
              Snabbval & Typfall:
            </span>
            <span className="text-slate-500 hidden md:inline">
              Ladda förvalda typfall för snabbare kalkylering
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyScenario('standard')}
              className="px-2.5 py-1.5 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition-colors cursor-pointer"
            >
              Standardtomt (Standardkommun, plan tomt)
            </button>
            <button
              type="button"
              onClick={() => applyScenario('varmdo')}
              className="px-2.5 py-1.5 rounded-md border border-blue-200 bg-blue-50/50 hover:bg-blue-100/70 text-blue-900 font-medium transition-colors cursor-pointer"
            >
              Värmdö / Tillväxtkommun (360k VA, berg, rivning)
            </button>
            <button
              type="button"
              onClick={() => applyScenario('inaccessible')}
              className="px-2.5 py-1.5 rounded-md border border-amber-200 bg-amber-50/50 hover:bg-amber-100/70 text-amber-900 font-medium transition-colors cursor-pointer"
            >
              Svårtillgänglig tomt (Omlastning, sprängning, asbest)
            </button>
          </div>
        </div>

        {/* Layout i två kolumner på desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Vänster kolumn: Formulär (7 steg) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-7">
              {isAllStepsMode ? (
                /* Fullständig vy med alla sektioner i följd */
                <div className="space-y-10 divide-y divide-slate-200">
                  <div className="pt-2 first:pt-0">
                    <Step1PlotDimensions input={input} onChange={handleInputChange} />
                  </div>
                  <div className="pt-8">
                    <Step2GroundDemolition input={input} onChange={handleInputChange} />
                  </div>
                  <div className="pt-8">
                    <Step3BuildingKit input={input} onChange={handleInputChange} />
                  </div>
                  <div className="pt-8">
                    <Step4MunicipalityPermits input={input} onChange={handleInputChange} />
                  </div>
                  <div className="pt-8">
                    <Step5InfrastructureLogistics input={input} onChange={handleInputChange} />
                  </div>
                  <div className="pt-8">
                    <Step6InteriorOptions input={input} onChange={handleInputChange} />
                  </div>
                  <div className="pt-8">
                    <Step7LandscapeFinance
                      input={input}
                      onChange={handleInputChange}
                      subtotalBeforeFinance={result.totalProjectCost - result.finansieringSubtotal}
                    />
                  </div>
                </div>
              ) : (
                /* Steg-för-steg-läge */
                <div>
                  {currentStep === 1 && (
                    <Step1PlotDimensions input={input} onChange={handleInputChange} />
                  )}
                  {currentStep === 2 && (
                    <Step2GroundDemolition input={input} onChange={handleInputChange} />
                  )}
                  {currentStep === 3 && (
                    <Step3BuildingKit input={input} onChange={handleInputChange} />
                  )}
                  {currentStep === 4 && (
                    <Step4MunicipalityPermits input={input} onChange={handleInputChange} />
                  )}
                  {currentStep === 5 && (
                    <Step5InfrastructureLogistics input={input} onChange={handleInputChange} />
                  )}
                  {currentStep === 6 && (
                    <Step6InteriorOptions input={input} onChange={handleInputChange} />
                  )}
                  {currentStep === 7 && (
                    <Step7LandscapeFinance
                      input={input}
                      onChange={handleInputChange}
                      subtotalBeforeFinance={result.totalProjectCost - result.finansieringSubtotal}
                    />
                  )}

                  {/* Stegnavigeringsknappar */}
                  <div className="mt-8 pt-5 border-t border-slate-200 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={goToPrevStep}
                      disabled={currentStep === 1}
                      className={`inline-flex items-center px-4 py-2 border rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                        currentStep === 1
                          ? 'border-slate-200 text-slate-300 bg-slate-50 cursor-not-allowed'
                          : 'border-slate-300 text-slate-700 bg-white hover:bg-slate-50 shadow-xs'
                      }`}
                    >
                      <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                      Föregående steg
                    </button>

                    <div className="text-xs text-slate-500 font-medium">
                      Steg {currentStep} av {STEPS.length}
                    </div>

                    <button
                      type="button"
                      onClick={goToNextStep}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-xs transition-colors cursor-pointer"
                    >
                      <span>{currentStep === STEPS.length ? 'Visa slutkalkyl' : 'Nästa steg'}</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Professionell informationstext under kalkylatorn */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white/70 text-xs text-slate-600 space-y-1.5">
              <h3 className="font-semibold text-slate-900">Ansvarsfriskrivning & Kalkylförutsättningar</h3>
              <p>
                Kalkylatorn bygger på generella branschschabloner för svensk småhusproduktion,
                aktuella kommunala taxor och schabloner för markentreprenad. Slutliga priser för
                grundarbete, schakt och bergsprängning kräver alltid geoteknisk markundersökning,
                preciserad rördragning samt bindande entreprenadkontrakt med behöriga entreprenörer.
              </p>
            </div>
          </div>

          {/* Höger kolumn: Sticky Realtidssummering */}
          <div className="lg:col-span-4">
            <SummaryCard result={result} onOpenBreakdown={() => setIsBreakdownOpen(true)} />
          </div>
        </div>
      </main>

      {/* Utskriftsvy (syns endast vid print) */}
      <div className="hidden print-only p-8 text-black bg-white">
        <div className="border-b-2 border-black pb-4 mb-6">
          <h1 className="text-2xl font-bold">Produktionskostnadskalkyl - Husbyggnation</h1>
          <p className="text-sm text-gray-600">
            Upprättad med Husbyggnadskalkylator. Bostadsyta: {input.husBostadsyta} m² | Komplementyta:{' '}
            {input.extrabyggnaderYta} m²
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="p-3 border border-black">
            <span className="text-xs uppercase font-bold block">Total projektkostnad</span>
            <span className="text-2xl font-extrabold">{formatCurrency(result.totalProjectCost)}</span>
          </div>
          <div className="p-3 border border-black">
            <span className="text-xs uppercase font-bold block">Kostnad per m² boyta</span>
            <span className="text-xl font-bold">{formatNumber(result.costPerSqmTotal)} kr/m²</span>
          </div>
        </div>

        <div className="space-y-4">
          {result.categoryList.map((category) => (
            <div key={category.id} className="border-b border-gray-300 pb-3">
              <div className="flex justify-between font-bold text-sm mb-1">
                <span>{category.title}</span>
                <span>{formatCurrency(category.total)}</span>
              </div>
              <table className="w-full text-xs">
                <tbody>
                  {category.items.map((item) => (
                    <tr key={item.id} className="border-t border-gray-100">
                      <td className="py-1">{item.name}</td>
                      <td className="py-1 text-gray-600">{item.formulaNote}</td>
                      <td className="py-1 text-right font-medium">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>

      {/* Detaljerad specifikationsmodal */}
      <BreakdownModal
        isOpen={isBreakdownOpen}
        onClose={() => setIsBreakdownOpen(false)}
        result={result}
        onPrint={handlePrint}
      />
    </div>
  );
}
