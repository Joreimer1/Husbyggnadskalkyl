import React from 'react';
import { CalculationInput, GroundworkPreset, SewerTerrainType, InvasiveSpeciesType } from '@/types/calculation';
import { PRESETS } from '@/config/presets';
import { formatCurrency } from '@/lib/formatters';
import { calculateExtraAvloppCost, calculateRivningCost } from '@/lib/calculator';
import { Shovel, Trash2, Sprout } from 'lucide-react';

interface StepProps {
  input: CalculationInput;
  onChange: (updates: Partial<CalculationInput>) => void;
}

export function Step2GroundDemolition({ input, onChange }: StepProps) {
  // Samma funktioner som kalkylatorn använder, så att förhandsvisningen alltid
  // stämmer med det som räknas in i totalen.
  const calculatedSewerCost = calculateExtraAvloppCost(input);
  const calculatedDemolitionCost = calculateRivningCost(input);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Markarbete, schaktning och rivning</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Markförhållandena är en av de största osäkerhetsfaktorerna vid nybyggnation. Välj den
          schablon som bäst motsvarar tomtens topografi och avstånd till anslutningspunkt.
        </p>
      </div>

      {/* Grundarbete presets */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-slate-900 flex items-center space-x-2">
          <Shovel className="w-4 h-4 text-slate-700" />
          <span>Grundarbete och tomtförberedelser (exkl. betongplatta)</span>
        </label>
        <div className="grid grid-cols-1 gap-2.5">
          {PRESETS.grundarbete.map((preset) => {
            const isSelected = input.grundarbetePreset === preset.value;
            return (
              <label
                key={preset.value}
                className={`flex items-start p-3.5 rounded-lg border text-xs cursor-pointer transition-all ${
                  isSelected
                    ? 'border-slate-900 bg-slate-50/70 shadow-xs ring-1 ring-slate-900'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="grundarbetePreset"
                  value={preset.value}
                  checked={isSelected}
                  onChange={() => onChange({ grundarbetePreset: preset.value as GroundworkPreset })}
                  className="mt-0.5 text-slate-900 focus:ring-slate-900 h-4 w-4 border-slate-300"
                />
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 text-xs sm:text-sm">
                      {preset.label}
                    </span>
                    {preset.cost !== undefined && (
                      <span className="font-bold text-slate-800 ml-2">
                        {formatCurrency(preset.cost)}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 text-xs mt-0.5">{preset.description}</p>
                </div>
              </label>
            );
          })}
        </div>

        {/* Eget offertpris om custom */}
        {input.grundarbetePreset === 'custom' && (
          <div className="p-3.5 rounded-lg border border-amber-200 bg-amber-50/40 space-y-2 mt-2">
            <label htmlFor="customGrundarbeteCost" className="text-xs font-semibold text-slate-800 block">
              Ange offertpris för grundarbete (kr, exkl. betongplatta):
            </label>
            <input
              id="customGrundarbeteCost"
              type="number"
              min="0"
              step="10000"
              value={input.customGrundarbeteCost}
              onChange={(e) => onChange({ customGrundarbeteCost: Number(e.target.value) || 0 })}
              className="w-full max-w-xs px-3 py-1.5 text-xs sm:text-sm border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
            />
          </div>
        )}
      </div>

      {/* Extra avloppsgrävning */}
      <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <input
              id="extraAvloppEnabled"
              type="checkbox"
              checked={input.extraAvloppEnabled}
              onChange={(e) => onChange({ extraAvloppEnabled: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
            />
            <label htmlFor="extraAvloppEnabled" className="text-sm font-semibold text-slate-900 cursor-pointer">
              Extra grävning / schakt för avlopp och servisledning
            </label>
          </div>
          {input.extraAvloppEnabled && (
            <span className="text-xs font-bold text-slate-900">
              +{formatCurrency(calculatedSewerCost)}
            </span>
          )}
        </div>

        {input.extraAvloppEnabled && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label htmlFor="extraAvloppMeter" className="font-medium text-slate-700 block mb-1">
                Längd att schakta (löpande meter):
              </label>
              <input
                id="extraAvloppMeter"
                type="number"
                min="1"
                max="500"
                value={input.extraAvloppMeter}
                onChange={(e) => onChange({ extraAvloppMeter: Math.max(0, Number(e.target.value) || 0) })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
              />
            </div>

            <div>
              <label htmlFor="extraAvloppTerrain" className="font-medium text-slate-700 block mb-1">
                Terräng- och markförhållanden:
              </label>
              <select
                id="extraAvloppTerrain"
                value={input.extraAvloppTerrain}
                onChange={(e) => onChange({ extraAvloppTerrain: e.target.value as SewerTerrainType })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:outline-hidden bg-white"
              >
                <option value="easy">Lättgrävd mark (1 500 kr/m)</option>
                <option value="difficult">Otillgänglig mark: stubbar/träd (3 000 kr/m)</option>
                <option value="blasting">Berggrund med sprängning (6 000 kr/m)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Rivning av befintlig byggnad */}
      <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <input
              id="harRivningsbehov"
              type="checkbox"
              checked={input.harRivningsbehov}
              onChange={(e) => onChange({ harRivningsbehov: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
            />
            <label htmlFor="harRivningsbehov" className="text-sm font-semibold text-slate-900 cursor-pointer flex items-center space-x-1.5">
              <Trash2 className="w-4 h-4 text-slate-600" />
              <span>Rivning av befintlig byggnad på tomten</span>
            </label>
          </div>
          {input.harRivningsbehov && (
            <span className="text-xs font-bold text-slate-900">
              +{formatCurrency(calculatedDemolitionCost)}
            </span>
          )}
        </div>

        {input.harRivningsbehov && (
          <div className="pt-3 border-t border-slate-100 space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="rivningsYta" className="font-medium text-slate-700 block mb-1">
                  Rivningsyta (m²):
                </label>
                <input
                  id="rivningsYta"
                  type="number"
                  min="5"
                  max="500"
                  value={input.rivningsYta}
                  onChange={(e) => onChange({ rivningsYta: Math.max(0, Number(e.target.value) || 0) })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center pt-5">
                <input
                  id="harAsbestrisk"
                  type="checkbox"
                  checked={input.harAsbestrisk}
                  onChange={(e) => onChange({ harAsbestrisk: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <label htmlFor="harAsbestrisk" className="ml-2 font-medium text-slate-800 cursor-pointer">
                  Risk för asbest (6 000 kr/m² istället för 4 000 kr/m²)
                </label>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded border border-slate-200">
              Information: Äldre sommarstugor uppförda under 1950-talet brukar i regel inte innehålla asbest,
              vilket håller saneringskostnaden vid normal standard på ca 4 000 kr/m².
            </p>
          </div>
        )}
      </div>

      {/* Invasiva växter (Parkslide) */}
      <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-3 text-xs">
        <label className="text-sm font-semibold text-slate-900 flex items-center space-x-2">
          <Sprout className="w-4 h-4 text-emerald-700" />
          <span>Bekämpning av invasiva arter (t.ex. Parkslide)</span>
        </label>
        <div className="space-y-2">
          {PRESETS.invasivaVaxter.map((item) => (
            <label
              key={item.value}
              className={`flex items-start p-2.5 rounded border cursor-pointer transition-colors ${
                input.invasivaVaxterTyp === item.value
                  ? 'border-slate-900 bg-slate-50 font-medium'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-600'
              }`}
            >
              <input
                type="radio"
                name="invasivaVaxterTyp"
                value={item.value}
                checked={input.invasivaVaxterTyp === item.value}
                onChange={() => onChange({ invasivaVaxterTyp: item.value as InvasiveSpeciesType })}
                className="mt-0.5 text-slate-900 focus:ring-slate-900 h-3.5 w-3.5"
              />
              <div className="ml-2.5 flex-1">
                <div className="flex justify-between">
                  <span className="text-slate-900">{item.label}</span>
                  {item.cost !== undefined && (
                    <span className="font-semibold text-slate-800">
                      {item.cost === 0 ? '0 kr' : formatCurrency(item.cost)}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">{item.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
