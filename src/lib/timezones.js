export const DEFAULT_TIMEZONE = "Asia/Dhaka"

export function getWorldTimezones() {
  try {
    if (typeof Intl !== "undefined" && typeof Intl.supportedValuesOf === "function") {
      return Intl.supportedValuesOf("timeZone").sort()
    }
  } catch {
    // fall through
  }
  return [DEFAULT_TIMEZONE, "UTC"].sort()
}
