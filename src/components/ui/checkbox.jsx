"use client"

import * as React from "react"
import { Check } from "lucide-react"

import { cn } from "../../lib/utils"

// Creating a simplified checkbox component since we're having issues with Radix UI
const Checkbox = React.forwardRef(({ className, checked, onCheckedChange, disabled, ...props }, ref) => {
  const [isChecked, setIsChecked] = React.useState(checked || false);
  
  React.useEffect(() => {
    setIsChecked(checked || false);
  }, [checked]);
  
  const handleChange = (e) => {
    const newValue = e.target.checked;
    setIsChecked(newValue);
    if (onCheckedChange) {
      onCheckedChange(newValue);
    }
  };
  
  return (
    <div className="relative flex items-center">
      <input
        type="checkbox"
        ref={ref}
        checked={isChecked}
        onChange={handleChange}
        disabled={disabled}
        className={cn(
          "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background appearance-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 checked:bg-primary",
          className
        )}
        {...props}
      />
      {isChecked && (
        <Check className="h-3 w-3 text-white absolute left-0.5 top-0.5 pointer-events-none" />
      )}
    </div>
  );
});

Checkbox.displayName = "Checkbox";

export { Checkbox }