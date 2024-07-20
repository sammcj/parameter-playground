import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Settings, RefreshCw, Globe, Lock, Eye, EyeOff, Trash2 } from "lucide-react";
import useApiSettingsStore from "../../store/apiSettingsStore";
import useMagicBackgroundStore from "../../store/useMagicBackgroundStore";
import { toast } from "sonner";

const Setting = () => {
  const {
    apiKey,
    apiBaseUrl,
    modelName,
    availableModels,
    setApiKey,
    setApiBaseUrl,
    setModelName,
    fetchAvailableModels,
    clearAllSettings,
  } = useApiSettingsStore();

  const { clearMagicBackgroundSettings } = useMagicBackgroundStore();

  const [localSettings, setLocalSettings] = useState({
    apiKey: "",
    apiBaseUrl: apiBaseUrl || "http://localhost:11434/v1",
    modelName: "",
    maxTokens: 100,
  });
  const [isChanged, setIsChanged] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isFetchingModels, setIsFetchingModels] = useState(false);

  useEffect(() => {
    setLocalSettings({ apiKey, apiBaseUrl, modelName, maxTokens: 100 });
  }, [apiKey, apiBaseUrl, modelName]);

  useEffect(() => {
    setIsChanged(
      localSettings.apiKey !== apiKey ||
      localSettings.apiBaseUrl !== apiBaseUrl ||
      localSettings.modelName !== modelName
    );
  }, [localSettings, apiKey, apiBaseUrl, modelName]);

  const handleInputChange = (field, value) => {
    setLocalSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    setApiKey(localSettings.apiKey);
    setApiBaseUrl(localSettings.apiBaseUrl);
    setModelName(localSettings.modelName);
    toast.success("Settings saved", {
      description: "Your model configuration has been updated successfully.",
    });
  };

  const handleReset = () => {
    setLocalSettings({ apiKey, apiBaseUrl, modelName, maxTokens: 100 });
  };

  const toggleShowApiKey = () => {
    setShowApiKey(!showApiKey);
  };

  const handleFetchModels = async () => {
    setIsFetchingModels(true);
    try {
      await fetchAvailableModels();
      toast.success("Models fetched successfully", {
        description: "The list of available models has been updated.",
      });
    } catch (error) {
      toast.error("Failed to fetch models", {
        description: "Please check your API URL and try again.",
      });
    } finally {
      setIsFetchingModels(false);
    }
  };

  const handleClearAllSettings = () => {
    const newApiBaseUrl = clearAllSettings();
    clearMagicBackgroundSettings();

    setLocalSettings({
      apiKey: "",
      apiBaseUrl: apiBaseUrl || "http://localhost:11434/v1",
      modelName: "",
      maxTokens: 100,
    });
    toast.success("All settings cleared", {
      description: "Your settings have been reset to default values.",
    });
  };



  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="lg"
          variant="ghost"
          className="text-gray-400 hover:text-white hover:bg-gray-900 bg-gray-900/50 border backdrop-blur-lg border-gray-800/50 rounded-full flex items-center gap-2 px-4"
        >
          <div className="rounded-full border -ml-3 border-indigo-800/50 bg-gradient-to-t from-indigo-900/60 to-indigo-900/20 p-2">
            <Settings className="h-4 w-4" />
          </div>
          <span className="text-base">Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] sm:h-[80vh] bg-gray-900 border border-gray-800 text-gray-100">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-indigo-100 flex items-center gap-2">
            <div className="rounded-full border -ml-3 border-indigo-800/50 bg-gradient-to-t from-indigo-900/60 to-indigo-900/20 p-2">
              <Settings className="h-4 w-4" />
            </div>
            Settings
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-6">

          {/* API Key Input */}
          <div>
            <div className="flex items-center mb-2">
              <Label
                htmlFor="API Key"
                className="text-sm font-medium text-gray-300"
              >
                API Key
              </Label>
              {localSettings.apiKey !== apiKey && (
                <div className="w-2 h-2 bg-blue-500 rounded-full ml-2" />
              )}
            </div>
            <div className="relative">
              <Input
                id="API Key"
                type={showApiKey ? "text" : "password"}
                value={localSettings.apiKey}
                onChange={(e) => handleInputChange("apiKey", e.target.value)}
                className="bg-gray-800 border-gray-700 text-white focus:border-purple-500 focus:ring-purple-500 pr-10 transition-all duration-300 ease-in-out"
                placeholder={`Enter API Key`}
                style={{
                  opacity: showApiKey ? 1 : 0.5,
                }}
              />
              <button
                type="button"
                onClick={toggleShowApiKey}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white focus:outline-none"
              >
                {showApiKey ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Need an API key? Visit{" "}
              <a
                href="https://console.groq.com/docs/quickstart"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:underline"
              >
                Groq Console
              </a>{" "}
              to get a free API key
            </p>
          </div>


          {/* API Base URL Input */}
          <div>
            <div className="flex items-center mb-2">
              <Label
                htmlFor="API Base URL"
                className="text-sm font-medium text-gray-300"
              >
                API Base URL
              </Label>
              {localSettings.apiBaseUrl !== apiBaseUrl && (
                <div className="w-2 h-2 bg-blue-500 rounded-full ml-2" />
              )}
            </div>
            <Input
              id="API Base URL"
              value={localSettings.apiBaseUrl}
              onChange={(e) => handleInputChange("apiBaseUrl", e.target.value)}
              className="bg-gray-800 border-gray-700 text-white focus:border-purple-500 focus:ring-purple-500"
              placeholder={`Enter API Base URL (e.g., http://localhost:11434/v1)`}
            />
            <p className="text-xs text-gray-400 mt-2">
              Enter the base URL for your OpenAI-compatible API
            </p>
          </div>
        </div>

        {/* Model Selection */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label
              htmlFor="Model Name"
              className="text-sm font-medium text-gray-300"
            >
              Model Name
            </Label>
            <Button
              onClick={handleFetchModels}
              size="sm"
              variant="outline"
              className="text-xs"
              disabled={isFetchingModels}
            >
              {isFetchingModels ? "Fetching..." : "Fetch Models"}
            </Button>
          </div>
          <select
            id="Model Name"
            value={localSettings.modelName}
            onChange={(e) => handleInputChange("modelName", e.target.value)}
            className="w-full bg-gray-800 border-gray-700 text-white focus:border-purple-500 focus:ring-purple-500 rounded-md p-2"
          >
            <option value="">Select a model</option>
            {availableModels.map((model) => (
              <option key={model.id} value={model.id}>
                {model.id}
              </option>
            ))}
          </select>
          {availableModels.length === 0 && (
            <p className="text-xs text-gray-400 mt-2">
              No models available. Click "Fetch Models" to retrieve the list.
            </p>
          )}
        </div>


        {/* Max Tokens Input */}
        <div>
          <Label
            htmlFor="Max Tokens"
            className="text-sm font-medium text-gray-300"
          >
            Max Tokens
          </Label>
          <Input
            id="Max Tokens"
            type="number"
            value={localSettings.maxTokens}
            onChange={(e) => handleInputChange("maxTokens", e.target.value)}
            className="bg-gray-800 border-gray-700 text-white focus:border-purple-500 focus:ring-purple-500"
            placeholder="Enter maximum tokens"
          />
          <p className="text-xs text-gray-400 mt-2">
            Set the maximum number of tokens for the generated response
          </p>
        </div>

        {/* Save and Reset Buttons */}
        <div className="flex justify-end items-center gap-4">
          <Button
            onClick={handleReset}
            className="bg-gray-700 hover:bg-gray-600 text-white"
            disabled={!isChanged}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button
            onClick={handleSave}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6"
            disabled={!isChanged}
          >
            Save Changes
          </Button>
        </div>

        <div className="mt-8 pt-4 border-t border-gray-700">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Danger Zone</h4>
          <Button
            onClick={handleClearAllSettings}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All Settings
          </Button>
          <p className="text-xs text-gray-400 mt-2">
            This will reset all settings to their default values and clear any saved data.
          </p>
        </div>

        {/* Additional Info */}
        <div className="mt-8 flex flex-col gap-4 border border-indigo-900/50 rounded-xl p-4 bg-indigo-900/10">
          <div className="flex items-start gap-3 text-gray-200">
            <Globe className="h-5 w-5 text-gray-400 flex-shrink-0 mt-1" />
            <div>
              <h4 className="text-sm font-medium">Compatible APIs</h4>
              <p className="text-xs mt-1 text-gray-300">
                Use any OpenAI-Compatible API. I recommend{" "}
                <a
                  href="https://ollama.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:underline"
                >
                  Ollama
                </a>{" "}
                to run LLMs locally.
              </p>
            </div>
          </div>
          <div className="w-full h-px bg-indigo-900/50"></div>
          <div className="flex items-start gap-3 text-gray-200">
            <Lock className="h-5 w-5 text-gray-400 flex-shrink-0 mt-1" />
            <div>
              <h4 className="text-sm font-medium">Your Data Stays Local</h4>
              <p className="text-xs mt-1 text-gray-300">
                All settings are stored in your browser. No data is sent to the
                server.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};


export default Setting;
