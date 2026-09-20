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

/** 推演某一步所需的选择条件（如“词中位置”“相邻辅音类型”） */
export interface SoundRuleOption {
  id: string
  label: string
  /** 该条件是否满足本步音变 */
  valid: boolean
  /** 选择该条件后给出的解释 */
  hint: string
}

/** 一组辅音变化 = 一个推演步骤 */
export interface SoundRuleStep {
  id: string
  /** 步骤名，例如“第一组辅音变化（清塞音 → 清擦音）” */
  title: string
  from: string
  to: string
  /** 步骤说明 */
  description: string
  /** 可选择的条件 */
  options: SoundRuleOption[]
  /** 本步骤正确条件的 id（选中后该步通过） */
  correctOptionId: string
  example: { source: string; target: string }
}

/** 一张可推演的音变规则卡片 */
export interface SoundRule {
  id: string
  name: string
  /** 卡片副标题，如 Grimm 定律 */
  law: string
  summary: string
  /** 卡片上展示的核心公式，如 p → f */
  formula: string
  color: string
  steps: SoundRuleStep[]
  /** 推演结论的对照词组 */
  comparisons: { proto: string; modern: string; gloss: string }[]
}

/** 单条规则推演的持久化状态：离开页面/切换规则后仍可恢复 */
export interface DerivationSession {
  ruleId: string
  /** 当前停留在的步骤序号（从 0 开始），即“当前步骤” */
  currentStep: number
  /** 每一步选择的条件 id，按步骤序号索引 */
  selectedOptions: Record<number, string>
  /** 每一步最近一次校验失败的原因（按步骤保存，切走或跳转后不丢失、不串位） */
  failureReasons: Record<number, string>
  /** 输入框中的源词 */
  sourceWord: string
  /** 已生成的对照结论；空输入提交时不覆盖此字段，上一条结论继续展示 */
  resultWord: string
  /** 生成上一条结论时所用的源词（与结论成对保存，防止错位） */
  resultSource: string
  /** 空输入提交状态：为 true 时展示空输入提示，且不清空已有对照结论 */
  emptyInput: boolean
  /** 推演是否全部步骤完成 */
  completed: boolean
  /** 是否已生成对照结论（含空输入提交） */
  submitted: boolean
  updatedAt: number
}
