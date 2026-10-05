/**
 * X → Threads cross-post — file map
 *
 * FLOW:
 *   1. capture-from-x.ts      X: read composer → save pending text → open bg tab
 *   2. run-auto-post.ts       Threads (isolated): wait for composer → ask MAIN to inject → click Post
 *   3. main/inject-text.ts    Threads (MAIN): find Lexical editor → setEditorState
 *   4. main/watch-post-api.ts Threads (MAIN): intercept post API → permalink + postId
 *   5. on-post-success.ts     Threads (isolated): save link, clear pending text, close tab
 *
 * WHERE TO LOOK WHEN SOMETHING BREAKS:
 *   - Composer / Post button not found → lib/selectors.json (threads.*)
 *   - Text not appearing in box     → main/inject-text.ts (Lexical find / setEditorState)
 *   - No permalink after posting    → main/watch-post-api.ts (API paths / response shape)
 *   - Tab never closes              → on-post-success.ts
 */

export { captureFromX } from "./capture-from-x";
export { runThreadsAutoPost } from "./run-auto-post";
export { installThreadsMainWorld } from "./main/boot";
