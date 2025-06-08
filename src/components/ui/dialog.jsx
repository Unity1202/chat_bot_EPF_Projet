"use client"

import * as React from "react"
import { X } from "lucide-react"

import { cn } from "../../lib/utils"

// Custom Dialog implementation without Radix UI dependency
const Dialog = ({ children, open, onOpenChange }) => {
  React.useEffect(() => {
    if (open) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [open]);

  // Approche plus simple : on divise les enfants en deux groupes
  const childArray = React.Children.toArray(children);
  if (childArray.length === 0) return null;

  // Détecter si le premier enfant est un DialogTrigger (mode déclencheur)
  const firstChild = childArray[0];
  const isTrigger = React.isValidElement(firstChild) && firstChild.type && firstChild.type.displayName === "DialogTrigger";

  if (isTrigger) {
    // Mode déclencheur : premier enfant est le trigger, le reste le contenu
    const [trigger, ...content] = childArray;
    const renderedTrigger = React.isValidElement(trigger)
      ? React.cloneElement(trigger, { onOpenChange })
      : trigger;

    return (
      <>
        {renderedTrigger}
        {open && content.map((child, i) =>
          React.isValidElement(child)
            ? React.cloneElement(child, { onOpenChange })
            : child
        )}
      </>
    );
  }

  // Mode contrôlé : aucun trigger, on affiche tout le contenu uniquement si open === true
  if (!open) return null;
  return (
    <>
      {childArray.map((child, i) =>
        React.isValidElement(child)
          ? React.cloneElement(child, { onOpenChange })
          : child
      )}
    </>
  );
};

const DialogTrigger = ({ children, onClick, onOpenChange, asChild }) => {
  const handleClick = (e) => {
    // Ouvrir la boîte de dialogue quand on clique
    if (onOpenChange) {
      onOpenChange(true);
    }
    
    // Appeler également onClick s'il existe
    if (onClick) {
      onClick(e);
    }
  };
  
  // Si asChild est true, préserver les propriétés de l'enfant
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: handleClick
    });
  }
  
  // Sinon, créer un bouton standard
  return (
    <button 
      onClick={handleClick}
      className="inline-flex items-center justify-center"
    >
      {children}
    </button>
  );
};

const DialogOverlay = React.forwardRef(({ className, onClick, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "fixed inset-0 z-[9998] bg-black/80",
      className
    )}
    onClick={onClick}
    {...props} 
  />
))
DialogOverlay.displayName = "DialogOverlay"

const DialogContent = React.forwardRef(({ className, children, onOpenChange, ...props }, ref) => {
  const handleOverlayClick = (e) => {
    if (onOpenChange) {
      onOpenChange(false);
    }
  };
  
  const handleContentClick = (e) => {
    e.stopPropagation();
  };
  
  return (
    <>
      <DialogOverlay onClick={handleOverlayClick} />
      <div
        ref={ref}
        onClick={handleContentClick}
        className={cn(
          "fixed left-[50%] top-[50%] z-[9999] grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg sm:rounded-lg",
          className
        )}
        {...props}
      >
        {children}
        <button
          onClick={() => onOpenChange && onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </>
  );
});
DialogContent.displayName = "DialogContent";

const DialogHeader = ({
  className,
  ...props
}) => (
  <div
    className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}
    {...props} 
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}) => (
  <div
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
    {...props} 
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props} 
  />
));
DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props} 
  />
));
DialogDescription.displayName = "DialogDescription";

export {
  Dialog,
  DialogOverlay,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
