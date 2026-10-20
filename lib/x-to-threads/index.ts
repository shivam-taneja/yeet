/**
 * X → Threads cross-post — file map
 *
 * FLOW:
 *   1. warm-image-cache.ts    X: prefetch composer images while composing
 *   2. capture-from-x.ts      X: text + warm Files → storage → background intent tab
 *   3. run-auto-post.ts       Threads (isolated): inject → attach → wait ready → Post
 *   4. main/inject-text.ts    Threads (MAIN): Lexical setEditorState
 *   5. attach-media.ts        Threads (MAIN via message): input.files + change
 *   6. main/watch-post-api.ts Threads (MAIN): intercept post API → permalink + postId
 *   7. on-post-success.ts     Threads (isolated): save link, clear pending, close tab
 *
 * WHERE TO LOOK WHEN SOMETHING BREAKS:
 *   - Empty images at Post         → warm-image-cache.ts (X revoked blob: too early)
 *   - Wrong / random images        → capture-images.ts (must stay composer-scoped, not feed)
 *   - Video/GIF yeet attempted     → capture-from-x.ts (should alert + skip)
 *   - Composer / Post not found    → lib/selectors.json (threads.*)
 *   - Text not appearing           → main/inject-text.ts
 *   - Images not attaching         → attach-media.ts (file input / drop / preview detect)
 *   - No permalink after posting   → main/watch-post-api.ts
 *   - Tab never closes             → on-post-success.ts
 */

export { captureFromX } from "./capture-from-x";
export { runThreadsAutoPost } from "./run-auto-post";
export { installThreadsMainWorld } from "./main/boot";
