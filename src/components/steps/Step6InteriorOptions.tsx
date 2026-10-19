import React from 'react';
import { CalculationInput, KitchenTier, BathroomTier, OtherOptionsTier } from '@/types/calculation';
import { PRESETS } from '@/config/presets';
import { formatCurrency, formatNumber } from '@/lib/formatters';
import { Utensils, Bath, Sparkles, Layers, AlertCircle } from 'lucide-react';

interface StepProps {
  input: CalculationInput;
  onChange: (updates: Partial<CalculationInput>) => void;
}

export function Step6InteriorOptions({ input, onChange }: StepProps) {
  // Badrumsberäkning
  const totalVatrumsyta = (input.antalBadrumTvatt || 0) * (input.kvmPerVatutrymme || 10);
  let badrumMerpris = 0;
  if (input.badrumKakelTillval === 'medium') badrumMerpris = totalVatrumsyta * 300;
  if (input.badrumKakelTillval === 'exclusive') badrumMerpris = totalVatrumsyta * 700;
  if (input.badrumKakelTillval === 'custom') badrumMerpris = input.customBadrumTotalCost;

  // Golvberäkning
  const golvTotal = input.uppgraderaGolv ? input.husBostadsyta * input.golvKostnadPerKvm : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Inredning, tillval och materialuppgraderingar</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Här hanteras vanliga tillval som ofta tillkommer utöver husleverantörens standardkatalog,
          såsom köksuppgraderingar, kakel- och klinkerval samt exklusivare trägolv.
        </p>
      </div>

      {/* Kökstillval */}
      <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-3">
        <label className="text-sm font-semibold text-slate-900 flex items-center space-x-2">
          <Utensils className="w-4 h-4 text-slate-700" />
          <span>Tillval kök</span>
        </label>
        <p className="text-xs text-slate-500">
          Uppgradering från katalogstandard till stenbänkskiva eller premiumnivå.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {PRESETS.kok.map((tier) => (
            <label
              key={tier.value}
              className={`flex items-start p-3 rounded-lg border cursor-pointer transition-colors ${
                input.kokTillval === tier.value
                  ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900 font-medium'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-600'
              }`}
            >
              <input
                type="radio"
                name="kokTillval"
                value={tier.value}
                checked={input.kokTillval === tier.value}
                onChange={() => onChange({ kokTillval: tier.value as KitchenTier })}
                className="mt-0.5 text-slate-900 focus:ring-slate-900 h-3.5 w-3.5"
              />
              <div className="ml-2.5 flex-1">
                <div className="flex justify-between font-semibold text-slate-900">
                  <span>{tier.label}</span>
                  {tier.cost !== undefined && (
                    <span>{tier.cost === 0 ? '0 kr (ingår)' : formatCurrency(tier.cost)}</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">{tier.description}</p>
              </div>
            </label>
          ))}
        </div>

        {input.kokTillval === 'custom' && (
          <div className="pt-2">
            <label htmlFor="customKokCost" className="text-xs font-medium text-slate-700 block mb-1">
              Offertbelopp för kökstillval (kr):
            </label>
            <input
              id="customKokCost"
              type="number"
              min="0"
              step="10000"
              value={input.customKokCost}
              onChange={(e) => onChange({ customKokCost: Number(e.target.value) || 0 })}
              className="w-full max-w-xs px-3 py-1.5 text-xs sm:text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
            />
          </div>
        )}
      </div>

      {/* Tillval badrum & klinker */}
      <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-slate-900 flex items-center space-x-2">
            <Bath className="w-4 h-4 text-slate-700" />
            <span>Tillval badrum och klinkers (väggar och golv)</span>
          </label>
          {badrumMerpris > 0 && (
            <span className="text-xs font-bold text-slate-900">
              +{formatCurrency(badrumMerpris)}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label htmlFor="antalBadrumTvatt" className="font-medium text-slate-700 block mb-1">
              Antal våtrum (badrum + tvättstuga):
            </label>
            <input
              id="antalBadrumTvatt"
              type="number"
              min="1"
              max="6"
              value={input.antalBadrumTvatt}
              onChange={(e) => onChange({ antalBadrumTvatt: Math.max(1, Number(e.target.value) || 1) })}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
            />
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Schablon: 10 m² våtrumsyta per rum ({totalVatrumsyta} m² totalt). Baskostnad ca 350 kr/m² ingår.
            </span>
          </div>

          <div>
            <label htmlFor="badrumKakelTillval" className="font-medium text-slate-700 block mb-1">
              Kakel- och klinkernivå:
            </label>
            <select
              id="badrumKakelTillval"
              value={input.badrumKakelTillval}
              onChange={(e) => onChange({ badrumKakelTillval: e.target.value as BathroomTier })}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:outline-hidden bg-white"
            >
              <option value="standard">Standardkakel (0 kr extra, ingår)</option>
              <option value="medium">Mellanval (+300 kr/m² merpris)</option>
              <option value="exclusive">Exklusiv granitkeramik (+700 kr/m² merpris)</option>
              <option value="custom">Eget offertbelopp</option>
            </select>
          </div>
        </div>

        {input.badrumKakelTillval === 'custom' && (
          <div className="pt-2">
            <label htmlFor="customBadrumTotalCost" className="text-xs font-medium text-slate-700 block mb-1">
              Ange totalkostnad för tillval kakel/klinker (kr):
            </label>
            <input
              id="customBadrumTotalCost"
              type="number"
              min="0"
              step="2000"
              value={input.customBadrumTotalCost}
              onChange={(e) => onChange({ customBadrumTotalCost: Number(e.target.value) || 0 })}
              className="w-full max-w-xs px-3 py-1.5 text-xs sm:text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
            />
          </div>
        )}
      </div>

      {/* Tillval golv */}
      <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <input
              id="uppgraderaGolv"
              type="checkbox"
              checked={input.uppgraderaGolv}
              onChange={(e) => onChange({ uppgraderaGolv: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
            />
            <label htmlFor="uppgraderaGolv" className="text-sm font-semibold text-slate-900 cursor-pointer flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-slate-700" />
              <span>Uppgradering av golv (t.ex. 1-stavs parkett Kährs/Bjelin)</span>
            </label>
          </div>
          {input.uppgraderaGolv && (
            <span className="text-xs font-bold text-slate-900">
              +{formatCurrency(golvTotal)}
            </span>
          )}
        </div>

        {input.uppgraderaGolv && (
          <div className="pt-3 border-t border-slate-100 space-y-3 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label htmlFor="golvKostnadPerKvm" className="font-medium text-slate-700 block mb-1">
                  Mellanskillnad per kvadratmeter (schablon 1 000 kr/m²):
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    id="golvKostnadPerKvm"
                    type="number"
                    min="200"
                    max="4000"
                    step="100"
                    value={input.golvKostnadPerKvm}
                    onChange={(e) => onChange({ golvKostnadPerKvm: Number(e.target.value) || 0 })}
                    className="w-36 px-3 py-1.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                  />
                  <span className="text-slate-500">kr/m²</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-slate-500 block">Kalkyl på husets boyta:</span>
                <span className="font-semibold text-slate-900">
                  {input.husBostadsyta} m² x {formatNumber(input.golvKostnadPerKvm)} kr/m² = {formatCurrency(golvTotal)}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              {[
                { label: 'Schablon (1 000 kr/m²)', val: 1000 },
                { label: 'Mindre tillägg (600 kr/m²)', val: 600 },
                { label: 'Exklusivare (1 500 kr/m²)', val: 1500 },
              ].map((item) => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => onChange({ golvKostnadPerKvm: item.val })}
                  className={`px-2 py-0.5 text-[11px] rounded border transition-colors cursor-pointer ${
                    input.golvKostnadPerKvm === item.val
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="flex items-start space-x-2 p-2.5 bg-slate-50 rounded border border-slate-200 text-slate-600 text-[11px]">
              <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <strong>Viktig avstämning:</strong> Observera att detta måste kontrolleras med
                respektive husleverantör gällande vilket standardgolv som ingår, eventuell kreditering
                av standard och installationskrav för golvvärme.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Övriga tillval */}
      <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-3 text-xs">
        <label className="text-sm font-semibold text-slate-900 flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-slate-700" />
          <span>Övriga tillval (bredare trappa, fasadbelysning, trädetaljer mm)</span>
        </label>
        <p className="text-slate-500">
          Välj schablonpaket eller mata in anbudspris för särskilda arkitektoniska tillägg.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PRESETS.ovrigaTillval.map((item) => (
            <label
              key={item.value}
              className={`flex items-start p-2.5 rounded-lg border cursor-pointer transition-colors ${
                input.ovrigaTillval === item.value
                  ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900 font-medium'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-600'
              }`}
            >
              <input
                type="radio"
                name="ovrigaTillval"
                value={item.value}
                checked={input.ovrigaTillval === item.value}
                onChange={() => onChange({ ovrigaTillval: item.value as OtherOptionsTier })}
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

        {input.ovrigaTillval === 'custom' && (
          <div className="pt-2">
            <label htmlFor="customOvrigaTillvalCost" className="text-xs font-medium text-slate-700 block mb-1">
              Ange sammanlagt belopp för övriga tillval (kr):
            </label>
            <input
              id="customOvrigaTillvalCost"
              type="number"
              min="0"
              step="5000"
              value={input.customOvrigaTillvalCost}
              onChange={(e) => onChange({ customOvrigaTillvalCost: Number(e.target.value) || 0 })}
              className="w-full max-w-xs px-3 py-1.5 text-xs sm:text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
            />
          </div>
        )}
      </div>
    </div>
  );
}
