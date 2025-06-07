import * as React from "react"
import { cn } from "../../lib/utils"

const Sidebar = React.forwardRef(({ className, children, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn(
      "relative h-screen w-full border-r border-sidebar-border bg-sidebar", 
      className
    )}
    {...props}
  >
    {children}
  </div>
))
Sidebar.displayName = "Sidebar"

const SidebarContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn(
      "h-full", 
      className
    )}
    {...props}
  >
    {children}
  </div>
))
SidebarContent.displayName = "SidebarContent"

export { Sidebar, SidebarContent }