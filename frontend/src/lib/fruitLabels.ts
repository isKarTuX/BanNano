/**
 * Diccionario de traduccion de etiquetas del modelo a espanol.
 * El backend espera los nombres originales en ingles, pero el frontend
 * muestra todo traducido para el usuario.
 */

export const FRUIT_LABELS_ES: Record<string, string> = {
  // Frescas
  "Fresh_FreshApple": "Manzana Fresca",
  "Fresh_FreshBanana": "Banano Fresco",
  "Fresh_FreshBellpepper": "Pimenton Fresco",
  "Fresh_FreshBittergroud": "Melon Amargo Fresco",
  "Fresh_FreshCapciscum": "Aji / Chile Fresco",
  "Fresh_FreshCarrot": "Zanahoria Fresca",
  "Fresh_FreshCucumber": "Pepino Fresco",
  "Fresh_FreshMango": "Mango Fresco",
  "Fresh_FreshOkara": "Okra Fresca",
  "Fresh_FreshOrange": "Naranja Fresca",
  "Fresh_FreshPotato": "Papa Fresca",
  "Fresh_FreshStrawberry": "Fresa Fresca",
  "Fresh_FreshTomato": "Tomate Fresco",

  // Podridas
  "Rotten_RottenApple": "Manzana Podrida",
  "Rotten_RottenBanana": "Banano Podrido",
  "Rotten_RottenBellpepper": "Pimenton Podrido",
  "Rotten_RottenBittergroud": "Melon Amargo Podrido",
  "Rotten_RottenCapsicum": "Aji / Chile Podrido",
  "Rotten_RottenCarrot": "Zanahoria Podrida",
  "Rotten_RottenCucumber": "Pepino Podrido",
  "Rotten_RottenMango": "Mango Podrido",
  "Rotten_RottenOkra": "Okra Podrida",
  "Rotten_RottenOrange": "Naranja Podrida",
  "Rotten_RottenPotato": "Papa Podrida",
  "Rotten_RottenStrawberry": "Fresa Podrida",
  "Rotten_RottenTomato": "Tomate Podrido",
}

/**
 * Traduce una etiqueta del modelo a espanol.
 * Si no existe en el diccionario, devuelve el nombre original
 * limpiando los prefijos y separando camelCase.
 */
export function getFruitLabelEs(className: string): string {
  if (FRUIT_LABELS_ES[className]) {
    return FRUIT_LABELS_ES[className]
  }

  // Fallback: quitar prefijos y separar camelCase
  const noPrefix = className
    .replace(/^Fresh_Fresh/, "")
    .replace(/^Rotten_Rotten/, "")
  const words = noPrefix.replace(/([A-Z])/g, " $1").trim()
  return words || className
}

/**
 * Determina si una fruta esta podrida basado en su etiqueta.
 */
export function isRotten(className: string): boolean {
  return className.startsWith("Rotten_")
}

/**
 * Obtiene solo el nombre de la fruta (sin estado) en espanol.
 * Ej: "Fresh_FreshApple" → "Manzana"
 */
export function getFruitNameOnly(className: string): string {
  const full = getFruitLabelEs(className)
  return full
    .replace(/ Fresca$/, "")
    .replace(/ Fresco$/, "")
    .replace(/ Podrida$/, "")
    .replace(/ Podrido$/, "")
}

/**
 * Lista de frutas unicas soportadas (sin duplicados, sin estado).
 * Ordenadas alfabeticamente.
 */
export const SUPPORTED_FRUITS = [
  "Aji / Chile",
  "Banano",
  "Fresa",
  "Manzana",
  "Mango",
  "Melon Amargo",
  "Naranja",
  "Okra",
  "Papa",
  "Pepino",
  "Pimenton",
  "Tomate",
  "Zanahoria",
]
