interface SuggestionTooltipProps {
  isVisible: boolean;
  suggestionText: string;
  onMinimize: () => void;
  onDiscard: () => void;
  bottomValue?: number;
}

export default function NodeSuggestionTooltip({
  isVisible,
  suggestionText,
  onMinimize,
  onDiscard,
  bottomValue = 8
}: SuggestionTooltipProps) {
  if (!isVisible) return null;

  return (
    <div 
      className="absolute nodrag nopan"
      style={{
        bottom: `calc(100% + ${bottomValue}px)`,
        left: '50%',
        transform: 'translateX(-50%)',
        pointerEvents: 'all',
        zIndex: 1000
      }}
    >
      <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-600 rounded-xl shadow-lg p-3 w-64 text-sm">
        {/* Header */}
        <div className="flex justify-between items-center mb-2 gap-2">
          <div className="flex items-center gap-1.5">
            
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-3.5 text-sky-500 shrink-0"
            >
              <path
                fillRule="evenodd"
                d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5Z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-semibold text-sky-600 dark:text-sky-400 text-xs uppercase tracking-wide leading-none">
              Sugerencia IA
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={onMinimize}
              title="Minimizar"
              className="w-5 h-5 flex items-center justify-center rounded text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 dark:hover:text-zinc-200 transition-colors text-base font-bold leading-none"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-6" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14"/>
                </svg>

            </button>

            <button
              onClick={onDiscard}
              title="Descartar sugerencia"
              className="w-5 h-5 flex items-center justify-center rounded text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/40 dark:hover:text-red-400 transition-colors text-xs font-bold leading-none"
            >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-6" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12"/>
            </svg>

            </button>
          </div>
        </div>

        <div className="border-t border-zinc-100 dark:border-zinc-700 mb-2" />

        {/* Suggestion text */}
        <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-xs">
          {suggestionText}
        </p>
      </div>
    </div>
  );
}
