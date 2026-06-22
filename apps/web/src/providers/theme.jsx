import { createContext, useContext, useEffect, useMemo, useState } from "react";
const ThemeContext = createContext({
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => undefined,
  themePreference: "system",
  setThemePreference: () => undefined,
  toggleTheme: () => undefined,
});
const systemTheme = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
const resolve = (preference) =>
  preference === "system" ? systemTheme() : preference;
export function ThemeProvider({ children }) {
  const [themePreference, setThemePreference] = useState(
    () => localStorage.getItem("splitmate-theme") || "system",
  );
  const [resolvedTheme, setResolvedTheme] = useState(() =>
    resolve(localStorage.getItem("splitmate-theme") || "system"),
  );
  useEffect(() => {
    const apply = () => {
      const next = resolve(themePreference);
      setResolvedTheme(next);
      document.documentElement.dataset.theme = next;
      document.documentElement.classList.toggle("dark", next === "dark");
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute("content", next === "dark" ? "#0f121b" : "#f6f7fb");
      localStorage.setItem("splitmate-theme", themePreference);
    };
    apply();
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const updateSystem = () => {
      if (themePreference === "system") apply();
    };
    media.addEventListener("change", updateSystem);
    return () => media.removeEventListener("change", updateSystem);
  }, [themePreference]);
  const value = useMemo(
    () => ({
      theme: themePreference,
      resolvedTheme,
      setTheme: setThemePreference,
      themePreference,
      setThemePreference,
      toggleTheme: () =>
        setThemePreference((current) =>
          resolve(current) === "dark" ? "light" : "dark",
        ),
    }),
    [themePreference, resolvedTheme],
  );
  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
export const useTheme = () => useContext(ThemeContext);
