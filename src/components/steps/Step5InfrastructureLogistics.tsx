import React from 'react';
import { CalculationInput, FiberPreset } from '@/types/calculation';
import { PRESETS } from '@/config/presets';
import { formatCurrency } from '@/lib/formatters';
import { Wifi, Truck, Zap } from 'lucide-react';

interface StepProps {
  input: CalculationInput;
  onChange: (updates: Partial<CalculationInput>) => void;
}

export function Step5InfrastructureLogistics({ input, onChange }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Infrastruktur, etablering och logistik</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Poster för framdragning av bredband, byggel samt eventuell omlastning av huspaket vid
          trånga eller begränsade tillfartsvägar.
        </p>
      </div>

      {/* Fiberanslutning */}
      <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-3">
        <label className="text-sm font-semibold text-slate-900 flex items-center space-x-2">
          <Wifi className="w-4 h-4 text-slate-700" />
          <span>Fiber-anslutning & bredband</span>
        </label>
        <p className="text-xs text-slate-500">
          Välj om anslutning sker under pågående samfälld kampanj eller som enskild efteranslutning.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
          {PRESETS.fiber.map((item) => (
            <label
              key={item.value}
              className={`flex items-start p-3 rounded-lg border cursor-pointer transition-colors ${
                input.fiberPreset === item.value
                  ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900 font-medium'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-600'
              }`}
            >
              <input
                type="radio"
                name="fiberPreset"
                value={item.value}
                checked={input.fiberPreset === item.value}
                onChange={() => onChange({ fiberPreset: item.value as FiberPreset })}
                className="mt-0.5 text-slate-900 focus:ring-slate-900 h-3.5 w-3.5"
              />
              <div className="ml-2.5 flex-1">
                <div className="flex justify-between font-semibold text-slate-900">
                  <span>{item.label}</span>
                  {item.cost !== undefined && <span>{formatCurrency(item.cost)}</span>}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">{item.description}</p>
              </div>
            </label>
          ))}
        </div>

        {input.fiberPreset === 'custom' && (
          <div className="pt-2">
            <label htmlFor="customFiberCost" className="text-xs font-medium text-slate-700 block mb-1">
              Offertbelopp fiberanslutning (kr):
            </label>
            <input
              id="customFiberCost"
              type="number"
              min="0"
              step="5000"
              value={input.customFiberCost}
              onChange={(e) => onChange({ customFiberCost: Number(e.target.value) || 0 })}
              className="w-full max-w-xs px-3 py-1.5 text-xs sm:text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
            />
          </div>
        )}
      </div>

      {/* Omlastningskostnad */}
      <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <input
              id="omlastningBehov"
              type="checkbox"
              checked={input.omlastningBehov}
              onChange={(e) => onChange({ omlastningBehov: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
            />
            <label htmlFor="omlastningBehov" className="text-sm font-semibold text-slate-900 cursor-pointer flex items-center space-x-1.5">
              <Truck className="w-4 h-4 text-slate-700" />
              <span>Omlastningskostnad (smal väg, begränsad bärighet eller skarp kurva)</span>
            </label>
          </div>
          {input.omlastningBehov && (
            <span className="text-xs font-bold text-slate-900">
              +{formatCurrency(input.omlastningMode === 'custom' ? input.customOmlastningCost : PRESETS.omlastning.schablon)}
            </span>
          )}
        </div>

        <p className="text-xs text-slate-500">
          Husbyggsatser levereras normalt med 24 meters trailer och dragbil. Om vägen till tomten är för smal,
          har nedsatt bärighetsklass (BK2/BK3) eller saknar vändplan måste materialet lastas om till mindre bil.
        </p>

        {input.omlastningBehov && (
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center gap-3 text-xs">
            <div className="flex items-center space-x-3">
              <label className="flex items-center space-x-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="omlastningMode"
                  checked={input.omlastningMode === 'preset'}
                  onChange={() => onChange({ omlastningMode: 'preset' })}
                  className="text-slate-900 focus:ring-slate-900"
                />
                <span>Schablon (35 000 kr)</span>
              </label>
              <label className="flex items-center space-x-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="omlastningMode"
                  checked={input.omlastningMode === 'custom'}
                  onChange={() => onChange({ omlastningMode: 'custom' })}
                  className="text-slate-900 focus:ring-slate-900"
                />
                <span>Offertpris</span>
              </label>
            </div>

            {input.omlastningMode === 'custom' && (
              <input
                type="number"
                min="0"
                step="5000"
                value={input.customOmlastningCost}
                onChange={(e) => onChange({ customOmlastningCost: Number(e.target.value) || 0 })}
                className="w-40 px-3 py-1 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                placeholder="Offertbelopp kr"
              />
            )}
          </div>
        )}
      </div>

      {/* Hyra av byggelskåp */}
      <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-3">
        <label className="text-sm font-semibold text-slate-900 flex items-center space-x-2">
          <Zap className="w-4 h-4 text-amber-600" />
          <span>Byggelskåp & tillfällig elanslutning</span>
        </label>
        <p className="text-xs text-slate-500">
          Hyra av mätarskåp, inkoppling från elnätsbolag och driftsättning under byggperioden.
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-xs">
          <div className="flex items-center space-x-3">
            <label className="flex items-center space-x-1.5 cursor-pointer">
              <input
                type="radio"
                name="byggelskapMode"
                checked={input.byggelskapMode === 'preset'}
                onChange={() => onChange({ byggelskapMode: 'preset' })}
                className="text-slate-900 focus:ring-slate-900"
              />
              <span>Schablon (10 000 kr)</span>
            </label>
            <label className="flex items-center space-x-1.5 cursor-pointer">
              <input
                type="radio"
                name="byggelskapMode"
                checked={input.byggelskapMode === 'custom'}
                onChange={() => onChange({ byggelskapMode: 'custom' })}
                className="text-slate-900 focus:ring-slate-900"
              />
              <span>Eget belopp</span>
            </label>
          </div>

          {input.byggelskapMode === 'custom' && (
            <input
              type="number"
              min="0"
              step="2000"
              value={input.customByggelskapCost}
              onChange={(e) => onChange({ customByggelskapCost: Number(e.target.value) || 0 })}
              className="w-40 px-3 py-1 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
              placeholder="Eget pris kr"
            />
          )}
        </div>
      </div>
    </div>
  );
}
