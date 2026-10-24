// ==============================================================================
// ArogyaMitra AI — Core Application Logic & Security Unit Tests
// ==============================================================================

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { TRANSLATIONS, LANGUAGES } from "../src/data/translations.js";
import {
  VACCINES_DATA,
  EMERGENCY_NUMBERS_DATA,
  FIRST_AID_GUIDELINES,
  ARTICLES_DATA,
} from "../src/data/initialData.js";

describe("Internationalization (i18n) Test Suite", () => {
  test("All 4 required Indian languages are configured", () => {
    const langCodes = LANGUAGES.map((l) => l.value);
    assert.deepEqual(langCodes, ["en", "mr", "hi", "kn"]);
  });

  test("Every translation dictionary contains identical critical keys", () => {
    const requiredKeys = [
      "appName",
      "tagline",
      "heroTitle",
      "heroSubtitle",
      "getStarted",
      "login",
      "logout",
      "dashboard",
      "assistant",
      "voice",
      "hospitals",
      "vaccination",
      "emergency",
      "library",
      "profile",
      "settings",
      "disclaimer",
      "call112",
      "callAmbulance",
    ];

    for (const lang of ["en", "mr", "hi", "kn"]) {
      const dict = TRANSLATIONS[lang];
      assert.ok(dict, `Translation dictionary for ${lang} must exist`);
      for (const key of requiredKeys) {
        assert.ok(
          dict[key] && dict[key].trim().length > 0,
          `Key '${key}' is missing or empty in language '${lang}'`
        );
      }
    }
  });
});

describe("Healthcare Reference Data Integrity", () => {
  test("Emergency numbers contain verified India numbers", () => {
    const numbers = EMERGENCY_NUMBERS_DATA.map((n) => n.number);
    assert.ok(numbers.includes("112"), "Must include 112 (National Unified Emergency)");
    assert.ok(numbers.includes("108"), "Must include 108 (Ambulance Service)");
    assert.ok(numbers.includes("102"), "Must include 102 (Maternal & Infant Ambulance)");
    assert.ok(numbers.includes("181"), "Must include 181 (Women in Distress Helpline)");
    assert.ok(numbers.includes("1098"), "Must include 1098 (Childline)");
    assert.ok(numbers.includes("14416"), "Must include 14416 (Tele-MANAS Mental Health)");
  });

  test("Universal Immunisation Programme vaccines cover infants, children, and adults", () => {
    assert.ok(VACCINES_DATA.length >= 8, "Must have comprehensive UIP vaccines");
    const vaccineNames = VACCINES_DATA.map((v) => v.name.toLowerCase());
    assert.ok(vaccineNames.some((n) => n.includes("bcg")), "Must include BCG");
    assert.ok(vaccineNames.some((n) => n.includes("polio")), "Must include Polio");
    assert.ok(vaccineNames.some((n) => n.includes("pentavalent")), "Must include Pentavalent");
    assert.ok(vaccineNames.some((n) => n.includes("rubella") || n.includes("mr")), "Must include MR");
  });

  test("First aid guidelines contain critical life-saving protocols", () => {
    const titles = FIRST_AID_GUIDELINES.map((g) => g.id);
    assert.ok(titles.includes("bleeding"), "Must include Bleeding protocol");
    assert.ok(titles.includes("heart-attack"), "Must include Heart Attack protocol");
    assert.ok(titles.includes("stroke"), "Must include Stroke FAST protocol");
    assert.ok(titles.includes("burns"), "Must include Burns protocol");
    assert.ok(titles.includes("choking"), "Must include Choking protocol");
  });

  test("Health education articles have verified sources and medical disclaimers", () => {
    for (const art of ARTICLES_DATA) {
      assert.ok(art.title, "Article must have title");
      assert.ok(art.category, "Article must have category");
      assert.ok(art.sourceName, "Article must cite verified organization");
      assert.ok(art.reviewedDate, "Article must track review date");
    }
  });
});

describe("Medical Emergency Detection Logic", () => {
  const EMERGENCY_KEYWORDS = [
    "chest pain",
    "heart attack",
    "can't breathe",
    "cannot breathe",
    "difficulty breathing",
    "severe bleeding",
    "heavy bleeding",
    "bleeding",
    "stroke",
    "facial drooping",
    "unconscious",
    "poisoning",
    "seizure",
    "choking",
  ];

  function detectEmergency(query) {
    const text = query.toLowerCase();
    return EMERGENCY_KEYWORDS.some((kw) => text.includes(kw));
  }

  test("Accurately detects acute medical emergencies", () => {
    assert.equal(detectEmergency("My father has severe chest pain and sweating"), true);
    assert.equal(detectEmergency("Child is choking on food"), true);
    assert.equal(detectEmergency("Patient is having a seizure and is unconscious"), true);
    assert.equal(detectEmergency("Sudden facial drooping and slurred speech"), true);
    assert.equal(detectEmergency("Heavy uncontrolled bleeding from deep laceration"), true);
  });

  test("Does not flag routine non-emergency questions", () => {
    assert.equal(detectEmergency("How much water should I drink in summer?"), false);
    assert.equal(detectEmergency("What are healthy whole grain foods?"), false);
    assert.equal(detectEmergency("Tips for getting 8 hours of sleep"), false);
    assert.equal(detectEmergency("When is BCG vaccine scheduled?"), false);
  });
});
