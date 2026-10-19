import React from 'react';
import { CalculationInput, DeckSizeTier } from '@/types/calculation';
import { PRESETS } from '@/config/presets';
import { formatCurrency } from '@/lib/formatters';
import { Trees, Sun, Coins, PiggyBank, Home } from 'lucide-react';
import { calculateDubbelboendeCost } from '@/lib/calculator';

interface StepProps {
  input: CalculationInput;
  onChange: (updates: Partial<CalculationInput>) => void;
  subtotalBeforeFinance: number;
}

export function Step7LandscapeFinance({ input, onChange, subtotalBeforeFinance }: StepProps) {
  // Finplanering
  const finplaneringTotal = input.finplaneringTomt
    ? input.finplaneringYtaKvm * input.finplaneringKostnadPerKvm
    : 0;

  // Altan
  let altanSqm = 0;
  if (input.altanVal === 'small') altanSqm = 20;
  if (input.altanVal === 'medium') altanSqm = 40;
  if (input.altanVal === 'large') altanSqm = 75;
  if (input.altanVal === 'custom') altanSqm = input.altanKvm || 0;
  const altanTotal = input.altanVal !== 'none' ? altanSqm * input.altanKostnadPerKvm : 0;

  // Buffert oförutsett
  const oforutsettProcent = input.oforutsettProcent ?? 5;
  const beraknadOforutsett =
    input.oforutsettMode === 'none'
      ? 0
      : input.oforutsettMode === 'custom'
      ? input.customOforutsettCost || 0
      : Math.round(subtotalBeforeFinance * (oforutsettProcent / 100));

  // Dubbelboende
  const dubbelboendeTotal = calculateDubbelboendeCost(input);

  // Finansiering
  const belaningsgrad = (input.belaningsgradProcent || 85) / 100;
  const beraknatLanebelopp =
    input.egetLanebelopp > 0
      ? input.egetLanebelopp
      : Math.round(subtotalBeforeFinance * belaningsgrad);

  // Kreditivränta beräkning
  const rantesats = (input.kreditivRantesatsProcent || 4.25) / 100;
  const tidAr = (input.kreditivByggtidManader || 12) / 12;
  const kreditivTotal = input.beraknaKreditiv
    ? Math.round(beraknatLanebelopp * rantesats * tidAr * PRESETS.finansiering.genomsnittligtUtnyttjandeGrad)
    : 0;

  // Pantbrev
  const nyttPantbrev = Math.max(0, beraknatLanebelopp - (input.befintligtPantbrev || 0));
  const pantbrevTotal =
    input.behoverPantbrev && nyttPantbrev > 0
      ? Math.round(nyttPantbrev * 0.02 + PRESETS.finansiering.pantbrevFastAvgift)
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Utemiljö, tomt och finansieringskostnader</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Slutjustering av trädgård, altandäck samt kalkylering av ränta under byggtiden (byggnadskreditiv)
          och statlig stämpelskatt för pantbrev.
        </p>
      </div>

      {/* Finplanering tomt */}
      <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <input
              id="finplaneringTomt"
              type="checkbox"
              checked={input.finplaneringTomt}
              onChange={(e) => onChange({ finplaneringTomt: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
            />
            <label htmlFor="finplaneringTomt" className="text-sm font-semibold text-slate-900 cursor-pointer flex items-center space-x-1.5">
              <Trees className="w-4 h-4 text-emerald-700" />
              <span>Finplanering av tomt & trädgård (gräsmatta, matjord, grus)</span>
            </label>
          </div>
          {input.finplaneringTomt && (
            <span className="text-xs font-bold text-slate-900">
              +{formatCurrency(finplaneringTotal)}
            </span>
          )}
        </div>

        {input.finplaneringTomt && (
          <div className="pt-3 border-t border-slate-100 space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="finplaneringYtaKvm" className="font-medium text-slate-700 block mb-1">
                  Yta som ska finplaneras (m²):
                </label>
                <input
                  id="finplaneringYtaKvm"
                  type="number"
                  min="50"
                  max="5000"
                  step="50"
                  value={input.finplaneringYtaKvm}
                  onChange={(e) => onChange({ finplaneringYtaKvm: Math.max(0, Number(e.target.value) || 0) })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label htmlFor="finplaneringKostnadPerKvm" className="font-medium text-slate-700 block mb-1">
                  Schablon per m² (100–300 kr/m²):
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    id="finplaneringKostnadPerKvm"
                    type="number"
                    min="50"
                    max="600"
                    step="25"
                    value={input.finplaneringKostnadPerKvm}
                    onChange={(e) => onChange({ finplaneringKostnadPerKvm: Number(e.target.value) || 0 })}
                    className="w-32 px-3 py-1.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                  />
                  <span className="text-slate-500">kr/m²</span>
                </div>
              </div>
            </div>

            <p className="text-slate-500 text-[11px]">
              {input.finplaneringYtaKvm} m² x {input.finplaneringKostnadPerKvm} kr/m² = {formatCurrency(finplaneringTotal)}.
              Innefattar utläggning av harpad matjord, sådd/rullgräs och grov utjämning.
            </p>
          </div>
        )}
      </div>

      {/* Altan / Trädäck */}
      <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-slate-900 flex items-center space-x-2">
            <Sun className="w-4 h-4 text-amber-600" />
            <span>Altan och trädäck (Schablon ca 3 000 kr/m²)</span>
          </label>
          {input.altanVal !== 'none' && (
            <span className="text-xs font-bold text-slate-900">
              +{formatCurrency(altanTotal)}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {PRESETS.altan.sizes.map((size) => (
            <button
              key={size.value}
              type="button"
              onClick={() => onChange({ altanVal: size.value as DeckSizeTier })}
              className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                input.altanVal === size.value
                  ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="font-semibold text-slate-900">{size.label}</div>
              <div className="text-[11px] text-slate-500 mt-1">
                {size.cost !== undefined && size.cost > 0
                  ? formatCurrency(size.cost)
                  : size.value === 'none'
                  ? '0 kr'
                  : 'Valfri yta'}
              </div>
            </button>
          ))}
        </div>

        {input.altanVal === 'custom' && (
          <div className="pt-2 flex items-center space-x-3 text-xs">
            <div>
              <label htmlFor="altanKvm" className="font-medium text-slate-700 block mb-1">
                Ange altanyta (m²):
              </label>
              <input
                id="altanKvm"
                type="number"
                min="5"
                max="300"
                value={input.altanKvm}
                onChange={(e) => onChange({ altanKvm: Math.max(0, Number(e.target.value) || 0) })}
                className="w-32 px-3 py-1.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
              />
            </div>
            <div className="pt-4 text-slate-600">
              x {input.altanKostnadPerKvm} kr/m² = <strong>{formatCurrency(input.altanKvm * input.altanKostnadPerKvm)}</strong>
            </div>
          </div>
        )}
      </div>

      {/* Post för oförutsett */}
      <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-slate-900 flex items-center space-x-2">
            <PiggyBank className="w-4 h-4 text-emerald-600" />
            <span>Post för oförutsett (rekommenderad buffert 5 %)</span>
          </label>
          {beraknadOforutsett > 0 && (
            <span className="text-xs font-bold text-slate-900">
              +{formatCurrency(beraknadOforutsett)}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500">
          En buffert på ca 5 % av produktionskostnaden är standard i bankkalkyler för att täcka
          oförutsedda markförhållanden, extra schaktmassor, kabeldragning och eventuella tilläggsbeställningar.
        </p>

        <div className="flex rounded-md border border-slate-200 p-0.5 bg-slate-50 max-w-sm">
          <button
            type="button"
            onClick={() => onChange({ oforutsettMode: 'percent' })}
            className={`flex-1 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
              input.oforutsettMode === 'percent'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Procentuell schablon (5 %)
          </button>
          <button
            type="button"
            onClick={() => onChange({ oforutsettMode: 'custom' })}
            className={`flex-1 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
              input.oforutsettMode === 'custom'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Fast belopp
          </button>
          <button
            type="button"
            onClick={() => onChange({ oforutsettMode: 'none' })}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
              input.oforutsettMode === 'none'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ingen
          </button>
        </div>

        {input.oforutsettMode === 'percent' && (
          <div className="pt-2 flex items-center space-x-3 text-xs">
            <div>
              <label htmlFor="oforutsettProcent" className="font-medium text-slate-700 block mb-1">
                Buffertprocent:
              </label>
              <div className="flex items-center space-x-2">
                <input
                  id="oforutsettProcent"
                  type="number"
                  min="0"
                  max="25"
                  step="0.5"
                  value={input.oforutsettProcent}
                  onChange={(e) => onChange({ oforutsettProcent: Number(e.target.value) || 0 })}
                  className="w-24 px-3 py-1.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                />
                <span className="text-slate-500">%</span>
              </div>
            </div>
            <div className="pt-4 text-slate-600">
              = <strong>{formatCurrency(beraknadOforutsett)}</strong> i avsatt buffert
            </div>
          </div>
        )}

        {input.oforutsettMode === 'custom' && (
          <div className="pt-2">
            <label htmlFor="customOforutsettCost" className="text-xs font-medium text-slate-700 block mb-1">
              Ange eget buffertbelopp för oförutsett (kr):
            </label>
            <input
              id="customOforutsettCost"
              type="number"
              min="0"
              step="10000"
              value={input.customOforutsettCost}
              onChange={(e) => onChange({ customOforutsettCost: Number(e.target.value) || 0 })}
              className="w-full max-w-xs px-3 py-1.5 text-xs sm:text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
            />
          </div>
        )}
      </div>

      {/* Dubbelboende under byggtid */}
      <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <input
              id="dubbelboendeEnabled"
              type="checkbox"
              checked={input.dubbelboendeEnabled}
              onChange={(e) => onChange({ dubbelboendeEnabled: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
            />
            <label htmlFor="dubbelboendeEnabled" className="text-sm font-semibold text-slate-900 cursor-pointer flex items-center space-x-1.5">
              <Home className="w-4 h-4 text-indigo-600" />
              <span>Dubbelboende och temporärt boende under byggtid</span>
            </label>
          </div>
          {input.dubbelboendeEnabled && dubbelboendeTotal > 0 && (
            <span className="text-xs font-bold text-slate-900">
              +{formatCurrency(dubbelboendeTotal)}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500">
          Under produktionstiden har man ofta merkostnader för nuvarande boende (t.ex. hyra för lägenhet,
          räntor på befintligt lån eller magasinering av bohag) innan inflyttning kan ske.
        </p>

        {input.dubbelboendeEnabled && (
          <div className="pt-3 border-t border-slate-100 space-y-3 text-xs bg-slate-50/60 p-3 rounded-lg border border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="dubbelboendeManader" className="font-medium text-slate-700 block mb-1">
                  Antal månader dubbelboende:
                </label>
                <input
                  id="dubbelboendeManader"
                  type="number"
                  min="1"
                  max="24"
                  value={input.dubbelboendeManader}
                  onChange={(e) => onChange({ dubbelboendeManader: Number(e.target.value) || 0 })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label htmlFor="dubbelboendeKostnadPerManad" className="font-medium text-slate-700 block mb-1">
                  Månadskostnad för temporärt boende (kr/mån):
                </label>
                <input
                  id="dubbelboendeKostnadPerManad"
                  type="number"
                  min="0"
                  step="1000"
                  value={input.dubbelboendeKostnadPerManad}
                  onChange={(e) => onChange({ dubbelboendeKostnadPerManad: Number(e.target.value) || 0 })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="text-slate-600 text-[11px] pt-1">
              Kalkyl: {input.dubbelboendeManader} månader x {formatCurrency(input.dubbelboendeKostnadPerManad)}/mån ={' '}
              <strong className="text-slate-900">{formatCurrency(dubbelboendeTotal)}</strong>.
            </div>
          </div>
        )}
      </div>

      {/* Finansiering & Byggnadskreditiv */}
      <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-4">
        <label className="text-sm font-semibold text-slate-900 flex items-center space-x-2">
          <Coins className="w-4 h-4 text-slate-700" />
          <span>Byggnadskreditiv och finansieringskalkyl</span>
        </label>
        <p className="text-xs text-slate-500">
          Under byggtiden belånas projektet via ett tillfälligt byggnadskreditiv. Räntan debiteras
          löpande på ianspråktaget kapital allteftersom fakturor betalas (genomsnittlig nyttjandegrad ca 55 %).
        </p>

        <div className="space-y-4 text-xs">
          <div className="flex items-center">
            <input
              id="beraknaKreditiv"
              type="checkbox"
              checked={input.beraknaKreditiv}
              onChange={(e) => onChange({ beraknaKreditiv: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
            />
            <label htmlFor="beraknaKreditiv" className="ml-2 font-medium text-slate-800 cursor-pointer">
              Beräkna räntekostnad för byggnadskreditiv under byggtiden
            </label>
          </div>

          {input.beraknaKreditiv && (
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label htmlFor="belaningsgradProcent" className="font-medium text-slate-700 block mb-1">
                    Belåningsgrad:
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      id="belaningsgradProcent"
                      type="number"
                      min="10"
                      max="85"
                      value={input.belaningsgradProcent}
                      onChange={(e) => onChange({ belaningsgradProcent: Number(e.target.value) || 0, egetLanebelopp: 0 })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                    />
                    <span className="text-slate-500">%</span>
                  </div>
                </div>

                <div>
                  <label htmlFor="kreditivRantesatsProcent" className="font-medium text-slate-700 block mb-1">
                    Kreditivränta (3,5–5 %):
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      id="kreditivRantesatsProcent"
                      type="number"
                      min="1"
                      max="12"
                      step="0.25"
                      value={input.kreditivRantesatsProcent}
                      onChange={(e) => onChange({ kreditivRantesatsProcent: Number(e.target.value) || 0 })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                    />
                    <span className="text-slate-500">%</span>
                  </div>
                </div>

                <div>
                  <label htmlFor="kreditivByggtidManader" className="font-medium text-slate-700 block mb-1">
                    Byggtid (månader):
                  </label>
                  <input
                    id="kreditivByggtidManader"
                    type="number"
                    min="3"
                    max="24"
                    value={input.kreditivByggtidManader}
                    onChange={(e) => onChange({ kreditivByggtidManader: Number(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-slate-700">
                <span>Beräknat lånebelopp: <strong>{formatCurrency(beraknatLanebelopp)}</strong></span>
                <span>Kreditivränta under byggtid: <strong className="text-slate-900">{formatCurrency(kreditivTotal)}</strong></span>
              </div>
            </div>
          )}

          {/* Pantbrev */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="behoverPantbrev"
                  type="checkbox"
                  checked={input.behoverPantbrev}
                  onChange={(e) => onChange({ behoverPantbrev: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <label htmlFor="behoverPantbrev" className="ml-2 font-medium text-slate-800 cursor-pointer">
                  Pantbrevskostnad (2 % statlig stämpelskatt på nya pantbrev)
                </label>
              </div>
              {input.behoverPantbrev && nyttPantbrev > 0 && (
                <span className="font-bold text-slate-900">
                  +{formatCurrency(pantbrevTotal)}
                </span>
              )}
            </div>

            {input.behoverPantbrev && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="befintligtPantbrev" className="font-medium text-slate-700 block mb-1">
                    Befintliga pantbrev på fastigheten (kr):
                  </label>
                  <input
                    id="befintligtPantbrev"
                    type="number"
                    min="0"
                    step="50000"
                    value={input.befintligtPantbrev}
                    onChange={(e) => onChange({ befintligtPantbrev: Number(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                    placeholder="0 kr"
                  />
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    Finns redan pantbrev betalas ingen stämpelskatt för det beloppet.
                  </span>
                </div>

                <div className="text-right flex flex-col justify-end">
                  <span className="text-slate-500">Nytecknat pantbrevsbelopp:</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(nyttPantbrev)}</span>
                  <span className="text-[11px] text-slate-500 mt-1">
                    2 % stämpelskatt + 375 kr exp.avgift = <strong>{formatCurrency(pantbrevTotal)}</strong>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
