"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import { navItems } from "./menuData";
import "./sidebar-scrollbar.css";
import { auth, useRoleStore } from "@/store";
import { updateMenuVisibility } from "@/utils";
import Cookies from "js-cookie";
import { CaretIcon, CloseIcon, HamburgerIcon, pickIcon } from "./icon";

export default function Sidebar({ className = "" }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);
  const { userData } = auth();
  const roleId = userData?.data?.roleId;
  const { data, fetchData } = useRoleStore();

  useEffect(() => {
    if (roleId) {
      (async () => {
        await fetchData(roleId);
      })();
    }
  }, [roleId]);

  const formattedData = data?.filter((r) => r.buttons !== undefined);
  const renderMenuBasedonAccess = updateMenuVisibility(navItems, formattedData);

  // Auto-expand groups that contain the current route
  const initialExpanded = useMemo(() => {
    const keys = new Set();
    const walk = (nodes, level) => {
      nodes?.forEach((n, idx) => {
        const key = (n.href || n.name || `group-${idx}`) + "|" + level;
        const kids = n.submenu || n.children;
        const containsActive =
          (!!n.href && isPathActive(pathname, n.href)) ||
          (kids && hasActiveInTree(kids, pathname));

        if (containsActive && kids) {
          keys.add(key);
          walk(kids, level + 1);
        } else if (kids) {
          walk(kids, level + 1);
        }
      });
    };
    walk(navItems, 0);
    return keys;
  }, [pathname]);

  const [expanded, setExpanded] = useState(initialExpanded);
  useEffect(() => setExpanded(initialExpanded), [initialExpanded]);

  const toggleExpand = (key) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const asideCls = clsx(
    "h-screen shrink-0 flex flex-col",
    "bg-gradient-to-b from-blue-600 via-indigo-700 to-blue-900",
    "text-white transition-all duration-300 ease-in-out will-change-[width]",
    className,
    open ? "w-52" : "w-14", // slim
  );

  // Glassmorphism inner panel
  const glassCls =
    "m-1 flex min-h-0 flex-1 flex-col rounded-lg bg-white/10 backdrop-blur-md ring-1 ring-white/20";

  // if (pathname === "/login") return <></>;

  return (
    <aside className={asideCls}>
      <div className={glassCls}>
        {/* Header */}
        <div className="flex items-center justify-between px-2 py-2 border-b border-white/10">
          {open && (
            <h2 className="font-semibold text-[11px] tracking-wide">Menu</h2>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
            className="flex items-center justify-center w-7 h-7 rounded-md bg-white/10 hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/30"
          >
            {open ? <CloseIcon /> : <HamburgerIcon />}
          </button>
        </div>

        {/* Nav */}
        <nav className="mt-1 flex-1 overflow-y-auto sidebar-scroll">
          <ul className="space-y-[2px] px-1 pb-2">
            {Array.isArray(renderMenuBasedonAccess) &&
              renderMenuBasedonAccess
                ?.filter((i) => i?.isShow)
                .map((node, i) => (
                  <MenuNode
                    key={node.href || node.name || i}
                    node={node}
                    level={0}
                    openSidebar={open}
                    expanded={expanded}
                    onToggle={toggleExpand}
                    pathname={pathname}
                  />
                ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}

/* ---------------- Recursive Node ---------------- */
function MenuNode({ node, level, openSidebar, expanded, onToggle, pathname }) {
  const hasChildren = node.submenu?.length > 0 || node.children?.length > 0;
  const key = (node.href || node.name) + "|" + level;
  const isOpen = expanded.has(key);

  const activeSelf = node.href ? isPathActive(pathname, node.href) : false;
  const activeDesc = hasChildren
    ? hasActiveInTree(node.submenu || node.children, pathname)
    : false;

  // Different highlight per level (and ring)
  const levelActiveBg =
    level === 0
      ? "bg-white/15 ring-1 ring-white/20"
      : level === 1
        ? "bg-white/10 ring-1 ring-white/10"
        : "bg-white/5 ring-1 ring-white/5";

  // Shared base item styles — slim, full width hover
  const baseItemCls = clsx(
    "relative flex items-center gap-2 rounded-md px-2 py-1.5 text-[12px] leading-5",
    "w-full cursor-pointer transition-colors hover:bg-white/20",
  );

  // Label collapse behavior
  const label = (
    <span
      className={clsx(
        "transition-[max-width,opacity] duration-200 whitespace-nowrap",
        openSidebar
          ? "opacity-100 max-w-[160px]"
          : "opacity-0 max-w-0 overflow-hidden",
      )}
    >
      {node.name}
    </span>
  );

  // Icons only for parents (level === 0)
  const iconEl =
    level === 0 && node.icon ? (
      <span className="flex items-center justify-center w-5 h-5 shrink-0">
        {pickIcon(node.icon)}
      </span>
    ) : null;

  const handleClick = (roleId, menuName) => {
    if (!roleId || !menuName) return;

    sessionStorage.setItem("roleId", roleId);
    sessionStorage.setItem("menuName", menuName);
  };

  if (!hasChildren) {
    return (
      <li>
        <div
          onClick={() => handleClick(node.roleId, node?.name)}
          className="w-full"
        >
          <Link
            href={node.href || "#"}
            title={!openSidebar ? node.name : ""}
            className={clsx(
              baseItemCls,
              activeSelf && levelActiveBg,
              openSidebar ? "justify-start" : "justify-center",
            )}
          >
            {iconEl}
            {label}
          </Link>
        </div>
      </li>
    );
  }

  return (
    <li>
      <button
        onClick={() => onToggle(key)}
        title={!openSidebar ? node.name : ""}
        className={clsx(
          baseItemCls,
          (activeSelf || activeDesc) && levelActiveBg,
          openSidebar ? "justify-start" : "justify-center",
        )}
        aria-expanded={isOpen}
        aria-controls={`menu-${key}`}
      >
        {iconEl}
        {label}
        {openSidebar && (
          <span className="ml-auto w-4 h-4 flex items-center justify-center">
            <CaretIcon rotated={isOpen} />
          </span>
        )}
      </button>

      {/* Dynamic-height collapsible so ALL children show */}
      <Collapsible id={`menu-${key}`} isOpen={isOpen}>
        <ul className="ml-3 mt-1 space-y-[2px] border-l border-white/10 pl-2">
          {(node?.submenu || node?.children || [])
            .filter((i) => i.isShow)
            ?.sort((a, b) => (a.name > b.name ? 1 : -1))
            ?.map((child, i) => (
              <MenuNode
                key={child.href || child.name || i}
                node={child}
                level={level + 1}
                openSidebar={openSidebar}
                expanded={expanded}
                onToggle={onToggle}
                pathname={pathname}
              />
            ))}
        </ul>
      </Collapsible>
    </li>
  );
}

/* ---------------- Collapsible (measured height) ---------------- */
function Collapsible({ isOpen, id, children }) {
  const innerRef = useRef(null);
  const [height, setHeight] = useState(0);

  // Measure on mount + when content changes + when opened
  useEffect(() => {
    if (!innerRef.current) return;

    const el = innerRef.current;
    const ro = new ResizeObserver(() => {
      setHeight(el.scrollHeight);
    });
    ro.observe(el);

    // initial measure (in case ResizeObserver hasn't fired yet)
    setHeight(el.scrollHeight);

    return () => ro.disconnect();
  }, [children, isOpen]);

  return (
    <div
      id={id}
      style={{ maxHeight: isOpen ? height : 0 }}
      className={clsx(
        "overflow-hidden transition-[max-height,opacity,transform] duration-300",
        isOpen ? "opacity-100 translate-y-0" : "opacity-60 -translate-y-0.5",
      )}
    >
      <div ref={innerRef}>{children}</div>
    </div>
  );
}

/* ---------------- Helpers ---------------- */
function isPathActive(pathname, href) {
  if (!pathname || !href) return false;
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}
function hasActiveInTree(nodes, pathname) {
  return nodes?.some(
    (n) =>
      (n.href && isPathActive(pathname, n.href)) ||
      (n.submenu && hasActiveInTree(n.submenu, pathname)) ||
      (n.children && hasActiveInTree(n.children, pathname)),
  );
}
