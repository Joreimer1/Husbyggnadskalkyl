import React from 'react';
import { CalculationResult } from '@/types/calculation';
import { formatCurrency, formatNumber } from '@/lib/formatters';
import { X, Printer } from 'lucide-react';

interface BreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: CalculationResult;
  onPrint: () => void;
}

export function BreakdownModal({ isOpen, onClose, result, onPrint }: BreakdownModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-slate-200">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Detaljerad kostnadsspecifikation för husbygge
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Fullständig uppställning av alla kalkylerade poster, beräkningsgrunder och schabloner.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onPrint}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Skriv ut specifikation"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Stäng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal body */}
        <div className="overflow-y-auto px-6 py-4 space-y-6">
          {result.categoryList.map((category) => {
            if (category.items.length === 0) return null;

            return (
              <div key={category.id} className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 flex items-center justify-between border-b border-slate-200">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">{category.title}</h3>
                    <p className="text-xs text-slate-500">{category.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-900">
                      Delsumma: {formatCurrency(category.total)}
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  {category.items.map((item) => (
                    <div key={item.id} className="p-3.5 hover:bg-slate-50/50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1.5">
                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-slate-900">{item.name}</span>
                            {item.isCustom && (
                              <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                                Eget pris
                              </span>
                            )}
                          </div>
                          <p className="text-slate-600 text-xs leading-relaxed">{item.description}</p>
                          {item.formulaNote && (
                            <span className="inline-block text-[11px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                              Beräkning: {item.formulaNote}
                            </span>
                          )}
                        </div>
                        <div className="text-right sm:text-right shrink-0">
                          <span className="font-bold text-slate-900 text-sm">
                            {formatCurrency(item.amount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Totalt sammandrag */}
          <div className="p-5 bg-slate-900 text-white rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                Slutlig beräknad produktionskostnad
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                {formatCurrency(result.totalProjectCost)}
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Motsvarar cirka {formatNumber(result.costPerSqmTotal)} kr per kvadratmeter bostadsyta.
              </p>
            </div>
            <div className="text-xs space-y-1 text-slate-300 border-t sm:border-t-0 sm:border-l border-slate-700 pt-3 sm:pt-0 sm:pl-6">
              <div>Lånebehov: {formatCurrency(result.uppskattatLanebelopp)}</div>
              <div>Kreditivränta: {formatCurrency(result.kreditivkostnad)}</div>
              <div>Pantbrev stämpelskatt: {formatCurrency(result.pantbrevsavgift)}</div>
            </div>
          </div>
        </div>

        {/* Modal footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Alla belopp är inklusive moms i tillämpliga delar om ej annat anges.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-md transition-colors cursor-pointer"
          >
            Stäng specifikation
          </button>
        </div>
      </div>
    </div>
  );
}
