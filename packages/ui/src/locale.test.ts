import { describe, expect, it } from "vitest";
import { isLocale, translate } from "./locale.js";

describe("isLocale", () => {
  it("accepts the supported catalogs only", () => {
    expect(isLocale("en")).toBe(true);
    expect(isLocale("de")).toBe(true);
    expect(isLocale("fr")).toBe(false);
    expect(isLocale(null)).toBe(false);
  });
});

describe("translate", () => {
  it("returns English and German catalog strings", () => {
    expect(translate("en", "nav.tracked")).toBe("Tracked");
    expect(translate("de", "nav.tracked")).toBe("Beobachtet");
  });

  it("interpolates names and locale-aware numbers", () => {
    expect(
      translate("en", "search.trackedToast", { name: "vercel/next.js" }),
    ).toBe("vercel/next.js is now tracked.");

    expect(translate("en", "repoCard.stars", { count: 1000 })).toBe("1,000 stars");
    expect(translate("de", "repoCard.stars", { count: 1000 })).toBe("1.000 Sterne");
  });

  it("picks one/other plural forms from count", () => {
    expect(translate("en", "repoCard.stars", { count: 1 })).toBe("1 star");
    expect(translate("en", "repoCard.stars", { count: 2 })).toBe("2 stars");
    expect(translate("de", "repoCard.openIssues", { count: 1 })).toBe(
      "1 offenes Issue",
    );
    expect(translate("de", "repoCard.openIssues", { count: 4 })).toBe(
      "4 offene Issues",
    );
  });

  it("falls back to the key when a message is missing", () => {
    expect(translate("en", "not.a.real.key")).toBe("not.a.real.key");
  });
});
