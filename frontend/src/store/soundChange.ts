import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { SOUND_RULES } from '../mock/soundRules'
import type { DerivationSession, SoundRule } from '../types'

const STORAGE_KEY = 'sound-derivation-sessions-v1'

export function defaultSession(ruleId: string): DerivationSession {
  return {
    ruleId,
    currentStep: 0,
    selectedOptions: {},
    failureReasons: {},
    sourceWord: '',
    resultWord: '',
    resultSource: '',
    emptyInput: false,
    completed: false,
    submitted: false,
    updatedAt: Date.now(),
  }
}

function loadSessions(): Record<string, DerivationSession> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    // 仅保留当前规则集合中仍存在的会话，避免脏数据
    const valid: Record<string, DerivationSession> = {}
    for (const rule of SOUND_RULES) {
      if (parsed[rule.id]) {
        // 与新默认值合并，兼容旧版本残留字段
        valid[rule.id] = { ...defaultSession(rule.id), ...parsed[rule.id], ruleId: rule.id }
      }
    }
    return valid
  } catch {
    return {}
  }
}

export const useSoundChangeStore = defineStore('soundChange', () => {
  const rules: SoundRule[] = SOUND_RULES

  // 每条推演规则一份独立会话：步骤、选择条件、失败原因、对照结论互不影响
  const sessions = ref<Record<string, DerivationSession>>(loadSessions())

  // 当前打开的规则卡片（null 表示规则面板列表）
  const activeRuleId = ref<string | null>(null)
  // 当前页面：rule = 规则面板/推演面板，words = 词表页面
  const activePage = ref<'rule' | 'words'>('rule')

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.value))
    } catch {
      // 存储不可用时退化为内存态，当前会话仍保持
    }
  }

  function session(ruleId: string): DerivationSession {
    if (!sessions.value[ruleId]) {
      sessions.value[ruleId] = defaultSession(ruleId)
      persist()
    }
    return sessions.value[ruleId]
  }

  const activeRule = computed(() => rules.find(r => r.id === activeRuleId.value) ?? null)
  const activeSession = computed(() => (activeRuleId.value ? session(activeRuleId.value) : null))

  /** 从规则卡片进入推演面板：恢复到离开时的步骤，不重置任何状态 */
  function openRule(ruleId: string) {
    session(ruleId)
    activeRuleId.value = ruleId
    activePage.value = 'rule'
  }

  function backToCards() {
    activeRuleId.value = null
  }

  function switchPage(page: 'rule' | 'words') {
    activePage.value = page
  }

  /**
   * 选择某一步的条件：
   * - 选择正确条件：清除该步失败原因并记录选择
   * - 选择错误条件：把失败原因按该步骤保存，步骤不前进
   * 失败原因与步骤序号绑定，跳转或离开后返回不会串到其他组。
   */
  function selectOption(ruleId: string, stepIndex: number, optionId: string) {
    const s = session(ruleId)
    const rule = rules.find(r => r.id === ruleId)
    if (!rule) return
    const step = rule.steps[stepIndex]
    if (!step) return
    const option = step.options.find(o => o.id === optionId)
    s.selectedOptions = { ...s.selectedOptions, [stepIndex]: optionId }
    s.emptyInput = false
    const reasons = { ...s.failureReasons }
    if (option?.valid) {
      delete reasons[stepIndex]
    } else {
      reasons[stepIndex] = option?.hint ?? '该条件不成立，音变无法在此环境发生。'
    }
    s.failureReasons = reasons
    s.updatedAt = Date.now()
    persist()
  }

  /** 前进一步；条件未选或错误时把失败原因保存在当前步骤并停留 */
  function nextStep(ruleId: string) {
    const s = session(ruleId)
    const rule = rules.find(r => r.id === ruleId)
    if (!rule) return
    const step = rule.steps[s.currentStep]
    if (!step) return
    const reasons = { ...s.failureReasons }
    const chosenId = s.selectedOptions[s.currentStep]
    if (!chosenId) {
      reasons[s.currentStep] = '请先为本组辅音变化选择语音条件。'
      s.failureReasons = reasons
      s.updatedAt = Date.now()
      persist()
      return
    }
    const option = step.options.find(o => o.id === chosenId)
    if (!option?.valid) {
      reasons[s.currentStep] = option?.hint ?? '当前选择的条件不满足该音变。'
      s.failureReasons = reasons
      s.updatedAt = Date.now()
      persist()
      return
    }
    if (s.currentStep < rule.steps.length - 1) {
      s.currentStep += 1
    } else {
      s.completed = true
    }
    s.updatedAt = Date.now()
    persist()
  }

  /** 返回上一组：选择与各组失败原因都保留，只移动当前位置 */
  function prevStep(ruleId: string) {
    const s = session(ruleId)
    if (s.currentStep > 0) {
      s.currentStep -= 1
      s.updatedAt = Date.now()
      persist()
    }
  }

  /** 直接跳到指定组（回顾已作答内容）；不清除任何选择与失败原因 */
  function jumpToStep(ruleId: string, stepIndex: number) {
    const s = session(ruleId)
    const rule = rules.find(r => r.id === ruleId)
    if (!rule) return
    if (stepIndex >= 0 && stepIndex < rule.steps.length) {
      s.currentStep = stepIndex
      s.updatedAt = Date.now()
      persist()
    }
  }

  function setSourceWord(ruleId: string, word: string) {
    const s = session(ruleId)
    s.sourceWord = word
    // 一旦用户重新输入，清除空输入提示；已有对照结论仍保留
    if (word.trim()) s.emptyInput = false
    s.updatedAt = Date.now()
    persist()
  }

  /**
   * 生成对照结论。
   * 空输入不覆盖已有结果：resultWord/resultSource 原封不动，
   * 只把“空输入状态”单独保存并展示，避免上一条结论错位或被覆盖。
   */
  function submitWord(ruleId: string) {
    const s = session(ruleId)
    s.submitted = true
    const word = s.sourceWord.trim()
    if (!word) {
      s.emptyInput = true
      s.updatedAt = Date.now()
      persist()
      return
    }
    s.emptyInput = false
    s.resultSource = word
    s.resultWord = applyRule(ruleId, word)
    s.updatedAt = Date.now()
    persist()
  }

  /** 极简规则应用：按步骤顺序替换首个匹配的辅音，用于生成对照结果 */
  function applyRule(ruleId: string, word: string): string {
    const rule = rules.find(r => r.id === ruleId)
    if (!rule) return word
    let out = word
    for (const step of rule.steps) {
      out = out.replace(step.from, step.to)
    }
    return out
  }

  /** 明确重开：只有调用此方法才重置该条推演的全部状态 */
  function resetSession(ruleId: string) {
    sessions.value[ruleId] = defaultSession(ruleId)
    persist()
  }

  return {
    rules,
    sessions,
    activeRuleId,
    activePage,
    activeRule,
    activeSession,
    session,
    openRule,
    backToCards,
    switchPage,
    selectOption,
    nextStep,
    prevStep,
    jumpToStep,
    setSourceWord,
    submitWord,
    resetSession,
  }
})
