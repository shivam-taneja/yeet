export interface AppSettings {
  copyImages: boolean;
  isActive: boolean;
  lastSavedAt: number | null;
  lastYeet: {
    text: string;
    timestamp: number;
    platform: "X" | "Threads";
  } | null;
}
