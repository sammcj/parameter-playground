import React, { useState, useRef, useEffect } from "react";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider-switch";
import { Select } from "./ui/select";

interface Parameter {
  name: string;
  min: number;
  max: number;
  step: number;
  default: number;
  description: string;
}

const allParameters: Record<string, Parameter> = {
  temperature: { name: "Temperature", min: 0, max: 2, step: 0.01, default: 0.7, description: "Controls randomness: Lower values make the output more focused and deterministic, higher values make it more random and creative." },
  top_p: { name: "Top P", min: 0, max: 1, step: 0.01, default: 0.9, description: "Nucleus sampling: Only consider the top P probability mass of tokens when generating." },
  top_k: { name: "Top K", min: 1, max: 100, step: 1, default: 50, description: "Limits the number of token choices considered at each step to the top K options." },
  frequency_penalty: { name: "Frequency Penalty", min: -2, max: 2, step: 0.1, default: 0, description: "Reduces repetition by lowering the probability of tokens that have already appeared in the text." },
  presence_penalty: { name: "Presence Penalty", min: -2, max: 2, step: 0.1, default: 0, description: "Encourages the model to talk about new topics by increasing the probability of tokens that haven't appeared yet." },
  repetition_penalty: { name: "Repetition Penalty", min: 1, max: 2, step: 0.01, default: 1, description: "Penalises repetitions: Values above 1 decrease the likelihood of repeated tokens." },
  mirostat: { name: "Mirostat", min: 0, max: 2, step: 1, default: 0, description: "Enable Mirostat sampling for controlling perplexity, 0 = disabled, 1 = Mirostat, 2 = Mirostat 2.0." },
  mirostat_eta: { name: "Mirostat Eta", min: 0, max: 1, step: 0.01, default: 0.1, description: "Influences how quickly the algorithm responds to feedback from the generated text." },
  mirostat_tau: { name: "Mirostat Tau", min: 0, max: 10, step: 0.1, default: 5, description: "Controls the balance between coherence and diversity of the output." },
  repeat_last_n: { name: "Repeat Last N", min: -1, max: 64, step: 1, default: 64, description: "Sets how far back for the model to look back to prevent repetition." },
  tfs_z: { name: "Tail Free Sampling Z", min: 1, max: 2, step: 0.1, default: 1, description: "Tail free sampling is used to reduce the impact of less probable tokens from the output." },
  typical_p: { name: "Typical P", min: 0, max: 1, step: 0.01, default: 1, description: "Local typicality measures how similar the conditional probability of predicting a target token next is to the expected conditional probability of predicting a random token next, given the partial text already generated." },
};

interface AdvancedParameterPlaygroundProps {
  onParameterChange: (params: Record<string, number>) => void;
  isFiveParameterMode: boolean;
}

const AdvancedParameterPlayground: React.FC<AdvancedParameterPlaygroundProps> = ({ onParameterChange, isFiveParameterMode }) => {
  const [sliderValues, setSliderValues] = useState<Record<string, number>>({});
  const [selectedParams, setSelectedParams] = useState<string[]>(
    isFiveParameterMode
      ? ["temperature", "top_p", "top_k", "frequency_penalty", "presence_penalty"]
      : ["temperature", "top_p"]
  );
  const decagonRef = useRef<SVGSVGElement>(null);
  const [pinPosition, setPinPosition] = useState({ x: 300, y: 300 });

  useEffect(() => {
    const initialValues: Record<string, number> = {};
    Object.keys(allParameters).forEach((key) => {
      initialValues[key] = allParameters[key].default;
    });
    setSliderValues(initialValues);
  }, []);

  useEffect(() => {
    if (isFiveParameterMode && selectedParams.length !== 5) {
      setSelectedParams(["temperature", "top_p", "top_k", "frequency_penalty", "presence_penalty"]);
    } else if (!isFiveParameterMode && selectedParams.length !== 2) {
      setSelectedParams(["temperature", "top_p"]);
    }
  }, [isFiveParameterMode]);

  const handleDecagonChange = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (decagonRef.current) {
      const rect = decagonRef.current.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const x = e.clientX - rect.left - centerX;
      const y = centerY - (e.clientY - rect.top);
      const angle = (Math.atan2(y, x) + Math.PI * 2) % (Math.PI * 2);
      const distance = Math.sqrt(x * x + y * y) / (rect.width / 2);

      const paramCount = isFiveParameterMode ? 5 : 2;
      const paramIndex = Math.floor((angle / (Math.PI * 2)) * paramCount);
      const nextParamIndex = (paramIndex + 1) % paramCount;

      const param1 = selectedParams[paramIndex];
      const param2 = selectedParams[nextParamIndex];

      const value1 = mapValue(
        Math.cos(angle) * distance,
        -1,
        1,
        allParameters[param1].min,
        allParameters[param1].max
      );
      const value2 = mapValue(
        Math.sin(angle) * distance,
        -1,
        1,
        allParameters[param2].min,
        allParameters[param2].max
      );

      setSliderValues((prev) => ({
        ...prev,
        [param1]: parseFloat(value1.toFixed(2)),
        [param2]: parseFloat(value2.toFixed(2)),
      }));

      onParameterChange({
        ...sliderValues,
        [param1]: parseFloat(value1.toFixed(2)),
        [param2]: parseFloat(value2.toFixed(2)),
      });

      setPinPosition({ x: x + centerX, y: centerY - y });
    }
  };

  const handleSliderChange = (param: string, value: number) => {
    setSliderValues((prev) => ({ ...prev, [param]: value }));
    onParameterChange({ ...sliderValues, [param]: value });
  };

  const handleParamSelect = (index: number, value: string) => {
    const newSelectedParams = [...selectedParams];
    newSelectedParams[index] = value;
    setSelectedParams(newSelectedParams);
  };

  const mapValue = (value: number, inMin: number, inMax: number, outMin: number, outMax: number) => {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  };

  const renderDecagon = () => {
    const size = 600;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 20;
    const paramCount = isFiveParameterMode ? 5 : 2;
    const angles = Array.from({ length: paramCount * 2 }, (_, i) => (i * Math.PI) / paramCount);

    const points = angles.map((angle) => ({
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    }));

    const pathData = points
      .map((point, i) => (i === 0 ? `M ${point.x},${point.y}` : `L ${point.x},${point.y}`))
      .join(" ") + " Z";

    return (
      <svg
        ref={decagonRef}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        onMouseDown={handleDecagonChange}
        onMouseMove={(e) => e.buttons === 1 && handleDecagonChange(e)}
        className="cursor-crosshair"
      >
        <path d={pathData} fill="none" stroke="white" strokeWidth="2" />
        {selectedParams.map((param, index) => {
          const angle = (index * 2 * Math.PI) / paramCount;
          const labelX = centerX + (radius + 14) * Math.cos(angle);
          const labelY = centerY + (radius + 14) * Math.sin(angle);
          return (
            <text
              key={param}
              x={labelX}
              y={labelY}
              textAnchor="middle"
              fill="white"
              fontSize="16"
            >
              {allParameters[param].name}
            </text>
          );
        })}

        <circle
          cx={pinPosition.x}
          cy={pinPosition.y}
          r="5"
          fill="yellow"
        />
      </svg>
    );
  };

  return (
    <div className="w-full bg-gray-900 rounded-2xl shadow-xl p-4">
      <h2 className="text-xl font-bold text-white mb-4">Advanced Parameter Playground</h2>

      <div className="flex justify-center mb-2">
        {renderDecagon()}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        {selectedParams.map((param, index) => (
          <div key={index}>
            <Select
              value={param}
              onValueChange={(value) => handleParamSelect(index, value)}
              options={Object.keys(allParameters).map((key) => ({ value: key, label: allParameters[key].name }))}
            />
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {selectedParams.map((key) => {
          const param = allParameters[key];
          return (
            <div key={key} className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor={key} className="text-white">{param.name}</Label>
                <span className="text-sm text-gray-400">
                  {sliderValues[key]?.toFixed(2) || param.default.toFixed(2)}
                </span>
              </div>
              <Slider
                id={key}
                min={param.min}
                max={param.max}
                step={param.step}
                value={[sliderValues[key] || param.default]}
                onValueChange={(value) => handleSliderChange(key, value[0])}
              />
              <p className="text-m text-gray-400">{param.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdvancedParameterPlayground;
