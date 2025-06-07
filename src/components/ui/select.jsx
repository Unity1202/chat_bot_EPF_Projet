"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "../../lib/utils"

// Custom Select implementation without Radix UI dependency
const Select = ({ children, value, onValueChange, disabled }) => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  // Handle clicking outside to close dropdown
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);

  // Find the selected item label
  const selectedItem = React.Children.toArray(children)
    .find(child => child.props.value === value);

  return (
    <div ref={ref} className="relative">
      {React.cloneElement(children[0], { 
        onClick: () => !disabled && setOpen(!open),
        open,
        value,
        selectedItem: selectedItem?.props?.children
      })}
      {open && !disabled && (
        <div className="absolute z-50 w-full mt-1">
          {React.cloneElement(children[1], { 
            onValueChange,
            onClose: () => setOpen(false)
          })}
        </div>
      )}
    </div>
  );
};

const SelectTrigger = React.forwardRef(({ className, children, open, disabled, selectedItem, ...props }, ref) => (
  <button
    type="button"
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    disabled={disabled}
    {...props}
  >
    {selectedItem || children}
    <ChevronDown className={cn(
      "h-4 w-4 opacity-50 transition-transform",
      open && "transform rotate-180"
    )} />
  </button>
));
SelectTrigger.displayName = "SelectTrigger";

const SelectValue = ({ placeholder }) => {
  return <span className="text-muted-foreground">{placeholder}</span>;
};

const SelectContent = ({ children, className, onClose, onValueChange }) => (
  <div
    className={cn(
      "rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-80",
      className
    )}
  >
    {React.Children.map(children, child => 
      React.cloneElement(child, { 
        onValueChange,
        onClose 
      })
    )}
  </div>
);
SelectContent.displayName = "SelectContent";

const SelectItem = React.forwardRef(({ className, children, value, onValueChange, onClose, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-accent hover:text-accent-foreground",
      className
    )}
    onClick={() => {
      if (onValueChange) onValueChange(value);
      if (onClose) onClose();
    }}
    {...props}
  >
    {children}
  </div>
));
SelectItem.displayName = "SelectItem";

// These components aren't used in our current implementation but added for API compatibility
const SelectGroup = ({ children }) => <div>{children}</div>;
const SelectLabel = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("py-1.5 pl-2 pr-2 text-sm font-semibold", className)} {...props} />
));
const SelectSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />
));

SelectLabel.displayName = "SelectLabel";
SelectSeparator.displayName = "SelectSeparator";

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
}