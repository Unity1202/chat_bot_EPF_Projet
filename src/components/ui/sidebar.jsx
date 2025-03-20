import * as React from "react"
import { cn } from "../lib/utils"
import { ScrollArea } from "./scroll-area"

const SIDEBAR_WIDTH = "16rem"

const Sidebar = React.forwardRef(({
  side = "left",
  variant = "sidebar",
  className,
  children,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className="peer hidden text-sidebar-foreground md:block"
      data-side={side}>
      <div className="fixed inset-y-0 z-10 hidden h-svh w-[--sidebar-width] md:flex"
        style={{ "--sidebar-width": SIDEBAR_WIDTH }}>
        <div
          data-sidebar="sidebar"
          className="flex h-full w-full flex-col bg-sidebar border-r border-sidebar-border">
          {children}
        </div>
      </div>
    </div>
  )
})
Sidebar.displayName = "Sidebar"

const SidebarContent = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <ScrollArea
      ref={ref}
      data-sidebar="content"
      className={cn("h-[calc(100vh-8rem)] flex-grow", className)}
      {...props} 
    />
  )
})
SidebarContent.displayName = "SidebarContent"

const SidebarHeader = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="header"
      className={cn("flex flex-col gap-2 p-4", className)}
      {...props} />
  )
})
SidebarHeader.displayName = "SidebarHeader"

export {
  Sidebar,
  SidebarContent,
  SidebarHeader,
}
