/**
 * X → Threads cross-post — file map
 *
 * FLOW:
 *   1. capture-from-x.ts      X: sync snapshot images → save pending → open intent tab
 *   2. run-auto-post.ts       Threads (isolated): inject → attach → Post
 *      - text-only: auto-click Post
 *      - with images: file-input attach → wait preview+Post ready → auto-click Post
 *   3. main/inject-text.ts    Threads (MAIN): Lexical setEditorState
 *   4. attach-media.ts        Threads (MAIN via message): input.files + change
 *   5. main/watch-post-api.ts Threads (MAIN): intercept post API → permalink + postId
 *   6. on-post-success.ts     Threads (isolated): save link, clear pending, close tab
 *
 * WHERE TO LOOK WHEN SOMETHING BREAKS:
 *   - Composer / Post button not found → lib/selectors.json (threads.*)
 *   - Text not appearing in box     → main/inject-text.ts (Lexical find / setEditorState)
 *   - Images not attaching          → attach-media.ts (file input / drop)
 *   - No permalink after posting    → main/watch-post-api.ts (API paths / response shape)
 *   - Tab never closes              → on-post-success.ts
 */

export { captureFromX } from "./capture-from-x";
export { runThreadsAutoPost } from "./run-auto-post";
export { installThreadsMainWorld } from "./main/boot";
