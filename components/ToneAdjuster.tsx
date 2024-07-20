import React, { useState, useCallback, useEffect, useRef } from "react";
import debounce from "lodash/debounce";
import ScrambleText from "./commons/ScrambleText";
import ToneChangerGrid from "./ToneChangerGrid";
import useApiSettingsStore from "../store/apiSettingsStore";

interface Parameters {
  [key: string]: number;
}

const ToneAdjuster: React.FC = () => {
  const [inputText, setInputText] = useState<string>("");
  const [outputText, setOutputText] = useState<string>("");
  const [previousOutput, setPreviousOutput] = useState<string>("");
  const [currentParams, setCurrentParams] = useState<Parameters>({
    temperature: 0.7,
    top_p: 0.9,
    top_k: 50,
    frequency_penalty: 0,
    presence_penalty: 0,
    repetition_penalty: 1,
    length_penalty: 0,
    diversity_penalty: 0,
  });
  const [previousParams, setPreviousParams] = useState<Parameters | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
        <ToneChangerGrid onParameterChange={handleParameterChange} />
      </div>
      <div className="grid grid-rows-[1fr_1fr_1fr] gap-2 h-full">
        {/* Input Text box remains the same */}
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

        {/* Updated Generated Output box */}
        <div className="relative flex-grow rounded-2xl border-4 border-transparent bg-violet-950/60 backdrop-blur-lg">
          <label className="absolute top-2 left-6 text-xl font-semibold text-violet-300">
            Generated Output
          </label>
          <div className="absolute top-0 right-4 text-xs text-violet-300 grid grid-cols-2 gap-x-4">
            {Object.entries(currentParams).map(([key, value]) => (
              <span key={key}>{`${key}: ${value.toFixed(2)}`}</span>
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

        {/* Previous Generation box remains the same */}
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
