export interface PredictionResult {
  class_name: string
  confidence: number
  all_probabilities: number[]
  image_base64: string
  is_fresh: boolean
  heatmap_base64?: string
}

export interface FeedbackPayload {
  file: File
  correct_label: string
}

export const CLASS_LABELS = [
  "Fresh_FreshApple",
  "Fresh_FreshBanana",
  "Fresh_FreshBellpepper",
  "Fresh_FreshBittergroud",
  "Fresh_FreshCapciscum",
  "Fresh_FreshCarrot",
  "Fresh_FreshCucumber",
  "Fresh_FreshMango",
  "Fresh_FreshOkara",
  "Fresh_FreshOrange",
  "Fresh_FreshPotato",
  "Fresh_FreshStrawberry",
  "Fresh_FreshTomato",
  "Rotten_RottenApple",
  "Rotten_RottenBanana",
  "Rotten_RottenBellpepper",
  "Rotten_RottenBittergroud",
  "Rotten_RottenCapsicum",
  "Rotten_RottenCarrot",
  "Rotten_RottenCucumber",
  "Rotten_RottenMango",
  "Rotten_RottenOkra",
  "Rotten_RottenOrange",
  "Rotten_RottenPotato",
  "Rotten_RottenStrawberry",
  "Rotten_RottenTomato",
] as const

export type ClassLabel = (typeof CLASS_LABELS)[number]
