import { useTranslation } from "react-i18next";
import { Button } from "../primitives/button";

export function LanguageToggle() {
  const { i18n } = useTranslation();
  const next = i18n.language === "fr" ? "en" : "fr";
  return (
    <Button
      variant="ghost"
      className="ko-lang-toggle"
      onClick={() => i18n.changeLanguage(next)}
      aria-label={next === "fr" ? "Passer en français" : "Switch to English"}
    >
      {i18n.language === "fr" ? "FR" : "EN"}
    </Button>
  );
}