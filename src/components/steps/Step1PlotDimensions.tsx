import React from 'react';
import { CalculationInput } from '@/types/calculation';
import { PRESETS } from '@/config/presets';
import { formatCurrency } from '@/lib/formatters';
import { Landmark, Home, Warehouse, HelpCircle } from 'lucide-react';

interface StepProps {
  input: CalculationInput;
  onChange: (updates: Partial<CalculationInput>) => void;
}

export function Step1PlotDimensions({ input, onChange }: StepProps) {
  const lagfartBelopp =
    input.tomtPris > 0
      ? Math.round(input.tomtPris * (input.lagfartProcent / 100) + PRESETS.lagfart.expeditionsavgift)
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Tomt och byggnadsdimensioner</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Ange husets grundläggande areor och tomtpris. Dessa kvadratmeterytor används som gemensam
          beräkningshjälp för material, montering, golv, altan och planavgifter i hela kalkylen.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Tomtpris */}
        <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-3">
          <div className="flex items-center space-x-2">
            <Landmark className="w-4 h-4 text-slate-700" />
            <label htmlFor="tomtPris" className="text-sm font-semibold text-slate-900">
              Tomtpris / Köpeskilling (kr)
            </label>
          </div>
          <p className="text-xs text-slate-500">
            Ange 0 kr om tomten redan ägs eller är förvärvad utanför denna kalkyl.
          </p>
          <div className="relative">
            <input
              id="tomtPris"
              type="number"
              min="0"
              step="50000"
              value={input.tomtPris === 0 ? '' : input.tomtPris}
              onChange={(e) => onChange({ tomtPris: Number(e.target.value) || 0 })}
              placeholder="0"
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
            />
            <span className="absolute right-3.5 top-2.5 text-xs text-slate-400">SEK</span>
          </div>

          {/* Lagfartsvisning */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-600">Beräknad lagfartskostnad (1,5 % + exp.avgift):</span>
            <span className="font-semibold text-slate-900">{formatCurrency(lagfartBelopp)}</span>
          </div>
        </div>

        {/* Husets bostadsyta */}
        <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-3">
          <div className="flex items-center space-x-2">
            <Home className="w-4 h-4 text-slate-700" />
            <label htmlFor="husBostadsyta" className="text-sm font-semibold text-slate-900">
              Husets bostadsyta (m² BOA / BTA)
            </label>
          </div>
          <p className="text-xs text-slate-500">
            Huvudbyggnadens planerade invändiga boyta eller bruttoarea.
          </p>
          <div className="relative">
            <input
              id="husBostadsyta"
              type="number"
              min="30"
              max="600"
              step="5"
              value={input.husBostadsyta}
              onChange={(e) => onChange({ husBostadsyta: Math.max(1, Number(e.target.value) || 1) })}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
            />
            <span className="absolute right-3.5 top-2.5 text-xs text-slate-400">m²</span>
          </div>
          <div className="flex gap-2">
            {[120, 145, 165, 190].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => onChange({ husBostadsyta: size })}
                className={`px-2 py-1 text-xs rounded border transition-colors cursor-pointer ${
                  input.husBostadsyta === size
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {size} m²
              </button>
            ))}
          </div>
        </div>

        {/* Extrabyggnader */}
        <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-3 md:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Warehouse className="w-4 h-4 text-slate-700" />
              <label htmlFor="extrabyggnaderYta" className="text-sm font-semibold text-slate-900">
                Komplementbyggnader (Garage, carport, attefallshus mm)
              </label>
            </div>
            <span className="text-xs font-medium text-slate-500">
              {input.extrabyggnaderYta} m²
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Ytan adderas till bruttoarean (BTA) vid beräkning av kommunal planavgift och bygglovstaxa.
          </p>
          <div className="relative max-w-xs">
            <input
              id="extrabyggnaderYta"
              type="number"
              min="0"
              max="200"
              step="5"
              value={input.extrabyggnaderYta}
              onChange={(e) => onChange({ extrabyggnaderYta: Math.max(0, Number(e.target.value) || 0) })}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
            />
            <span className="absolute right-3.5 top-2.5 text-xs text-slate-400">m²</span>
          </div>
        </div>
      </div>

      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-start space-x-2">
        <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-800">Beräkningshjälp:</span> Den totala
          planerade byggnadsytan är{' '}
          <strong className="text-slate-900">{input.husBostadsyta + input.extrabyggnaderYta} m²</strong>.
          Lagfart beräknas till 1,5 % av tomtpriset ({formatCurrency(input.tomtPris)}) + 825 kr i fast
          expeditionsavgift.
        </div>
      </div>
    </div>
  );
}
