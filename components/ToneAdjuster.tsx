import React, { useState, useCallback, useEffect, useRef } from "react";
import debounce from "lodash/debounce";
import ScrambleText from "./commons/ScrambleText";
import ToneChangerGrid from "./ToneChangerGrid";
import useApiSettingsStore from "../store/apiSettingsStore";
import AdvancedParameterPlayground from "./AdvancedParameterPlayground";
import { Switch } from "./ui/slider-switch";
import { Label } from "./ui/label";

interface Parameters {
  [key: string]: number;
}

// Valid parameters for Ollama: https://github.com/ollama/ollama/blob/main/docs/modelfile.md#valid-parameters-and-values
// Valid parameters for Transformers: https://huggingface.co/docs/transformers/main_classes/text_generation
const ToneAdjuster: React.FC = () => {
  const [inputText, setInputText] = useState<string>("");
  const [outputText, setOutputText] = useState<string>("");
  const [previousOutput, setPreviousOutput] = useState<string>("");
  const [currentParams, setCurrentParams] = useState<Parameters>({
    temperature: null, // The temperature of the model. Increasing the temperature will make the model answer more creatively. (Default: 0.8)
    top_p: null, // Works together with top-k. A higher value (e.g., 0.95) will lead to more diverse text, while a lower value (e.g., 0.5) will generate more focused and conservative text. (Default: 0.9)
    top_k: null, // Reduces the probability of generating nonsense. A higher value (e.g. 100) will give more diverse answers, while a lower value (e.g. 10) will be more conservative. (Default: 40)
    frequency_penalty: null,
    presence_penalty: null,
    repetition_penalty: null, // Sets how strongly to penalize repetitions. A higher value (e.g., 1.5) will penalise repetitions more strongly, while a lower value (e.g., 0.9) will be more lenient. (Default: 1.1)
    mirostat: null, // Enable Mirostat sampling for controlling perplexity. (default: 0, 0 = disabled, 1 = Mirostat, 2 = Mirostat 2.0)
    mirostat_eta: null, // Influences how quickly the algorithm responds to feedback from the generated text. A lower learning rate will result in slower adjustments, while a higher learning rate will make the algorithm more responsive. (Default: 0.1)
    mirostat_tau: null, // Controls the balance between coherence and diversity of the output. A lower value will result in more focused and coherent text. (Default: 5.0)
    repeat_last_n: null, // Sets how far back for the model to look back to prevent repetition. (Default: 64, 0 = disabled, -1 = num_ctx)
    tfs_z: null, // Tail free sampling is used to reduce the impact of less probable tokens from the output. A higher value (e.g., 2.0) will reduce the impact more, while a value of 1.0 disables this setting. (default: 1)
    typical_p: null, // typical_p (float, optional, defaults to 1.0) — Local typicality measures how similar the conditional probability of predicting a target token next is to the expected conditional probability of predicting a random token next, given the partial text already generated. If set to float < 1, the smallest set of the most locally typical tokens with probabilities that add up to typical_p or higher are kept for generation. See this paper for more details.
  });
  const [previousParams, setPreviousParams] = useState<Parameters | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAdvancedMode, setIsAdvancedMode] = useState<boolean>(false);
  const [isFiveParameterMode, setIsFiveParameterMode] = useState<boolean>(false);
  const { apiKey, apiBaseUrl, modelName, maxTokens } = useApiSettingsStore();

  const generateTextRef = useRef<(text: string, params: Parameters) => void>();

  useEffect(() => {
    generateTextRef.current = debounce(async (text: string, params: Parameters) => {
      if (text.length <= 3) return;

      setIsLoading(true);
      try {
        const systemMessage = `You are a skilled writer tasked with rewriting text.
        Adjust the input text while maintaining its original meaning and intent.
        DO NOT mention or explain the adjustment process or parameters in your response.`;

        const userMessage = `Rewrite the following text: "${text}"`;

        const requestBody: any = {
          model: modelName,
          messages: [
            { role: "system", content: systemMessage },
            { role: "user", content: userMessage },
          ],
          max_tokens: maxTokens,
          ...params, // Spread the parameters directly into the request body
        };

        const response = await fetch(`${apiBaseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error(`API responded with status ${response.status}`);
        }

        const data = await response.json();
        const newOutput = data.choices[0].message.content.trim() || "";

        setPreviousOutput(outputText);
        setPreviousParams(currentParams);
        setOutputText(newOutput);
        setCurrentParams(params);
      } catch (error) {
        console.error("Error adjusting text:", error);
        setOutputText("Error adjusting text");
      } finally {
        setIsLoading(false);
      }
    }, 1000);
  }, [apiKey, apiBaseUrl, modelName, maxTokens, outputText, currentParams]);

  const handleInputChange = useCallback((text: string) => {
    setInputText(text);
    if (text.length > 3 && generateTextRef.current) {
      generateTextRef.current(text, currentParams);
    }
  }, [currentParams]);

  const handleParameterChange = useCallback(
    (newParameters: Parameters) => {
      setCurrentParams(newParameters);
      if (inputText.length > 3 && generateTextRef.current) {
        generateTextRef.current(inputText, newParameters);
      }
    },
    [inputText]
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
      <div className="flex flex-col items-center justify-center">
        <div className="flex items-center justify-end w-full mb-4 space-x-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="advanced-mode" className="text-white">
              Advanced Mode
            </Label>
            <Switch
              id="advanced-mode"
              checked={isAdvancedMode}
              onCheckedChange={setIsAdvancedMode}
            />
          </div>
          {isAdvancedMode && (
            <div className="flex items-center space-x-2">
              <Label htmlFor="five-parameter-mode" className="text-white">
                5 Parameters
              </Label>
              <Switch
                id="five-parameter-mode"
                checked={isFiveParameterMode}
                onCheckedChange={setIsFiveParameterMode}
              />
            </div>
          )}
        </div>
        {isAdvancedMode ? (
          <AdvancedParameterPlayground
            onParameterChange={handleParameterChange}
            isFiveParameterMode={isFiveParameterMode}
          />
        ) : (
          <ToneChangerGrid onParameterChange={handleParameterChange} />
        )}
      </div>
      <div className="grid grid-rows-[1fr_1fr_1fr] gap-2 h-full">
        {/* Input Text box */}
        <div className="relative flex-grow border border-indigo-700/20 rounded-2xl">
          <label className="absolute top-2 left-6 text-sm font-semibold text-indigo-300">
            Input Text
          </label>
          <textarea
            className="w-full h-full p-6 pt-10 text-lg bg-indigo-950/60 backdrop-blur-lg text-indigo-100 rounded-2xl resize-none focus:ring-2 focus:ring-purple-500 focus:outline-none placeholder-indigo-300/50"
            placeholder="Enter text to adjust..."
            value={inputText}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              handleInputChange(e.target.value)
            }
          />
        </div>

        {/* Generated Output box */}
        <div className="relative flex-grow rounded-2xl border-4 border-transparent bg-violet-950/60 backdrop-blur-lg">
          <label className="absolute top-2 left-6 text-xl font-semibold text-violet-300">
            Generated Output
          </label>
          <div className="absolute top-0 right-4 text-xs text-violet-300 grid grid-cols-2 gap-x-4">
            {Object.entries(currentParams).map(([key, value]) => (
              value && <span key={key}>{`${key}: ${value.toFixed(2)}`}</span>
            ))}
          </div>
          <div className="w-full h-full p-6 pt-24 text-lg rounded-2xl overflow-auto text-violet-100 font-medium">
            {isLoading ? (
              <div className="animate-pulse">Generating...</div>
            ) : (
              <ScrambleText text={outputText} speed={0.8} tick={0.5} />
            )}
          </div>
        </div>

        {/* Previous Generation box */}
        <div className="relative flex-grow rounded-2xl border-4 border-transparent bg-violet-950/60 backdrop-blur-lg">
          <label className="absolute top-2 left-6 text-xl font-semibold text-violet-300">
            Previous Generation
          </label>
          {previousParams && (
            <div className="absolute top-0 right-4 text-xs text-violet-300 grid grid-cols-2 gap-x-4">
              {Object.entries(previousParams).map(([key, value]) => (
                <span key={key}>{`${key}: ${value.toFixed(2)}`}</span>
              ))}
            </div>
          )}
          <div className="w-full h-full p-6 pt-24 text-lg rounded-2xl overflow-auto text-violet-100 font-medium">
            {previousOutput}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToneAdjuster;
