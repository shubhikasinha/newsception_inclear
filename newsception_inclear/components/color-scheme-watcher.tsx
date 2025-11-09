"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

export function ColorSchemeWatcher() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!resolvedTheme) return;
    document.documentElement.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  return null;
}
