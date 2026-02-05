import { Route } from "@solidjs/router";
import { lazy } from "solid-js";
import SettingsLayout from "./layout";

const GeneralSettings = lazy(() => import("./pages/general"));
const AppearanceSettings = lazy(() => import("./pages/appearance"));
const ShortcutsSettings = lazy(() => import("./pages/shortcuts"));
const LanguageSettings = lazy(() => import("./pages/language"));
const AboutSettings = lazy(() => import("./pages/about"));

function SettingsRoutes() {
  return (
    <Route component={SettingsLayout} path="/settings">
      <Route component={GeneralSettings} path="/" />
      <Route component={AppearanceSettings} path="/appearance" />
      <Route component={ShortcutsSettings} path="/shortcuts" />
      <Route component={LanguageSettings} path="/language" />
      <Route component={AboutSettings} path="/about" />
    </Route>
  );
}

export default SettingsRoutes;
