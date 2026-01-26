"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { ToolUIPart } from "ai";
import { ChevronDownIcon, Code } from "lucide-react";
import type { ComponentProps } from "react";
import { getStatusBadge } from "@/components/ai-elements/tool";

export type SandboxRootProps = ComponentProps<typeof Collapsible>;

export const Sandbox = ({ className, ...props }: SandboxRootProps) => (
  <Collapsible
    className={cn("sandbox-root", className)}
    defaultOpen
    {...props}
  />
);

/*
  All components below were simplified to rely on global CSS / theme classes.
  The container (Sandbox) was left unchanged as requested.
*/

export interface SandboxHeaderProps {
  title?: string;
  state?: ToolUIPart["state"];
  className?: string;
}

export const SandboxHeader = ({
  className,
  title,
  state,
  ...props
}: SandboxHeaderProps) => (
  <CollapsibleTrigger className={cn("sandbox-header", className)} {...props}>
    <div className="sandbox-header-left">
      <Code className="sandbox-icon" />
      <span className="sandbox-title">{title}</span>
      <span className="sandbox-badge">{getStatusBadge(state ?? "output-available")}</span>
    </div>
    <ChevronDownIcon className="sandbox-icon chevron" />
  </CollapsibleTrigger>
);

export type SandboxContentProps = ComponentProps<typeof CollapsibleContent>;

export const SandboxContent = ({
  className,
  ...props
}: SandboxContentProps) => (
  <CollapsibleContent className={cn("sandbox-content", className)} {...props} />
);

export type SandboxTabsProps = ComponentProps<typeof Tabs>;

export const SandboxTabs = ({ className, ...props }: SandboxTabsProps) => (
  <Tabs className={cn("sandbox-tabs", className)} {...props} />
);

export type SandboxTabsBarProps = ComponentProps<"div">;

export const SandboxTabsBar = ({
  className,
  ...props
}: SandboxTabsBarProps) => (
  <div className={cn("sandbox-tabs-bar", className)} {...props} />
);

export type SandboxTabsListProps = ComponentProps<typeof TabsList>;

export const SandboxTabsList = ({
  className,
  ...props
}: SandboxTabsListProps) => (
  <TabsList className={cn("sandbox-tabs-list", className)} {...props} />
);

export type SandboxTabsTriggerProps = ComponentProps<typeof TabsTrigger>;

export const SandboxTabsTrigger = ({
  className,
  ...props
}: SandboxTabsTriggerProps) => (
  <TabsTrigger className={cn("sandbox-tabs-trigger", className)} {...props} />
);

export type SandboxTabContentProps = ComponentProps<typeof TabsContent>;

export const SandboxTabContent = ({
  className,
  ...props
}: SandboxTabContentProps) => (
  <TabsContent className={cn("sandbox-tab-content", className)} {...props} />
);
