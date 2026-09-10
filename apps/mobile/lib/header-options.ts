import { colors, darkColors } from "@bolivibes/design-tokens";

/** Shared Stack header colors, driven by the active color scheme. */
export function headerScreenOptions(scheme: "light" | "dark") {
  return scheme === "dark"
    ? { headerStyle: { backgroundColor: darkColors.bg2 }, headerTintColor: darkColors.ink }
    : { headerStyle: { backgroundColor: colors.bgOffWhite }, headerTintColor: colors.charcoalDark };
}
