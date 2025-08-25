import React from "react";

interface SliderProps {
  value: number;
  color: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const Slider: React.FC<SliderProps> = ({ value, color, onChange }) => {
  return (
    <div className="relative flex-grow h-2 rounded-full overflow-hidden">
      {/* Progress bar */}
      <div
        className={`absolute inset-0 bg-gradient-to-r ${color}`}
        style={{ width: `${value}%` }}
      ></div>

      {/* Range input */}
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={onChange}
        className="w-full h-full absolute appearance-none bg-transparent cursor-pointer"
        style={{
          touchAction: "none", // 🚫 prevents page from scrolling on drag (mobile fix)
          WebkitAppearance: "none", // for Safari
          background: "transparent",
        }}
      />
    </div>
  );
};

export default Slider;
