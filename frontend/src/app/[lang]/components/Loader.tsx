export default function Loader() {
    return (
      <div 
        className="min-h-[60vh] flex items-center justify-center"
        role="status"
        aria-live="polite"
        aria-label="Loading content"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 border-4 border-slate-200 dark:border-slate-700 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <span className="text-slate-500 dark:text-slate-400 text-sm">Loading...</span>
        </div>
      </div>
    );
  }
