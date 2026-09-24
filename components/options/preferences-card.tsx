import { SettingRow } from "@/components/shared/setting-row";
import { useSettings } from "@/hooks/use-settings";

export function PreferencesCard() {
  const { settings, updateSettings, isLoading } = useSettings();

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
          checked={settings.copyVideos}
          onChange={() => {
            updateSettings({ copyVideos: !settings.copyVideos });
          }}
        />
        <SettingRow
          label="Copy GIFs"
          description="Automatically include GIFs when yeeting."
          checked={settings.copyGifs}
          onChange={() => {
            updateSettings({ copyGifs: !settings.copyGifs });
          }}
        />
      </div>
    </div>
  );
}
