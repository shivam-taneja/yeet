export function PreferencesCard() {
  return (
    <div className="w-full h-full flex flex-col overflow-hidden rounded-[24px] border-2 border-ink bg-white shadow-[8px_8px_0_var(--color-ink)] p-8 relative">
      <h2 className="text-xl font-bold font-display border-b-2 border-ink pb-4 mb-6 text-ink flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-coral inline-block"></span>
        Preferences
      </h2>
      <p className="text-sm font-semibold text-ink/60 leading-relaxed">
        Media options (images, videos, GIFs) are paused while we rebuild
        X → Threads on a cleaner path. Text-only yeeting still works from the
        cross-posting rules.
      </p>
    </div>
  );
}