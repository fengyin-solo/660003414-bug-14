import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { COGNATE_SETS, LANGUAGE_FAMILIES, SOUND_CHANGE_RULES, buildGraph } from '../mock/data'
import type { ComparisonConclusion, DeductionSession } from '../types'
export { LANGUAGE_FAMILIES, COGNATE_SETS, SOUND_CHANGE_RULES }

export type ViewName = 'graph' | 'rules' | 'words'

const STORAGE_KEY = 'etymology-deduction-state-v1'

interface PersistedState {
  currentView: ViewName
  activeDeductionRuleId: string | null
  deductionSessions: Record<string, DeductionSession>
}

function blankSession(ruleId: string): DeductionSession {
  return {
    ruleId,
    currentStep: 0,
    selectedConditionId: null,
    failureReason: null,
    inputWord: '',
    emptyInputNotice: false,
    conclusions: [],
  }
}

function loadPersisted(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PersistedState
    if (!parsed || typeof parsed !== 'object' || !parsed.deductionSessions) return null
    return parsed
  } catch {
    return null
  }
}

/** 按规则对输入词形做模拟音变推导 */
export function deriveWord(ruleId: string, word: string): string {
  let out = word.toLowerCase()
  if (ruleId === 'grimm-1') {
    out = out.replace(/p/g, 'f').replace(/t/g, 'th').replace(/k/g, 'h')
  } else if (ruleId === 'grimm-2') {
    out = out.replace(/b/g, 'p').replace(/d/g, 't').replace(/g/g, 'k')
  } else if (ruleId === 'grimm-3') {
    out = out.replace(/bʰ|bh/g, 'b').replace(/dʰ|dh/g, 'd').replace(/gʰ|gh/g, 'g')
  }
  return out
}

export const useEtymologyStore = defineStore('etymology', () => {
  const graph = ref(buildGraph())
  const selectedNode = ref<any>(null)
  const searchQuery = ref('')
  const selectedFamily = ref('all')

  const filteredCognates = computed(() =>
    COGNATE_SETS.filter(cs => {
      const q = searchQuery.value.toLowerCase()
      const matchSearch = !q || cs.root.toLowerCase().includes(q) || cs.meaning.includes(q) || Object.values(cs.languages).some((w: string) => w.toLowerCase().includes(q))
      const matchFamily = selectedFamily.value === 'all' || cs.family === selectedFamily.value
      return matchSearch && matchFamily
    })
  )

  // ---------- 音变推演：每条推演独立保存，跨页面/刷新保持 ----------
  const persisted = loadPersisted()
  const currentView = ref<ViewName>(persisted?.currentView ?? 'graph')
  const activeDeductionRuleId = ref<string | null>(persisted?.activeDeductionRuleId ?? null)
  const deductionSessions = ref<Record<string, DeductionSession>>(persisted?.deductionSessions ?? {})

  watch(
    [currentView, activeDeductionRuleId, deductionSessions],
    () => {
      const state: PersistedState = {
        currentView: currentView.value,
        activeDeductionRuleId: activeDeductionRuleId.value,
        deductionSessions: deductionSessions.value,
      }
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch { /* 忽略写入失败 */ }
    },
    { deep: true }
  )

  function setView(view: ViewName) {
    // 仅切换页面，不触碰任何推演会话
    currentView.value = view
  }

  function ensureSession(ruleId: string): DeductionSession {
    if (!deductionSessions.value[ruleId]) {
      deductionSessions.value[ruleId] = blankSession(ruleId)
    }
    return deductionSessions.value[ruleId]
  }

  /** 从规则卡片进入推演面板：恢复已有会话，绝不重置 */
  function openDeduction(ruleId: string) {
    ensureSession(ruleId)
    activeDeductionRuleId.value = ruleId
    currentView.value = 'rules'
  }

  /** 返回规则卡片：会话原样保留 */
  function closeDeduction() {
    activeDeductionRuleId.value = null
  }

  function ruleOf(ruleId: string) {
    return SOUND_CHANGE_RULES.find(r => r.id === ruleId)
  }

  /** 选择条件：记录上次选择；选错记录失败原因并停留在当前步骤，选对推进 */
  function selectCondition(ruleId: string, conditionId: string) {
    const session = ensureSession(ruleId)
    const rule = ruleOf(ruleId)
    if (!rule || session.currentStep >= rule.steps.length) return
    const step = rule.steps[session.currentStep]
    session.selectedConditionId = conditionId
    if (conditionId === step.correctConditionId) {
      session.currentStep += 1
      session.failureReason = null
      session.selectedConditionId = null
    } else {
      const picked = step.conditions.find(c => c.id === conditionId)
      session.failureReason = `第${session.currentStep + 1}步选择「${picked?.label ?? conditionId}」不成立：${picked?.description ?? '与Grimm定律该组音变不符'}`
    }
  }

  /** 输入词形（含空白）随会话保存，切换页面不丢失 */
  function setInputWord(ruleId: string, word: string) {
    ensureSession(ruleId).inputWord = word
  }

  /** 生成对照结论：空白输入只标记空输入状态，不追加结果、不错位已有结论 */
  function applyDeduction(ruleId: string) {
    const session = ensureSession(ruleId)
    const rule = ruleOf(ruleId)
    if (!rule || session.currentStep < rule.steps.length) return
    const word = session.inputWord.trim()
    if (!word) {
      session.emptyInputNotice = true
      return
    }
    session.emptyInputNotice = false
    const output = deriveWord(ruleId, word)
    const conclusion: ComparisonConclusion = {
      id: `${ruleId}-${Date.now()}-${session.conclusions.length}`,
      ruleId,
      input: word,
      output,
      summary: `${rule.title}（${rule.law}）· ${rule.steps.length}步推演完成`,
      createdAt: Date.now(),
    }
    // 结论只追加，不覆盖已有对照结论
    session.conclusions = [...session.conclusions, conclusion]
    session.inputWord = ''
  }

  /** 明确重开：唯一的重置入口 */
  function restartDeduction(ruleId: string) {
    deductionSessions.value[ruleId] = blankSession(ruleId)
  }

  const activeDeductionSession = computed<DeductionSession | null>(() =>
    activeDeductionRuleId.value ? ensureSession(activeDeductionRuleId.value) : null
  )

  /** 三组规则各自的对照结论，规则卡片页保持可见 */
  const conclusionsByGroup = computed(() =>
    SOUND_CHANGE_RULES.map(rule => ({
      rule,
      session: deductionSessions.value[rule.id] ?? null,
      conclusions: deductionSessions.value[rule.id]?.conclusions ?? [],
    }))
  )

  return {
    graph, selectedNode, searchQuery, selectedFamily, filteredCognates,
    currentView, setView,
    activeDeductionRuleId, deductionSessions, activeDeductionSession, conclusionsByGroup,
    openDeduction, closeDeduction, selectCondition, setInputWord, applyDeduction, restartDeduction,
  }
})
