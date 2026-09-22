import { SettingRow } from "@/components/shared/setting-row";

export function PreferencesCard() {
  return (
    <div className="w-full overflow-hidden rounded-[24px] border-2 border-ink bg-white shadow-[8px_8px_0_var(--color-ink)] p-8 relative">
      <h2 className="text-xl font-bold font-display border-b-2 border-ink pb-4 mb-6 text-ink flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-coral inline-block"></span>
        Preferences
      </h2>
      <div className="flex flex-col">
        <SettingRow
          label="Copy Media"
          description="Automatically include images, videos, and GIFs."
          checked={false}
          locked
          comingSoon
          onChange={() => {}}
        />
      </div>
    </div>
  );
}
