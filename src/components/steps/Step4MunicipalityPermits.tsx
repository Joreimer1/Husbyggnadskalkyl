import React from 'react';
import { CalculationInput, MunicipalityType } from '@/types/calculation';
import { PRESETS } from '@/config/presets';
import { formatCurrency } from '@/lib/formatters';
import { Droplet, FileText, Map, ShieldCheck, AlertCircle } from 'lucide-react';

interface StepProps {
  input: CalculationInput;
  onChange: (updates: Partial<CalculationInput>) => void;
}

export function Step4MunicipalityPermits({ input, onChange }: StepProps) {
  const totalBta = (input.husBostadsyta || 0) + (input.extrabyggnaderYta || 0);
  const planavgiftTotal = input.arInomPlanlagtOmrade
    ? Math.round(totalBta * input.planavgiftPerKvm)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Kommunala avgifter, tillstånd och KA</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Kommunala avgifter styrs av gällande kommunal VA-taxa och plan- och bygglovstaxa.
        </p>
      </div>

      {/* Kommunal VA-avgift */}
      <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-3">
        <label className="text-sm font-semibold text-slate-900 flex items-center space-x-2">
          <Droplet className="w-4 h-4 text-blue-600" />
          <span>Kommunal anläggningsavgift för vatten och avlopp (VA)</span>
        </label>
        <p className="text-xs text-slate-500">
          VA-taxor varierar kraftigt mellan landets kommuner. Tillväxt- och skärgårdskommuner med
          omfattande utbyggnad (t.ex. Värmdö) har betydligt högre anläggningstaxa.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {PRESETS.vaAvgift.map((item) => (
            <label
              key={item.value}
              className={`flex items-start p-3 rounded-lg border text-xs cursor-pointer transition-colors ${
                input.kommunTyp === item.value
                  ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900 font-medium'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-600'
              }`}
            >
              <input
                type="radio"
                name="kommunTyp"
                value={item.value}
                checked={input.kommunTyp === item.value}
                onChange={() => onChange({ kommunTyp: item.value as MunicipalityType })}
                className="mt-0.5 text-slate-900 focus:ring-slate-900 h-3.5 w-3.5"
              />
              <div className="ml-2.5 flex-1">
                <div className="flex justify-between text-slate-900 font-semibold">
                  <span>{item.label}</span>
                  {item.cost !== undefined && <span>{formatCurrency(item.cost)}</span>}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">{item.description}</p>
              </div>
            </label>
          ))}
        </div>

        {input.kommunTyp === 'custom' && (
          <div className="pt-2">
            <label htmlFor="customVaCost" className="text-xs font-medium text-slate-700 block mb-1">
              Ange anläggningsavgift enligt kommunens VA-kalkylator (kr):
            </label>
            <input
              id="customVaCost"
              type="number"
              min="0"
              step="10000"
              value={input.customVaCost}
              onChange={(e) => onChange({ customVaCost: Number(e.target.value) || 0 })}
              className="w-full max-w-xs px-3 py-1.5 text-xs sm:text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
            />
          </div>
        )}
      </div>

      {/* Bygglov och Planavgift */}
      <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-4">
        <label className="text-sm font-semibold text-slate-900 flex items-center space-x-2">
          <FileText className="w-4 h-4 text-slate-700" />
          <span>Bygglovsprövning och Planavgift</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label htmlFor="bygglovGrundavgift" className="font-medium text-slate-700 block mb-1">
              Bygglov grundavgift / handläggning (kr):
            </label>
            <input
              id="bygglovGrundavgift"
              type="number"
              min="0"
              step="5000"
              value={input.bygglovGrundavgift}
              onChange={(e) => onChange({ bygglovGrundavgift: Number(e.target.value) || 0 })}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
            />
            <span className="text-[11px] text-slate-400 mt-0.5 block">Schablon: 25 000 kr</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center pt-2">
              <input
                id="arInomPlanlagtOmrade"
                type="checkbox"
                checked={input.arInomPlanlagtOmrade}
                onChange={(e) => onChange({ arInomPlanlagtOmrade: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
              <label htmlFor="arInomPlanlagtOmrade" className="ml-2 font-medium text-slate-800 cursor-pointer">
                Fastigheten ligger inom detaljplanelagt område
              </label>
            </div>
            {input.arInomPlanlagtOmrade && (
              <span className="text-[11px] text-slate-500 block">
                Planavgift tas ut av kommunen för att täcka planläggningskostnader.
              </span>
            )}
          </div>
        </div>

        {/* Planavgift beräkningshjälp */}
        {input.arInomPlanlagtOmrade && (
          <div className="pt-3 border-t border-slate-100 space-y-3 text-xs bg-slate-50/60 p-3 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-700">
                Planavgiftstaxa (150–350 kr/m² BTA):
              </span>
              <span className="font-bold text-slate-900">
                {input.planavgiftPerKvm} kr/m² ({formatCurrency(planavgiftTotal)})
              </span>
            </div>
            <input
              type="range"
              min="150"
              max="350"
              step="25"
              value={input.planavgiftPerKvm}
              onChange={(e) => onChange({ planavgiftPerKvm: Number(e.target.value) })}
              className="w-full accent-slate-900"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Standardkommun (150 kr/m²)</span>
              <span>Medel (250 kr/m²)</span>
              <span>Tillväxtkommun (350 kr/m²)</span>
            </div>
            <p className="text-slate-600">
              Beräkning: {totalBta} m² total bruttoarea ({input.husBostadsyta} m² hus + {input.extrabyggnaderYta} m² komplement) x {input.planavgiftPerKvm} kr/m² ={' '}
              <strong>{formatCurrency(planavgiftTotal)}</strong>.
            </p>

            {/* Krav: Tydlig varning/notis */}
            <div className="flex items-start space-x-2 p-2.5 bg-amber-50 rounded border border-amber-200 text-amber-900 text-[11px]">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong>Obligatorisk kontroll:</strong> Planavgift och bygglovstaxa måste alltid
                kontrolleras direkt med kommunens byggnadsnämnd eller stadsbyggnadskontor då taxor
                beslutas årligen av kommunfullmäktige och kan variera utifrån planens ålder.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Nybyggnadskarta & KA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        {/* Nybyggnadskarta */}
        <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-2.5">
          <label className="font-semibold text-slate-900 flex items-center space-x-2 text-sm">
            <Map className="w-4 h-4 text-slate-700" />
            <span>Nybyggnadskarta</span>
          </label>
          <p className="text-slate-500 text-[11px]">
            Erfordras till bygglovsansökan. Schablon 15 000–20 000 kr.
          </p>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              min="0"
              step="1000"
              value={input.nybyggnadskartaMode === 'custom' ? input.customNybyggnadskartaCost : PRESETS.nybyggnadskarta.schablon}
              onChange={(e) =>
                onChange({
                  nybyggnadskartaMode: 'custom',
                  customNybyggnadskartaCost: Number(e.target.value) || 0,
                })
              }
              className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:outline-hidden text-xs sm:text-sm"
            />
            <button
              type="button"
              onClick={() => onChange({ nybyggnadskartaMode: 'preset', customNybyggnadskartaCost: PRESETS.nybyggnadskarta.schablon })}
              className="px-2.5 py-1.5 border border-slate-200 rounded text-[11px] hover:bg-slate-50 whitespace-nowrap cursor-pointer"
            >
              Schablon
            </button>
          </div>
        </div>

        {/* Kontrollansvarig (KA) */}
        <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-2.5">
          <label className="font-semibold text-slate-900 flex items-center space-x-2 text-sm">
            <ShieldCheck className="w-4 h-4 text-slate-700" />
            <span>Kvalitetsansvarig / KA (PBL)</span>
          </label>
          <p className="text-slate-500 text-[11px]">
            Certifierad kontrollansvarig. Schablon ca 30 000 kr.
          </p>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              min="0"
              step="2000"
              value={input.kaMode === 'custom' ? input.customKaCost : PRESETS.kvalitetsansvarig.schablon}
              onChange={(e) =>
                onChange({
                  kaMode: 'custom',
                  customKaCost: Number(e.target.value) || 0,
                })
              }
              className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:outline-hidden text-xs sm:text-sm"
            />
            <button
              type="button"
              onClick={() => onChange({ kaMode: 'preset', customKaCost: PRESETS.kvalitetsansvarig.schablon })}
              className="px-2.5 py-1.5 border border-slate-200 rounded text-[11px] hover:bg-slate-50 whitespace-nowrap cursor-pointer"
            >
              Schablon
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
