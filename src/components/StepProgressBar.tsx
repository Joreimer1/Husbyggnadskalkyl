import React from 'react';
import { Check } from 'lucide-react';

export interface StepItem {
  id: number;
  title: string;
  shortTitle: string;
  description: string;
}

interface StepProgressBarProps {
  steps: StepItem[];
  currentStep: number;
  onSelectStep: (stepId: number) => void;
  isAllStepsMode: boolean;
  onToggleAllStepsMode: () => void;
}

export function StepProgressBar({
  steps,
  currentStep,
  onSelectStep,
  isAllStepsMode,
  onToggleAllStepsMode,
}: StepProgressBarProps) {
  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Välj läge: Stegläge vs Samlad vy */}
          <div className="flex items-center justify-between sm:justify-start space-x-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {isAllStepsMode ? 'Läge: Fullständig kalkylvy' : `Steg ${currentStep} av ${steps.length}`}
            </span>
            <button
              type="button"
              onClick={onToggleAllStepsMode}
              className="text-xs font-medium text-slate-700 hover:text-slate-900 underline underline-offset-4 cursor-pointer"
            >
              {isAllStepsMode ? 'Växla till steg-för-steg' : 'Visa alla sektioner'}
            </button>
          </div>

          {/* Stegknappar */}
          {!isAllStepsMode && (
            <div className="flex items-center overflow-x-auto pb-1 sm:pb-0 scrollbar-none gap-1 sm:gap-2">
              {steps.map((step) => {
                const isCompleted = step.id < currentStep;
                const isCurrent = step.id === currentStep;

                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => onSelectStep(step.id)}
                    className={`inline-flex items-center px-2.5 py-1.5 rounded-md text-xs font-medium transition-all shrink-0 cursor-pointer ${
                      isCurrent
                        ? 'bg-slate-900 text-white shadow-xs'
                        : isCompleted
                        ? 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center mr-1.5 text-[10px] font-semibold ${
                        isCurrent
                          ? 'bg-white text-slate-900'
                          : isCompleted
                          ? 'bg-slate-300 text-slate-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isCompleted ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : step.id}
                    </span>
                    <span>{step.shortTitle}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
