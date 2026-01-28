export interface ElectronAPI {
  setAlwaysOnTop: (enabled: boolean) => Promise<boolean>;
  setDecorations: (enabled: boolean) => Promise<boolean>;
  getWindowSize: () => Promise<{ width: number; height: number }>;
  setWindowSize: (width: number, height: number) => Promise<boolean>;
  setMinSize: (width: number, height: number) => Promise<boolean>;
  closeWindow: () => Promise<void>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
