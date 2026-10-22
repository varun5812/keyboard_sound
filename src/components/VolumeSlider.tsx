import React from 'react';

interface VolumeSliderProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  value: number;
  onChange: (value: number) => void;
  color?: string;
  disabled?: boolean;
}

export const VolumeSlider: React.FC<VolumeSliderProps> = ({
  id,
  label,
  icon,
  value,
  onChange,
  color = '#6C5CE7',
  disabled = false,
}) => {
  const percentage = Math.round(value * 100);

  return (
    <div className={`volume-slider ${disabled ? 'volume-slider--disabled' : ''}`}>
      <div className="volume-slider__header">
        <span className="volume-slider__icon">{icon}</span>
        <label htmlFor={id} className="volume-slider__label">{label}</label>
        <span className="volume-slider__value">{percentage}%</span>
      </div>
      <div className="volume-slider__track-wrapper">
        <input
          id={id}
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          disabled={disabled}
          className="volume-slider__input"
          style={{ '--slider-color': color, '--slider-fill': `${percentage}%` } as React.CSSProperties}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percentage}
          aria-label={label}
        />
        <div
          className="volume-slider__fill"
          style={{ width: `${percentage}%`, background: color }}
        />
      </div>
    </div>
  );
};
