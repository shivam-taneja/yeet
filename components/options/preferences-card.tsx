import { useEffect, useState } from "react";
import { SettingRow } from "@/components/shared/setting-row";
import { useSettings } from "@/hooks/use-settings";
import { clearPendingMedia, getPendingMediaSize } from "@/lib/media-storage";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function PreferencesCard() {
  const { settings, updateSettings, isLoading } = useSettings();
  const [mediaSize, setMediaSize] = useState<number>(0);
  const [clearing, setClearing] = useState(false);

  const refreshSize = () => {
    getPendingMediaSize().then(setMediaSize);
  };

  useEffect(() => {
    refreshSize();
  }, []);

  const handleClear = async () => {
    setClearing(true);
    await clearPendingMedia();
    refreshSize();
    setClearing(false);
  };

  if (isLoading) return null;

  return (
    <div className="w-full h-full flex flex-col overflow-hidden rounded-[24px] border-2 border-ink bg-white shadow-[8px_8px_0_var(--color-ink)] p-8 relative">
      <h2 className="text-xl font-bold font-display border-b-2 border-ink pb-4 mb-6 text-ink flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-coral inline-block"></span>
        Preferences
      </h2>
      <div className="flex flex-col">
        <SettingRow
          label="Copy Images"
          description="Automatically include images when yeeting."
          checked={settings.copyImages}
          onChange={() => {
            updateSettings({ copyImages: !settings.copyImages });
          }}
        />
        <SettingRow
          label="Copy Videos"
          description="Automatically include videos when yeeting."
          checked={false}
          onChange={() => {}}
          locked
          comingSoon
        />
        <SettingRow
          label="Copy GIFs"
          description="Automatically include GIFs when yeeting."
          checked={false}
          onChange={() => {}}
          locked
          comingSoon
        />
      </div>
      <div className="mt-6 pt-6 border-t-2 border-ink/10 flex items-center justify-between">
        <div>
          <p className="font-bold text-sm text-ink">Cached Media</p>
          <p className="text-xs font-semibold text-ink/50 mt-0.5">
            {mediaSize > 0 ? formatBytes(mediaSize) : "Nothing cached"}
          </p>
        </div>
        <button
          type="button"
          onClick={handleClear}
          disabled={clearing || mediaSize === 0}
          className="text-xs font-black uppercase tracking-widest border-2 border-ink px-3 py-1.5 rounded-full transition-all hover:bg-ink hover:text-cream disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {clearing ? "Clearing…" : "Clear"}
        </button>
      </div>
    </div>
  );
}
