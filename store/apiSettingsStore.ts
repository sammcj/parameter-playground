import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Model {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}

interface ApiSettingsState {
  apiKey: string;
  apiBaseUrl: string;
  modelName: string;
  availableModels: Model[];
  maxTokens: number;
  seed: number | null;
  setApiKey: (apiKey: string) => void;
  setApiBaseUrl: (apiBaseUrl: string) => void;
  setModelName: (modelName: string) => void;
  setAvailableModels: (models: Model[]) => void;
  setMaxTokens: (maxTokens: number) => void;
  setSeed: (seed: number | null) => void;
  fetchAvailableModels: () => Promise<void>;
  clearAllSettings: () => void;
}

const getInitialApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const envApiBase = process.env.OPENAI_API_BASE;
    if (envApiBase && envApiBase.startsWith('http')) {
      return envApiBase;
    }
  }
  return 'http://localhost:11434/v1';
};

const useApiSettingsStore = create<ApiSettingsState>()(
  persist(
    (set, get) => ({
      apiKey: "",
      apiBaseUrl: getInitialApiBaseUrl(),
      modelName: "",
      availableModels: [],
      maxTokens: 100,
      seed: 1337,
      setApiKey: (apiKey: string) => set({ apiKey }),
      setApiBaseUrl: (apiBaseUrl: string) => set({ apiBaseUrl }),
      setModelName: (modelName: string) => set({ modelName }),
      setAvailableModels: (models: Model[]) => set({ availableModels: models }),
      setMaxTokens: (maxTokens: number) => set({ maxTokens }),
      setSeed: (seed: number | null) => set({ seed }),
      fetchAvailableModels: async () => {
        const { apiBaseUrl } = get();
        try {
          const response = await fetch(`${apiBaseUrl}/models`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          set({ availableModels: data.data });
        } catch (error) {
          console.error("Failed to fetch available models:", error);
          throw error;
        }
      },
      clearAllSettings: () => {
        const defaultApiBaseUrl = getInitialApiBaseUrl();
        set({
          apiKey: "",
          apiBaseUrl: defaultApiBaseUrl,
          modelName: "",
          availableModels: [],
          maxTokens: 100,
          seed: 1337,
        });
        console.log("Cleared all settings");
      }
    }),
    {
      name: "api-settings-storage",
    }
  )
);

export default useApiSettingsStore;
