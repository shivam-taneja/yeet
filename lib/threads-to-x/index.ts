/**
 * Threads → X cross-post — file map
 *
 * FLOW:
 *   1. capture-from-threads.ts  Threads: read Lexical → save pending text → open bg tab
 *   2. run-auto-post.ts         X (isolated): limit check → MAIN inject → click Post
 *   3. main/inject-text.ts      X (MAIN): Draft.js via execCommand
 *   4. main/watch-post-api.ts   X (MAIN): intercept CreateTweet → permalink
 *   5. on-post-success.ts       X (isolated): save link, clear pending text, close tab
 */

export { captureFromThreads } from "./capture-from-threads";
export { runXAutoPost } from "./run-auto-post";
export { installXMainWorld } from "./main/boot";
