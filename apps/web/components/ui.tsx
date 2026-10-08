"use client";

import Link from "next/link";
import {
  useId,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { PixelIcon, type IconName } from "./icons";

export function Button({
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" className={`button ${className}`} {...props} />;
}

export function MSkillDesktopIcon({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: IconName;
  title: string;
  description: string;
}) {
  return (
    <Link className="desktop-icon" href={href}>
      <span className={`icon-tile tile-${icon}`}>
        <PixelIcon name={icon} />
      </span>
      <span>
        <strong>{title}</strong>
        <small>{description}</small>
      </span>
      <span aria-hidden="true">↗</span>
    </Link>
  );
}

export function MSkillTitleBar({
  title,
  action,
  badge = "PREVIEW",
}: {
  title: string;
  action?: ReactNode;
  badge?: string;
}) {
  return (
    <div className="window-titlebar">
      <span className="window-title">
        <PixelIcon name="universe" />
        {title}
      </span>
      <div className="window-actions">
        <span className="preview-label">{badge}</span>
        {action}
      </div>
    </div>
  );
}

export function MSkillWindow({
  title,
  children,
  collapsible = false,
}: {
  title: string;
  children: ReactNode;
  collapsible?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const bodyId = useId();
  return (
    <section className="mskill-window" aria-label={title}>
      <MSkillTitleBar
        title={title}
        action={
          collapsible ? (
            <button
              className="window-control"
              aria-label={`${collapsed ? "Show" : "Hide"} universe preview`}
              aria-expanded={!collapsed}
              aria-controls={bodyId}
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? "+" : "−"}
            </button>
          ) : undefined
        }
      />
      <div id={bodyId} hidden={collapsed}>
        {children}
      </div>
    </section>
  );
}
