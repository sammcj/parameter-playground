import React, { useState, useRef, useEffect } from "react";
import { Select } from "./ui/select";
import { Label } from "./ui/label";
import { Slider, Switch } from "./ui/slider-switch";

interface Parameter {
  name: string;
  min: number;
  max: number;
  step: number;
  default: number;
  description: string;
}

const parameters: Record<string, Parameter> = {
  temperature: { name: "Temperature", min: 0, max: 2, step: 0.01, default: 0.7, description: "Controls randomness: Lower values make the output more focused and deterministic, higher values make it more random and creative." },
  top_p: { name: "Top P", min: 0, max: 1, step: 0.01, default: 0.9, description: "Nucleus sampling: Only consider the top P probability mass of tokens when generating." },
  top_k: { name: "Top K", min: 1, max: 100, step: 1, default: 50, description: "Limits the number of token choices considered at each step to the top K options." },
  frequency_penalty: { name: "Frequency Penalty", min: -2, max: 2, step: 0.1, default: 0, description: "Reduces repetition by lowering the probability of tokens that have already appeared in the text." },
  presence_penalty: { name: "Presence Penalty", min: -2, max: 2, step: 0.1, default: 0, description: "Encourages the model to talk about new topics by increasing the probability of tokens that haven't appeared yet." },
  repetition_penalty: { name: "Repetition Penalty", min: 1, max: 2, step: 0.01, default: 1, description: "Penalizes repetitions: Values above 1 decrease the likelihood of repeated tokens." },
  length_penalty: { name: "Length Penalty", min: -2, max: 2, step: 0.1, default: 0, description: "Encourages shorter (negative values) or longer (positive values) outputs." },
  diversity_penalty: { name: "Diversity Penalty", min: 0, max: 2, step: 0.1, default: 0, description: "Encourages the model to generate more diverse outputs." },
};


const ToneChangerGrid = ({ onParameterChange }) => {
  const [selectedParams, setSelectedParams] = useState({
    x: "temperature",
    y: "top_p",
  });
  const [sliderValues, setSliderValues] = useState({});
  const [advancedMode, setAdvancedMode] = useState(true);
  const gridRef = useRef(null);
  const [pinPosition, setPinPosition] = useState({ x: 50, y: 50 });
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const initialValues = {};
    Object.keys(parameters).forEach((key) => {
      initialValues[key] = parameters[key].default;
    });
    setSliderValues(initialValues);
  }, []);

  const handleGridChange = (e) => {
    if (gridRef.current) {
      const rect = gridRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1 - (e.clientY - rect.top) / rect.height;

      const xValue = mapValue(x, 0, 1, parameters[selectedParams.x].min, parameters[selectedParams.x].max);
      const yValue = mapValue(y, 0, 1, parameters[selectedParams.y].min, parameters[selectedParams.y].max);

      setSliderValues((prev) => ({
        ...prev,
        [selectedParams.x]: parseFloat(xValue.toFixed(2)),
        [selectedParams.y]: parseFloat(yValue.toFixed(2)),
      }));

      onParameterChange({
        ...sliderValues,
        [selectedParams.x]: parseFloat(xValue.toFixed(2)),
        [selectedParams.y]: parseFloat(yValue.toFixed(2)),
      });

      setPinPosition({ x: x * 100, y: (1 - y) * 100 });
      setPopupPosition({ x: e.clientX, y: e.clientY });
      setShowPopup(true);
    }
  };

  const handleSliderChange = (param, value) => {
    setSliderValues((prev) => ({ ...prev, [param]: value }));
    onParameterChange({ ...sliderValues, [param]: value });
  };

  const mapValue = (value, inMin, inMax, outMin, outMax) => {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  };

  return (
    <div className="w-full bg-gray-900 rounded-2xl shadow-xl p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Parameter Playground</h2>
        <div className="flex items-center space-x-2">
          <Switch
            id="advanced-mode"
            checked={advancedMode}
            onCheckedChange={setAdvancedMode}
          />
          <Label htmlFor="advanced-mode" className="text-white">Advanced Mode</Label>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <Label htmlFor="x-param" className="text-white">X-axis Parameter</Label>
          <Select
            value={selectedParams.x}
            onValueChange={(value) => setSelectedParams((prev) => ({ ...prev, x: value }))}
            options={Object.keys(parameters).map((key) => ({ value: key, label: parameters[key].name }))}
          />
        </div>
        <div>
          <Label htmlFor="y-param" className="text-white">Y-axis Parameter</Label>
          <Select
            value={selectedParams.y}
            onValueChange={(value) => setSelectedParams((prev) => ({ ...prev, y: value }))}
            options={Object.keys(parameters).map((key) => ({ value: key, label: parameters[key].name }))}
          />
        </div>
      </div>

      <div
        ref={gridRef}
        className="w-1/2 mx-auto aspect-square bg-gradient-to-br from-purple-900 to-indigo-900 rounded-xl cursor-crosshair mb-6 relative select-none"
        onMouseDown={handleGridChange}
        onMouseMove={(e) => e.buttons === 1 && handleGridChange(e)}
        onMouseLeave={() => setShowPopup(false)}
      >
        {/* X-axis labels (left and right) */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 -translate-x-1/2 transform -rotate-90 text-s font-medium text-white pointer-events-none">
          {parameters[selectedParams.x].name}: {parameters[selectedParams.x].min}
        </div>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 translate-x-1/2 transform -rotate-90 text-s font-medium text-white pointer-events-none">
          {parameters[selectedParams.x].name}: {parameters[selectedParams.x].max}
        </div>

        {/* Y-axis labels (top and bottom) */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 -translate-y-1/2 text-s font-medium text-white pointer-events-none">
          {parameters[selectedParams.y].name}: {parameters[selectedParams.y].max}
        </div>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 translate-y-1/2 text-s font-medium text-white pointer-events-none">
          {parameters[selectedParams.y].name}: {parameters[selectedParams.y].min}
        </div>

        {/* Pin */}
        <div
          className="absolute w-4 h-4 bg-yellow-400 rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2 border-2 border-yellow-600 pointer-events-none"
          style={{ left: `${pinPosition.x}%`, top: `${pinPosition.y}%` }}
        ></div>

        {/* Popup */}
        {showPopup && (
          <div
            className="absolute bg-black text-white p-2 rounded text-xs pointer-events-none"
            style={{ left: popupPosition.x - gridRef.current.offsetLeft, top: popupPosition.y - gridRef.current.offsetTop }}
          >
            {selectedParams.x}: {sliderValues[selectedParams.x].toFixed(2)}
            <br />
            {selectedParams.y}: {sliderValues[selectedParams.y].toFixed(2)}
          </div>
        )}
      </div>

      {advancedMode && (
        <div className="space-y-4">
          {Object.entries(parameters).map(([key, param]) => (
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
              <p className="text-sm text-gray-400">{param.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ToneChangerGrid;
