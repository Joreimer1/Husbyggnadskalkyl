import { CalculationInput, PaintingMode, ArkitektTier } from '@/types/calculation';
import { PRESETS } from '@/config/presets';
import { formatCurrency, formatNumber } from '@/lib/formatters';
import { Hammer, Paintbrush, PackageCheck, Warehouse, Compass } from 'lucide-react';
import { calculateArkitektCost } from '@/lib/calculator';

interface StepProps {
  input: CalculationInput;
  onChange: (updates: Partial<CalculationInput>) => void;
}

export function Step3BuildingKit({ input, onChange }: StepProps) {
  // Beräknad materialsats
  const materialsatsTotal =
    input.husmaterialsatsMode === 'fixed'
      ? input.customHusmaterialsatsFastPris
      : input.husBostadsyta * input.husmaterialsatsPerKvm;

  // Beräknad montering huvudbyggnad
  const monteringTotal =
    input.byggkostnadMode === 'custom'
      ? input.customByggkostnad
      : input.husBostadsyta * input.byggkostnadPerKvm;

  // Beräknad byggkostnad komplementbyggnad
  const komplementTotal =
    input.extrabyggnaderYta > 0 && input.inkluderaKomplementIByggkostnad
      ? input.komplementByggkostnadMode === 'custom'
        ? input.customKomplementByggkostnad
        : input.extrabyggnaderYta * input.komplementByggkostnadPerKvm
      : 0;

  // Beräknad arkitekt / konstruktör
  const arkitektTotal = calculateArkitektCost(input);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Byggnation, husmaterialsats och montering</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Här beräknas husets byggsats och själva monteringsentreprenaden för både huvudbyggnad ({input.husBostadsyta} m²)
          och komplementbyggnader ({input.extrabyggnaderYta} m²).
        </p>
      </div>

      {/* Husmaterialsats */}
      <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-slate-900 flex items-center space-x-2">
            <PackageCheck className="w-4 h-4 text-slate-700" />
            <span>Husmaterialsats / Byggsats</span>
          </label>
          <span className="text-xs font-bold text-slate-900">
            {formatCurrency(materialsatsTotal)}
          </span>
        </div>

        {/* Välj läge: Per kvm vs Fast pris */}
        <div className="flex rounded-md border border-slate-200 p-0.5 bg-slate-50 max-w-sm">
          <button
            type="button"
            onClick={() => onChange({ husmaterialsatsMode: 'sqm' })}
            className={`flex-1 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
              input.husmaterialsatsMode === 'sqm'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Räknehjälp per m² (10–14 tkr)
          </button>
          <button
            type="button"
            onClick={() => onChange({ husmaterialsatsMode: 'fixed' })}
            className={`flex-1 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
              input.husmaterialsatsMode === 'fixed'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Fast avtalspris direkt
          </button>
        </div>

        {input.husmaterialsatsMode === 'sqm' ? (
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">
                Kvadratmeterpris ({input.husBostadsyta} m² boyta):
              </span>
              <span className="font-semibold text-slate-900">
                {formatNumber(input.husmaterialsatsPerKvm)} kr/m²
              </span>
            </div>
            <input
              type="range"
              min="9000"
              max="16000"
              step="500"
              value={input.husmaterialsatsPerKvm}
              onChange={(e) => onChange({ husmaterialsatsPerKvm: Number(e.target.value) })}
              className="w-full accent-slate-900"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Bas (10 000 kr/m²)</span>
              <span>Medel (12 000 kr/m²)</span>
              <span>Premium (14 000 kr/m²)</span>
            </div>
            <p className="text-xs text-slate-500">
              Schablon: {input.husBostadsyta} m² x {formatNumber(input.husmaterialsatsPerKvm)} kr/m² ={' '}
              <strong>{formatCurrency(materialsatsTotal)}</strong>.
            </p>
          </div>
        ) : (
          <div className="space-y-2 pt-1">
            <label htmlFor="customHusmaterialsatsFastPris" className="text-xs font-medium text-slate-700 block">
              Ange fast avtalspris för byggsats (kr inkl moms):
            </label>
            <input
              id="customHusmaterialsatsFastPris"
              type="number"
              min="0"
              step="50000"
              value={input.customHusmaterialsatsFastPris}
              onChange={(e) => onChange({ customHusmaterialsatsFastPris: Number(e.target.value) || 0 })}
              className="w-full max-w-xs px-3 py-1.5 text-xs sm:text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
            />
          </div>
        )}
      </div>

      {/* Byggkostnad / Entreprenad Huvudbyggnad */}
      <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-slate-900 flex items-center space-x-2">
            <Hammer className="w-4 h-4 text-slate-700" />
            <span>Byggentreprenad huvudbyggnad ({input.husBostadsyta} m²)</span>
          </label>
          <span className="text-xs font-bold text-slate-900">
            {formatCurrency(monteringTotal)}
          </span>
        </div>

        <div className="flex rounded-md border border-slate-200 p-0.5 bg-slate-50 max-w-sm">
          <button
            type="button"
            onClick={() => onChange({ byggkostnadMode: 'sqm' })}
            className={`flex-1 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
              input.byggkostnadMode === 'sqm'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Schablon (~10 000 kr/m²)
          </button>
          <button
            type="button"
            onClick={() => onChange({ byggkostnadMode: 'custom' })}
            className={`flex-1 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
              input.byggkostnadMode === 'custom'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Eget offertpris
          </button>
        </div>

        {input.byggkostnadMode === 'sqm' ? (
          <div className="space-y-2 pt-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">
                Arbetskostnad montering ({input.husBostadsyta} m² boyta):
              </span>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="4000"
                  max="25000"
                  step="500"
                  value={input.byggkostnadPerKvm}
                  onChange={(e) => onChange({ byggkostnadPerKvm: Number(e.target.value) || 0 })}
                  className="w-28 px-2.5 py-1 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                />
                <span className="text-slate-500">kr/m²</span>
              </div>
            </div>
            <p className="text-slate-500">
              Beräkningshjälp: {input.husBostadsyta} m² x {formatNumber(input.byggkostnadPerKvm)} kr/m² ={' '}
              <strong>{formatCurrency(monteringTotal)}</strong>.
            </p>
          </div>
        ) : (
          <div className="space-y-2 pt-1">
            <label htmlFor="customByggkostnad" className="text-xs font-medium text-slate-700 block">
              Ange anbudssumma från byggentreprenör för huvudbyggnad (kr):
            </label>
            <input
              id="customByggkostnad"
              type="number"
              min="0"
              step="50000"
              value={input.customByggkostnad}
              onChange={(e) => onChange({ customByggkostnad: Number(e.target.value) || 0 })}
              className="w-full max-w-xs px-3 py-1.5 text-xs sm:text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
            />
          </div>
        )}
      </div>

      {/* Byggkostnad komplementbyggnad */}
      <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Warehouse className="w-4 h-4 text-slate-700" />
            <span className="text-sm font-semibold text-slate-900">
              Byggkostnad komplementbyggnad (Garage, carport, attefallshus)
            </span>
          </div>
          {komplementTotal > 0 && (
            <span className="text-xs font-bold text-slate-900">
              +{formatCurrency(komplementTotal)}
            </span>
          )}
        </div>

        {input.extrabyggnaderYta > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                id="inkluderaKomplementIByggkostnad"
                type="checkbox"
                checked={input.inkluderaKomplementIByggkostnad}
                onChange={(e) => onChange({ inkluderaKomplementIByggkostnad: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
              <label
                htmlFor="inkluderaKomplementIByggkostnad"
                className="ml-2 text-xs font-medium text-slate-800 cursor-pointer"
              >
                Inkludera byggnation av {input.extrabyggnaderYta} m² komplementbyggnad i kalkylen
              </label>
            </div>

            {input.inkluderaKomplementIByggkostnad && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-3 text-xs">
                <div className="flex rounded-md border border-slate-200 p-0.5 bg-white max-w-xs">
                  <button
                    type="button"
                    onClick={() => onChange({ komplementByggkostnadMode: 'sqm' })}
                    className={`flex-1 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                      input.komplementByggkostnadMode === 'sqm'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Räknehjälp per m²
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange({ komplementByggkostnadMode: 'custom' })}
                    className={`flex-1 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                      input.komplementByggkostnadMode === 'custom'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Eget offertpris
                  </button>
                </div>

                {input.komplementByggkostnadMode === 'sqm' ? (
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="text-slate-600">
                        Pris per m² för komplementbyggnad ({input.extrabyggnaderYta} m²):
                      </span>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="3000"
                          max="20000"
                          step="500"
                          value={input.komplementByggkostnadPerKvm}
                          onChange={(e) =>
                            onChange({ komplementByggkostnadPerKvm: Number(e.target.value) || 0 })
                          }
                          className="w-28 px-2.5 py-1 text-xs border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                        />
                        <span className="text-slate-500">kr/m²</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: 'Carport/enkel (6 000 kr/m²)', val: 6000 },
                        { label: 'Isolerat garage (8 000 kr/m²)', val: 8000 },
                        { label: 'Fullstandard (10 000 kr/m²)', val: 10000 },
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => onChange({ komplementByggkostnadPerKvm: item.val })}
                          className={`px-2 py-0.5 text-[11px] rounded border transition-colors cursor-pointer ${
                            input.komplementByggkostnadPerKvm === item.val
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>

                    <p className="text-slate-500 text-[11px] pt-1">
                      Kalkyl: {input.extrabyggnaderYta} m² x {formatNumber(input.komplementByggkostnadPerKvm)} kr/m² ={' '}
                      <strong className="text-slate-900">{formatCurrency(komplementTotal)}</strong>.
                    </p>
                  </div>
                ) : (
                  <div>
                    <label
                      htmlFor="customKomplementByggkostnad"
                      className="font-medium text-slate-700 block mb-1"
                    >
                      Ange offertpris för garage / komplementbyggnad (kr):
                    </label>
                    <input
                      id="customKomplementByggkostnad"
                      type="number"
                      min="0"
                      step="10000"
                      value={input.customKomplementByggkostnad}
                      onChange={(e) =>
                        onChange({ customKomplementByggkostnad: Number(e.target.value) || 0 })
                      }
                      className="w-full max-w-xs px-3 py-1.5 border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200">
            0 m² komplementbyggnadsyta är angiven i steg 1. Om ni planerar garage, carport eller förråd,
            ange kvadratmeterytan i steg 1 för att automatiskt beräkna byggkostnaden här.
          </div>
        )}
      </div>

      {/* Arkitekt & Konstruktör (Kataloghusanpassning & K-ritningar) */}
      <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-slate-900 flex items-center space-x-2">
            <Compass className="w-4 h-4 text-slate-700" />
            <span>Arkitekt och konstruktör (Kataloghusanpassning & K-ritningar)</span>
          </label>
          {arkitektTotal > 0 && (
            <span className="text-xs font-bold text-slate-900">
              +{formatCurrency(arkitektTotal)}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500">
          Även vid kataloghus krävs ofta situationsplan, situationsanpassade bygglovsritningar,
          konstruktionsritningar (K-ritningar för grund och bärande stomme) samt eventuella planlösningsjusteringar.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {PRESETS.arkitekt.map((preset) => (
            <label
              key={preset.value}
              className={`flex items-start p-3 rounded-lg border cursor-pointer transition-colors ${
                input.arkitektMode === preset.value
                  ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900 font-medium'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-600'
              }`}
            >
              <input
                type="radio"
                name="arkitektMode"
                value={preset.value}
                checked={input.arkitektMode === preset.value}
                onChange={() => onChange({ arkitektMode: preset.value as ArkitektTier })}
                className="mt-0.5 text-slate-900 focus:ring-slate-900 h-3.5 w-3.5"
              />
              <div className="ml-2.5 flex-1">
                <div className="flex justify-between font-semibold text-slate-900">
                  <span>{preset.label}</span>
                  {preset.cost !== undefined && <span>{formatCurrency(preset.cost)}</span>}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">{preset.description}</p>
              </div>
            </label>
          ))}
        </div>

        {input.arkitektMode === 'custom' && (
          <div className="pt-2">
            <label htmlFor="customArkitektCost" className="text-xs font-medium text-slate-700 block mb-1">
              Offertbelopp för arkitekt / konstruktör (kr):
            </label>
            <input
              id="customArkitektCost"
              type="number"
              min="0"
              step="5000"
              value={input.customArkitektCost}
              onChange={(e) => onChange({ customArkitektCost: Number(e.target.value) || 0 })}
              className="w-full max-w-xs px-3 py-1.5 text-xs sm:text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
            />
          </div>
        )}
      </div>

      {/* Målning av byggnader */}
      <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-3">
        <div className="flex items-start justify-between">
          <label className="text-sm font-semibold text-slate-900 flex items-center space-x-2">
            <Paintbrush className="w-4 h-4 text-slate-700" />
            <span>Målning av byggnader (Exteriör/Fasad)</span>
          </label>
        </div>
        <p className="text-xs text-amber-800 bg-amber-50/60 p-2.5 rounded border border-amber-200">
          Viktigt: Utvändig slutstrykning och målning ingår nästan aldrig i husleverantörens
          grundentreprenad utan kräver separat entreprenad eller eget arbete.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {PRESETS.malning.map((preset) => (
            <label
              key={preset.value}
              className={`flex items-start p-3 rounded-lg border cursor-pointer transition-colors ${
                input.malningMode === preset.value
                  ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="malningMode"
                value={preset.value}
                checked={input.malningMode === preset.value}
                onChange={() => onChange({ malningMode: preset.value as PaintingMode })}
                className="mt-0.5 text-slate-900 focus:ring-slate-900 h-3.5 w-3.5"
              />
              <div className="ml-2.5 flex-1">
                <div className="flex justify-between font-semibold text-slate-900">
                  <span>{preset.label}</span>
                  {preset.cost !== undefined && <span>{formatCurrency(preset.cost)}</span>}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">{preset.description}</p>
              </div>
            </label>
          ))}
        </div>

        {input.malningMode === 'custom' && (
          <div className="pt-2">
            <label htmlFor="customMalningCost" className="text-xs font-medium text-slate-700 block mb-1">
              Offertbelopp för målning (kr):
            </label>
            <input
              id="customMalningCost"
              type="number"
              min="0"
              step="10000"
              value={input.customMalningCost}
              onChange={(e) => onChange({ customMalningCost: Number(e.target.value) || 0 })}
              className="w-full max-w-xs px-3 py-1.5 text-xs sm:text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
            />
          </div>
        )}
      </div>
    </div>
  );
}
