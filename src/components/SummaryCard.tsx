import React from 'react';
import { CalculationResult } from '@/types/calculation';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/formatters';
import { ListChecks } from 'lucide-react';

interface SummaryCardProps {
  result: CalculationResult;
  onOpenBreakdown: () => void;
}

export function SummaryCard({ result, onOpenBreakdown }: SummaryCardProps) {
  const categoryColors: Record<string, string> = {
    tomt_forvarv: 'bg-amber-600',
    mark_forberedelse: 'bg-stone-500',
    bygg_material: 'bg-slate-800',
    kommun_myndighet: 'bg-blue-600',
    logistik_infrastruktur: 'bg-emerald-600',
    interior_tillval: 'bg-purple-600',
    tradgard_utemiljo: 'bg-teal-600',
    finansiering_avgifter: 'bg-rose-600',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 lg:p-6 lg:sticky lg:top-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
            Total produktionskostnad
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            {formatCurrency(result.totalProjectCost)}
          </div>
        </div>
        <div className="text-right">
          <span className="text-[11px] font-medium text-slate-400 block">Totalt per m² boyta</span>
          <span className="text-sm sm:text-base font-semibold text-slate-700">
            {formatNumber(result.costPerSqmTotal)} kr/m²
          </span>
        </div>
      </div>

      {/* Nyckeltal i rutnät */}
      <div className="grid grid-cols-2 gap-3 py-4 border-b border-slate-100 text-xs">
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
          <span className="text-slate-500 block mb-0.5">Byggnad per m²</span>
          <span className="font-semibold text-slate-800 text-sm">
            {formatNumber(result.costPerSqmBuildingOnly)} kr/m²
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Material & entreprenad</span>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
          <span className="text-slate-500 block mb-0.5">Beräknat lånebehov</span>
          <span className="font-semibold text-slate-800 text-sm">
            {formatCurrency(result.uppskattatLanebelopp)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Kreditiv & hypotek</span>
        </div>
      </div>

      {/* Kategoriuppdelning och progressstapel */}
      <div className="py-4 border-b border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Kostnadsfördelning
          </span>
          <span className="text-[11px] text-slate-400">{result.categoryList.length} kategorier</span>
        </div>

        {/* Visuell ackumulerad stapel */}
        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex mb-3.5">
          {result.categoryList.map((cat) => {
            const pct = result.totalProjectCost > 0 ? (cat.total / result.totalProjectCost) * 100 : 0;
            if (pct <= 0) return null;
            return (
              <div
                key={cat.id}
                style={{ width: `${pct}%` }}
                className={`${categoryColors[cat.id] || 'bg-slate-400'} transition-all duration-300`}
                title={`${cat.title}: ${formatCurrency(cat.total)} (${formatPercent(pct, 1)})`}
              />
            );
          })}
        </div>

        {/* Kategorilista med belopp och andel */}
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 text-xs">
          {result.categoryList.map((cat) => {
            const pct = result.totalProjectCost > 0 ? (cat.total / result.totalProjectCost) * 100 : 0;
            return (
              <div
                key={cat.id}
                className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center space-x-2 truncate">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${categoryColors[cat.id] || 'bg-slate-400'}`}
                  />
                  <span className="text-slate-600 truncate">{cat.title}</span>
                </div>
                <div className="text-right shrink-0 ml-2 font-medium text-slate-800">
                  <span>{formatCurrency(cat.total)}</span>
                  <span className="text-slate-400 text-[10px] ml-1.5 w-8 inline-block text-right">
                    {formatPercent(pct, 0)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Finansieringsdetaljer kort */}
      {(result.kreditivkostnad > 0 || result.pantbrevsavgift > 0) && (
        <div className="py-3 border-b border-slate-100 text-xs text-slate-600 space-y-1">
          <div className="flex justify-between text-slate-500">
            <span>Ränta byggnadskreditiv:</span>
            <span className="font-medium text-slate-700">{formatCurrency(result.kreditivkostnad)}</span>
          </div>
          {result.pantbrevsavgift > 0 && (
            <div className="flex justify-between text-slate-500">
              <span>Pantbrev (stämpelskatt 2 %):</span>
              <span className="font-medium text-slate-700">{formatCurrency(result.pantbrevsavgift)}</span>
            </div>
          )}
        </div>
      )}

      {/* Åtgärdsknapp för komplett specifikation */}
      <div className="pt-4">
        <button
          type="button"
          onClick={onOpenBreakdown}
          className="w-full flex items-center justify-center py-2.5 px-4 border border-slate-300 shadow-xs rounded-lg text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-slate-900 transition-colors cursor-pointer"
        >
          <ListChecks className="w-4 h-4 mr-2 text-slate-600" />
          Öppna detaljerad kostnadsspecifikation
        </button>
      </div>
    </div>
  );
}
