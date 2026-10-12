export type CareCatalogCategoryId =
  'grooming-brush' | 'grooming-claw' | 'dental-care' | 'mobility-aid' | 'coat-care-textile';

interface CareCatalogProduct {
  readonly category: string;
  readonly productName: string;
}

function normalisiereProduktname(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const PFLEGE_REGELN: Readonly<
  Record<CareCatalogCategoryId, { readonly passend: RegExp; readonly ausschluss?: RegExp }>
> = {
  'grooming-brush': {
    passend:
      /\b(fellb(?:u|ue)rste|zupfb(?:u|ue)rste|unterwoll(?:e|b(?:u|ue)rste|entferner)?|entfilz(?:er|ung)?|pflegekamm|fellkamm|flohkamm|striegel)\b/,
    ausschluss: /\b(fusselrolle|kleiderb(?:u|ue)rste|tierhaarentferner)\b/,
  },
  'grooming-claw': {
    passend: /\b(krallenschere|krallenzange|krallenfeile|krallenpflege set)\b/,
    ausschluss: /\b(elektrisch|schleifer|akku|motor)\b/,
  },
  'dental-care': {
    passend:
      /\b(tierzahnb(?:u|ue)rste|hundezahnb(?:u|ue)rste|katzenzahnb(?:u|ue)rste|fingerzahnb(?:u|ue)rste|zahnfingerling|zahnpflege set)\b/,
    ausschluss: /\b(kau(?:knochen|snack|artikel)|paste|gel|spray|pulver|loesung)\b/,
  },
  'mobility-aid': {
    passend:
      /\b(hunderampe|haustierrampe|einstiegshilfe|hundetreppe|haustiertreppe|tragehilfe|hebegurt)\b/,
  },
  'coat-care-textile': {
    passend:
      /\b(hundebademantel|katzenbademantel|trockenmantel|hundehandtuch|katzenhandtuch|pfotenhandtuch|trockentuch)\b/,
  },
};

/**
 * Ordnet nur Artikel zu, deren Produktname die konkrete Pflegefunktion eindeutig nennt.
 * Das grobe Händlermerkmal „Pflege“ genügt dafür bewusst nicht.
 */
export function pflegeKategorieFuerProduktname(productName: string): CareCatalogCategoryId | null {
  const name = normalisiereProduktname(productName);
  const treffer = (
    Object.entries(PFLEGE_REGELN) as readonly [
      CareCatalogCategoryId,
      (typeof PFLEGE_REGELN)[CareCatalogCategoryId],
    ][]
  ).flatMap(([categoryId, regel]) =>
    regel.passend.test(name) && !regel.ausschluss?.test(name) ? [categoryId] : [],
  );
  return treffer.length === 1 ? (treffer[0] ?? null) : null;
}

export function pflegeKatalogProdukteFuerKategorie<T extends CareCatalogProduct>(
  products: readonly T[],
  categoryId: string,
): readonly T[] {
  if (!Object.hasOwn(PFLEGE_REGELN, categoryId)) return [];
  return products.filter(
    (product) =>
      product.category === 'care' &&
      pflegeKategorieFuerProduktname(product.productName) === categoryId,
  );
}
