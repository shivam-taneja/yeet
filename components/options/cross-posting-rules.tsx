import { cn } from "@/lib/utils";
import { useSettings } from "@/hooks/use-settings";
import type { ThreadsContext, XContext } from "@/types/settings";
import {
  MatrixSettingRow,
  matrixRulesGridClass,
} from "@/components/shared/matrix-setting-row";
import { SELECTORS } from "@/lib/constants";

export function CrossPostingRules() {
  const { settings, updateSettings } = useSettings();
  const selectors = SELECTORS;

  const handleXContext = (key: XContext) => {
    updateSettings({
      xContexts: { ...settings.xContexts, [key]: !settings.xContexts[key] },
    });
  };

  const handleThreadsContext = (key: ThreadsContext) => {
    updateSettings({
      threadsContexts: {
        ...settings.threadsContexts,
        [key]: !settings.threadsContexts[key],
      },
    });
  };

  const isXLocked = selectors.features.xToThreads === false;
  const isThreadsLocked = selectors.features.threadsToX === false;

  return (
    <div className="w-full rounded-[24px] border-2 border-ink bg-white shadow-[8px_8px_0_var(--color-ink)] p-5 sm:p-8 relative">
      <div className="border-b-2 border-ink pb-4 mb-2">
        <h2 className="text-xl font-bold font-display text-ink flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-grape inline-block"></span>
          Cross-Posting Rules
        </h2>
      </div>

      <div className="overflow-x-auto -mx-1 px-1 sm:mx-0 sm:px-0 mt-4">
        <div className="w-full min-w-0">
          <div
            className={cn(
              matrixRulesGridClass,
              "items-end border-b-2 border-ink/15 pb-3 mb-0",
            )}
          >
            <p className="min-w-0 pr-2 text-sm font-semibold text-ink/50 leading-snug">
              Select which post types to automatically yeet across platforms.
            </p>
            <p className="text-center text-[11px] sm:text-xs font-bold leading-tight text-ink/70">
              X →
              <br />
              Threads
            </p>
            <p className="text-center text-[11px] sm:text-xs font-bold leading-tight text-ink/70">
              Threads →
              <br />X
            </p>
          </div>

          <div className="flex flex-col divide-y-2 divide-ink/10">
            <MatrixSettingRow
              label="Mention Posts"
              description="When composing from a profile page. Note: their @handle may differ on the destination platform."
              xChecked={isXLocked ? false : settings.xContexts["mention-post"]}
              onXChange={() => handleXContext("mention-post")}
              xLocked={isXLocked}
              xComingSoon={isXLocked}
              threadsChecked={false}
              onThreadsChange={() => {}}
              threadsUnavailable
            />

            <MatrixSettingRow
              label="Quote Posts"
              description="When you quote someone's post. Cross-posts your comment text only."
              xChecked={isXLocked ? false : settings.xContexts.quote}
              onXChange={() => handleXContext("quote")}
              xLocked={isXLocked}
              xComingSoon={isXLocked}
              threadsChecked={
                isThreadsLocked ? false : settings.threadsContexts.quote
              }
              onThreadsChange={() => handleThreadsContext("quote")}
              threadsLocked={isThreadsLocked}
              threadsComingSoon={isThreadsLocked}
            />

            <MatrixSettingRow
              label="Replies"
              description="When you reply to a post. Not recommended — replies often lack context when yeeted."
              xChecked={isXLocked ? false : settings.xContexts.reply}
              onXChange={() => handleXContext("reply")}
              xLocked={isXLocked}
              xComingSoon={isXLocked}
              threadsChecked={
                isThreadsLocked ? false : settings.threadsContexts.reply
              }
              onThreadsChange={() => handleThreadsContext("reply")}
              threadsLocked={isThreadsLocked}
              threadsComingSoon={isThreadsLocked}
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
      </div>
    </div>
  );
}
