export interface WordNode {
  id: string; word: string; language: string; meaning: string
  family: string; era?: string; x?: number; y?: number
}
export interface WordLink {
  source: string; target: string
  type: 'cognate' | 'derived' | 'borrowed' | 'reconstructed'
  description?: string
}
export interface CognateSet {
  root: string; meaning: string
  languages: Record<string, string>
  period: string; family: string
}
export interface LanguageFamily {
  id: string; name: string; color: string; languages: string[]; era: string
}

export interface StepCondition {
  id: string; label: string; description?: string
}
export interface SoundChangeStep {
  id: string; prompt: string
  conditions: StepCondition[]
  correctConditionId: string
}
export interface SoundChangeRule {
  id: string; group: number; title: string; law: string
  description: string
  example: { from: string; to: string; fromLang: string; toLang: string }
  steps: SoundChangeStep[]
}
export interface ComparisonConclusion {
  id: string; ruleId: string; input: string; output: string
  summary: string; createdAt: number
}
export interface DeductionSession {
  ruleId: string
  currentStep: number
  selectedConditionId: string | null
  failureReason: string | null
  inputWord: string
  emptyInputNotice: boolean
  conclusions: ComparisonConclusion[]
}
