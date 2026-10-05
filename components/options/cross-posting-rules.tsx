import { useState, useEffect } from "react";
import { browser } from "wxt/browser";
import { useSettings } from "@/hooks/use-settings";
import type { XContext } from "@/types/settings";
import { SettingRow } from "@/components/shared/setting-row";
import { FALLBACK_SELECTORS, mergeSelectors } from "@/lib/constants";

export function CrossPostingRules() {
  const { settings, updateSettings } = useSettings();
  const [selectors, setSelectors] = useState(FALLBACK_SELECTORS);

  useEffect(() => {
    browser.storage.local.get(["selectors"]).then((res) => {
      if (res.selectors) {
        setSelectors(mergeSelectors(res.selectors));
      }
    });
  }, []);

  const handleXContext = (key: XContext) => {
    updateSettings({
      xContexts: { ...settings.xContexts, [key]: !settings.xContexts[key] },
    });
  };

  const isXLocked = selectors.features.xToThreads === false;

  return (
    <div className="w-full h-full overflow-hidden rounded-[24px] border-2 border-ink bg-white shadow-[8px_8px_0_var(--color-ink)] p-8 relative">
      <div className="flex items-center justify-between border-b-2 border-ink pb-4 mb-2">
        <h2 className="text-xl font-bold font-display text-ink flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-grape inline-block"></span>
          Cross-Posting Rules
        </h2>
        <span className="text-sm font-bold text-ink/60">X → Threads</span>
      </div>

      <p className="text-sm font-semibold text-ink/50 mb-6 mt-4">
        Choose which X post types to automatically yeet to Threads.
      </p>

      <div className="flex flex-col divide-y-2 divide-ink/10">
        <SettingRow
          label="Mention Posts"
          description="When composing from a profile page. Note: their @handle may differ on Threads."
          checked={isXLocked ? false : settings.xContexts["mention-post"]}
          onChange={() => handleXContext("mention-post")}
          locked={isXLocked}
          comingSoon={isXLocked}
        />

        <SettingRow
          label="Quote Posts"
          description="When you quote someone's post. Cross-posts your comment text only."
          checked={isXLocked ? false : settings.xContexts["quote"]}
          onChange={() => handleXContext("quote")}
          locked={isXLocked}
          comingSoon={isXLocked}
        />

        <SettingRow
          label="Replies"
          description="When you reply to a post. Not recommended — replies often lack context when yeeted."
          checked={isXLocked ? false : settings.xContexts["reply"]}
          onChange={() => handleXContext("reply")}
          locked={isXLocked}
          comingSoon={isXLocked}
        />

        <SettingRow
          label="Thread Continuation"
          description="When you append to an existing post or thread."
          checked={false}
          onChange={() => {}}
          locked
          comingSoon
        />
      </div>
    </div>
  );
}
