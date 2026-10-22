import React from 'react';

interface ToggleSwitchProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  description?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  id,
  label,
  checked,
  onChange,
  color = '#6C5CE7',
  size = 'md',
  description,
}) => {
  return (
    <div className={`toggle-switch toggle-switch--${size}`}>
      <div className="toggle-switch__content">
        <label htmlFor={id} className="toggle-switch__label">{label}</label>
        {description && <p className="toggle-switch__description">{description}</p>}
      </div>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`toggle-switch__button ${checked ? 'toggle-switch__button--on' : ''}`}
        style={{ '--toggle-color': color } as React.CSSProperties}
      >
        <span className="toggle-switch__thumb" />
      </button>
    </div>
  );
};
