/** Builds the correction/privacy contact for a public directory record. */
export function verzeichnisKontaktLink(
  email: string | null,
  entryId: string,
  pagePath: string,
): string | null {
  if (email === null || email.trim() === '') return null;
  const subject = `Verzeichniseintrag ${entryId} prüfen`;
  const body = [
    `Eintrags-ID: ${entryId}`,
    `Seite: ${pagePath}`,
    '',
    'Mein Anliegen (Berichtigung, Widerspruch oder Datenschutzanfrage):',
  ].join('\n');
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
