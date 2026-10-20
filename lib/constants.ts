import localSelectors from "./selectors.json";
import type { SelectorsConfig } from "@/types/selectors";

/** Bundled selectors + feature flags (shipped with each extension build). */
export const SELECTORS = localSelectors as SelectorsConfig;
