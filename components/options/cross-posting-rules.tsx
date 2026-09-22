import { useSettings } from "@/hooks/use-settings";
import type { XContext } from "@/types/settings";
import { MatrixSettingRow } from "@/components/shared/matrix-setting-row";

export function CrossPostingRules() {
  const { settings, updateSettings } = useSettings();

  const handleXContext = (key: XContext) => {
    updateSettings({
      xContexts: { ...settings.xContexts, [key]: !settings.xContexts[key] },
    });
  };

  const handleThreadsContext = (key: XContext) => {
    updateSettings({
      threadsContexts: {
        ...settings.threadsContexts,
        [key]: !settings.threadsContexts[key],
      },
    });
  };

  return (
    <div className="w-full overflow-hidden rounded-[24px] border-2 border-ink bg-white shadow-[8px_8px_0_var(--color-ink)] p-8 relative mb-6">
      <div className="flex items-center justify-between border-b-2 border-ink pb-4 mb-2">
        <h2 className="text-xl font-bold font-display text-ink flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-grape inline-block"></span>
          Cross-Posting Rules
        </h2>
        <div className="flex gap-4 sm:gap-8 pr-2">
          <span className="text-sm font-bold w-20 text-center leading-tight">
            From
            <br />X
          </span>
          <span className="text-sm font-bold w-20 text-center leading-tight">
            From
            <br />
            Threads
          </span>
        </div>
      </div>

      <p className="text-sm font-semibold text-ink/50 mb-6 mt-4">
        Select which post types to automatically yeet across platforms.
      </p>

      <div className="flex flex-col divide-y-2 divide-ink/10">
        <MatrixSettingRow
          label="Mention Posts"
          description="When composing from a profile page. Note: their @handle may differ on the destination platform."
          xChecked={settings.xContexts["mention-post"]}
          onXChange={() => handleXContext("mention-post")}
          threadsChecked={settings.threadsContexts["mention-post"]}
          onThreadsChange={() => handleThreadsContext("mention-post")}
        />

        <MatrixSettingRow
          label="Quote Posts"
          description="When you quote someone's post. Cross-posts your comment text only."
          xChecked={settings.xContexts["quote"]}
          onXChange={() => handleXContext("quote")}
          threadsChecked={settings.threadsContexts["quote"]}
          onThreadsChange={() => handleThreadsContext("quote")}
        />

        <MatrixSettingRow
          label="Replies"
          description="When you reply to a post. Not recommended — replies often lack context when yeeted."
          xChecked={settings.xContexts["reply"]}
          onXChange={() => handleXContext("reply")}
          threadsChecked={settings.threadsContexts["reply"]}
          onThreadsChange={() => handleThreadsContext("reply")}
        />

        <MatrixSettingRow
          label="Thread Continuation"
          description="When you append to an existing post or thread."
          xChecked={false}
          onXChange={() => {}}
          xLocked
          xComingSoon
          threadsChecked={false}
          onThreadsChange={() => {}}
          threadsLocked
          threadsComingSoon
        />
      </div>
    </div>
  );
}
