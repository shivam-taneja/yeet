import { useState } from "react";
import { SettingRow } from "@/components/shared/setting-row";
import { useSettings } from "@/hooks/use-settings";

export function PreferencesCard() {
  const { settings, updateSettings, resetToDefaults, isLoading } =
    useSettings();
  const [isResetting, setIsResetting] = useState(false);

  if (isLoading) return null;

  const handleReset = async () => {
    const confirmed = window.confirm(
      "Reset all Yeet settings to their defaults? Cross-posting rules, preferences, and in-progress yeet state will be cleared. Your X and Threads logins are not affected.",
    );
    if (!confirmed) return;

    setIsResetting(true);
    try {
      await resetToDefaults();
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="w-full flex flex-col rounded-[24px] border-2 border-ink bg-white shadow-[8px_8px_0_var(--color-ink)] p-5 sm:p-8 relative">
      <h2 className="text-xl font-bold font-display border-b-2 border-ink pb-4 mb-6 text-ink flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-coral inline-block"></span>
        Preferences
      </h2>
      <div className="flex flex-col divide-y-2 divide-ink/10">
        <SettingRow
          label="Copy Images"
          description="Include images when yeeting either way (auto-posts in a background tab)."
          checked={settings.copyImages}
          onChange={() =>
            updateSettings({ copyImages: !settings.copyImages })
          }
        />
        <SettingRow
          label="Copy Videos"
          description="Automatically include videos when yeeting."
          checked={settings.copyVideos}
          onChange={() => {}}
          locked
          comingSoon
        />
        <SettingRow
          label="Copy GIFs"
          description="Automatically include GIFs when yeeting."
          checked={settings.copyGifs}
          onChange={() => {}}
          locked
          comingSoon
        />
      </div>

      <div className="pt-6 mt-2 border-t-2 border-ink/10">
        <button
          type="button"
          onClick={handleReset}
          disabled={isResetting}
          className="inline-flex h-12 w-full items-center justify-center rounded-xl border-2 border-ink bg-cream px-4 text-sm font-bold text-ink shadow-[3px_3px_0_var(--color-ink)] transition-all hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--color-ink)] active:translate-y-0.5 active:shadow-none disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        >
          {isResetting ? "Resetting…" : "Reset everything to default"}
        </button>
      </div>
    </div>
  );
}
