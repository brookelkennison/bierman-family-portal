"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { logout } from "@/app/actions/auth";
import { Icon } from "@/components/ui/Icon";

type ParentMenuProps = { fullName: string; initials: string };

/** Initials chip that opens a small menu with Help and Log out. */
export function ParentMenu({ fullName, initials }: ParentMenuProps) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close on Esc (focus back to the chip) or a click outside.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`Account menu for ${fullName}`}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2.5 rounded-full p-0.5 text-left transition-colors hover:bg-page lg:pr-3"
      >
        <span
          aria-hidden="true"
          className="flex size-9.5 items-center justify-center rounded-full bg-sun-tint text-label font-bold text-sun-strong lg:size-10.5 lg:text-body"
        >
          {initials}
        </span>
        <span aria-hidden="true" className="hidden flex-col lg:flex">
          <span className="text-label text-ink">{fullName}</span>
          <span className="text-small text-muted">Parent</span>
        </span>
      </button>

      {open && (
        <div
          id={menuId}
          className="absolute top-full right-0 z-30 mt-2 flex w-56 flex-col gap-1 rounded-row border border-line bg-white p-2 shadow-tab"
        >
          <p className="px-3 py-2 text-small text-muted">
            Signed in as{" "}
            <span className="font-semibold text-ink">{fullName}</span>
          </p>
          <Link
            href="/help"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-mark px-3 py-2 text-label font-medium text-ink hover:bg-page lg:hidden"
          >
            <Icon name="help" />
            Help
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-mark px-3 py-2 text-left text-label font-medium text-ink hover:bg-page"
            >
              <Icon name="logout" />
              Log out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
