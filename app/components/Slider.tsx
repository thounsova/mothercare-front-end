import React from 'react';

interface SliderProps {
  value: number;
  color: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const Slider: React.FC<SliderProps> = ({ value, color, onChange }) => {
  return (
    <div className="relative flex-grow h-2 rounded-full overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-r ${color}`} style={{ width: `${value}%` }}></div>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={onChange}
        className="w-full h-full absolute appearance-none bg-transparent cursor-pointer"
        style={{
          '--track-color': 'transparent',
          '--thumb-color': 'transparent',
        } as React.CSSProperties}
      />
    </div>
  );
};

export default Slider;