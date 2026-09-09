/** Cost arithmetic only. No dose or health recommendation is inferred. */
export function supplementComparison(price: string, contents: string, dailyAmount: string) {
  const parse = (input: string) => {
    const text = input.trim();
    if (!/^\d+(?:[.,]\d+)?$/.test(text)) throw new Error('Ungültige Zahl');
    const value = Number(text.replace(',', '.'));
    if (!Number.isFinite(value) || value <= 0) throw new Error('Positive Zahl erforderlich');
    return value;
  };
  const days = parse(contents) / parse(dailyAmount);
  const dailyCost = parse(price) / days;
  if (!Number.isFinite(days) || !Number.isFinite(dailyCost) || days <= 0)
    throw new Error('Werte außerhalb des Rechenbereichs');
  return { days, dailyCost };
}
