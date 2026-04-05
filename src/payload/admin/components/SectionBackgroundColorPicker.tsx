'use client';

import { useMemo } from 'react';
import type { TextFieldClientComponent } from 'payload';
import { Button, useField } from '@payloadcms/ui';

const HEX_COLOR_PATTERN = /^#(?:[0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;
const DEFAULT_PICKER_COLOR = '#F8F9FA';

function normalizeHexForPicker(value: string): string {
  const trimmed = value.trim();
  if (!HEX_COLOR_PATTERN.test(trimmed)) return DEFAULT_PICKER_COLOR;

  const hex = trimmed.slice(1);
  if (hex.length === 3 || hex.length === 4) {
    return `#${hex
      .slice(0, 3)
      .split('')
      .map((char) => `${char}${char}`)
      .join('')
      .toUpperCase()}`;
  }

  if (hex.length === 8) {
    return `#${hex.slice(0, 6).toUpperCase()}`;
  }

  return `#${hex.toUpperCase()}`;
}

const SectionBackgroundColorPicker: TextFieldClientComponent = (props) => {
  const { field, path: pathFromProps, readOnly } = props;
  const fieldPath = pathFromProps || field.name;

  const { setValue, value } = useField<string>({
    potentiallyStalePath: fieldPath,
  });

  const currentValue = typeof value === 'string' ? value : '';
  const pickerValue = useMemo(() => normalizeHexForPicker(currentValue), [currentValue]);

  const updateValue = (nextValue: string): void => {
    setValue(nextValue);
  };

  return (
    <div className="section-background-color-picker">
      <span className="section-background-color-picker__label">Color Picker</span>
      <div className="section-background-color-picker__controls">
        <input
          aria-label="Pick section background color"
          className="section-background-color-picker__input"
          disabled={Boolean(readOnly)}
          onChange={(event) => updateValue(event.target.value.toUpperCase())}
          type="color"
          value={pickerValue}
        />
        <code className="section-background-color-picker__value">{pickerValue}</code>
        <Button
          buttonStyle="secondary"
          disabled={Boolean(readOnly) || !currentValue.trim()}
          onClick={() => updateValue('')}
          size="small"
          type="button"
        >
          Clear
        </Button>
      </div>
    </div>
  );
};

export default SectionBackgroundColorPicker;
