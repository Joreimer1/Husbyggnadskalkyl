import { Building2, FileSpreadsheet } from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
  onPrint: () => void;
}

export function Header({ onReset, onPrint }: HeaderProps) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start sm:items-center space-x-3.5">
            <div className="p-2.5 bg-slate-900 text-white rounded-lg shadow-sm shrink-0">
              <Building2 className="w-6 h-6 text-slate-100" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  Husbyggnadskalkylator
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-300">
                  Kalkylunderlag 2026
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Professionell produktionskostnadskalkyl och schablonmodell för småhus och tillhörande markentreprenad.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 self-end md:self-auto">
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center px-3 py-1.5 border border-slate-300 shadow-xs text-xs sm:text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors cursor-pointer"
            >
              Återställ standard
            </button>
            <button
              type="button"
              onClick={onPrint}
              className="inline-flex items-center px-3.5 py-1.5 border border-transparent shadow-xs text-xs sm:text-sm font-medium rounded-md text-white bg-slate-900 hover:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 mr-1.5 text-slate-200" />
              Skriv ut / Spara PDF
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
