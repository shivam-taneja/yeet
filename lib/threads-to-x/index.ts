/**
 * Threads → X cross-post — file map
 *
 * FLOW:
 *   1. warm-image-cache.ts      Threads: prefetch composer images while composing
 *   2. capture-from-threads.ts  Threads: text + warm Files → storage → background intent
 *   3. run-auto-post.ts         X (isolated): inject → attach → wait ready → Post
 *   4. main/inject-text.ts      X (MAIN): Draft.js via execCommand
 *   5. attach-media.ts          X (MAIN via message): input[data-testid=fileInput] + change
 *   6. main/watch-post-api.ts   X (MAIN): intercept CreateTweet → permalink
 *   7. on-post-success.ts       X (isolated): save link, clear pending, close tab
 *
 * WHERE TO LOOK WHEN SOMETHING BREAKS:
 *   - Empty images at Post         → warm-image-cache.ts (Threads revoked blob: too early)
 *   - Wrong / random images        → capture-images.ts (must stay composer-scoped, not feed)
 *   - Video/GIF yeet attempted     → capture-from-threads.ts (should alert + skip)
 *   - Composer / Post not found    → lib/selectors.json (x.*)
 *   - Text not appearing           → main/inject-text.ts
 *   - Images not attaching         → attach-media.ts (fileInput / drop / preview detect)
 *   - No permalink after posting   → main/watch-post-api.ts
 *   - Tab never closes             → on-post-success.ts
 */

export { captureFromThreads } from "./capture-from-threads";
export { runXAutoPost } from "./run-auto-post";
export { installXMainWorld } from "./main/boot";
