/**
 * M22-02 — Fachregeln ohne Schemabibliothek.
 *
 * Diese Funktionen standen in den Schemadateien, direkt bei den Typen, zu
 * denen sie gehören. Das war gut zu lesen und teuer: wer eine dieser Regeln
 * brauchte, bekam `zod` mit — auch im Browser, wo keine Prüfung stattfindet,
 * sondern gerechnet wird.
 *
 * Sie stehen jetzt hier, arbeiten weiterhin auf denselben Typen (die als
 * reine Typimporte verschwinden) und werden von den Schemadateien
 * re-exportiert, damit man sie dort findet, wo man sie sucht.
 */
import type { FoodProduct, NutrientValue } from './schemas/food.ts';
import type { RequirementState, TravelRule } from './schemas/travel.ts';

/** Gesamtmenge eines Gebindes in Gramm. `null`, sobald etwas fehlt. */
export function gesamtmengeGramm(futter: FoodProduct): number | null {
  if (futter.netContentGrams === null || futter.packUnits === null) return null;
  return futter.netContentGrams * futter.packUnits;
}

/** Deklarierter Nährwert. `null` heißt: nicht deklariert — und nicht 0. */
export function naehrwert(futter: FoodProduct, nutrient: string): NutrientValue | null {
  const treffer = futter.nutrients.find((eintrag) => eintrag.nutrient === nutrient);
  return treffer === undefined || treffer.value === null ? null : treffer;
}

/**
 * Darf diese Regel öffentlich ausgewertet werden? Ohne Fachfreigabe und ohne
 * gültigen Zeitraum lautet die Antwort nein — unabhängig davon, ob der
 * Abruf der Quelle technisch funktioniert hat.
 */
export function isRuleLive(rule: TravelRule, today: string): boolean {
  if (rule.reviewedAt === null || rule.reviewedBy === null) return false;
  if (today < rule.validity.from) return false;
  if (rule.validity.until !== null && today > rule.validity.until) return false;
  return true;
}

/**
 * Gesamtstatus einer Checkliste. „Alle geprüften Voraussetzungen erfüllt“ ist
 * nur zulässig, wenn keine Position `unknown` ist — und bleibt auch dann
 * keine Einreisegarantie.
 */
export function overallState(states: readonly RequirementState[]): RequirementState {
  if (states.some((state) => state === 'not_fulfilled')) return 'not_fulfilled';
  if (states.some((state) => state === 'unknown')) return 'unknown';
  if (states.every((state) => state === 'not_applicable')) return 'not_applicable';
  return 'fulfilled';
}

/** Ein Profil ist nur lokal gültig; es wird nie automatisch veröffentlicht. */
export const PROFILE_STORAGE_KEY = 'petatlas.profile.v1';
