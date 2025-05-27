import React, { useState } from "react";
import { Minus, Plus } from "lucide-react";
import Button from "./Button";
import Input from "./Input";

interface CounterInputProps {
  value: number;
  goalValue: number;
  onValueChange: (value: number) => void;
  disabled?: boolean;
}

const CounterInput: React.FC<CounterInputProps> = ({
  value,
  goalValue,
  onValueChange,
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState(value.toString());

  const handleIncrement = () => {
    const newValue = Math.min(value + 1, goalValue);
    onValueChange(newValue);
    setInputValue(newValue.toString());
  };

  const handleDecrement = () => {
    const newValue = Math.max(value - 1, 0);
    onValueChange(newValue);
    setInputValue(newValue.toString());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    const numValue = parseInt(newValue, 10);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= goalValue) {
      onValueChange(numValue);
    }
  };

  const handleInputBlur = () => {
    // Reset to current value if input is invalid
    setInputValue(value.toString());
  };
  return (
    <div className="flex items-center justify-center space-x-2">
      <Button
        onClick={handleDecrement}
        variant="ghost"
        size="sm"
        className="w-8 h-8 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
        disabled={disabled || value <= 0}
      >
        <Minus className="w-4 h-4" />
      </Button>

      <div className="flex items-center space-x-1">
        <Input
          type="number"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          min={0}
          max={goalValue}
          className="w-16 text-center text-sm"
          disabled={disabled}
        />
        <span className="text-sm text-gray-500 dark:text-gray-400">
          / {goalValue}
        </span>
      </div>

      <Button
        onClick={handleIncrement}
        variant="ghost"
        size="sm"
        className="w-8 h-8 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
        disabled={disabled || value >= goalValue}
      >
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default CounterInput;
