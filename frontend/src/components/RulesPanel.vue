<template>
  <div class="space-y-4">
    <div class="grid md:grid-cols-3 gap-4">
      <div v-for="rule in SOUND_CHANGE_RULES" :key="rule.id" class="bg-slate-800 rounded-lg p-4 border border-slate-700 flex flex-col">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs px-2 py-0.5 rounded bg-cyan-900 text-cyan-300">{{ rule.title }}</span>
          <span class="font-mono text-xs text-slate-400">{{ rule.law }}</span>
        </div>
        <p class="text-sm text-slate-300 mb-2">{{ rule.description }}</p>
        <div class="text-xs text-slate-500 mb-3">例：{{ rule.example.fromLang }} {{ rule.example.from }} → {{ rule.example.toLang }} {{ rule.example.to }}</div>

        <!-- 会话状态：步骤/上次选择/失败原因 独立保存，切换页面后原样展示 -->
        <div v-if="sessionOf(rule.id)" class="text-xs bg-slate-900 rounded p-2 mb-3 space-y-1">
          <div class="text-slate-400">
            进度：步骤 {{ Math.min(sessionOf(rule.id)!.currentStep + 1, rule.steps.length) }}/{{ rule.steps.length }}
            <span v-if="sessionOf(rule.id)!.currentStep >= rule.steps.length" class="text-green-400">（步骤已完成）</span>
          </div>
          <div v-if="lastSelectionOf(rule.id)" class="text-slate-500">上次选择：{{ lastSelectionOf(rule.id) }}</div>
          <div v-if="sessionOf(rule.id)!.failureReason" class="text-red-400">失败原因：{{ sessionOf(rule.id)!.failureReason }}</div>
          <div v-if="sessionOf(rule.id)!.emptyInputNotice" class="text-amber-400">空输入：未生成结果，已有结论不受影响</div>
        </div>

        <div class="mt-auto flex gap-2">
          <button @click="store.openDeduction(rule.id)" class="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white text-sm rounded px-3 py-1.5">
            {{ sessionOf(rule.id) ? '继续推演' : '进入推演' }}
          </button>
          <button v-if="sessionOf(rule.id)" @click="store.restartDeduction(rule.id)" class="text-sm rounded px-3 py-1.5 border border-slate-600 text-slate-400 hover:text-red-400 hover:border-red-500">
            重开
          </button>
        </div>
      </div>
    </div>

    <!-- 三组对照结论保持可见 -->
    <div class="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <h3 class="text-sm font-bold text-slate-400 mb-3">对照结论（按三组音变分组）</h3>
      <div class="grid md:grid-cols-3 gap-4">
        <div v-for="g in store.conclusionsByGroup" :key="g.rule.id" class="bg-slate-900 rounded p-3">
          <div class="text-xs font-bold text-cyan-400 mb-2">{{ g.rule.title }} · {{ g.rule.law }}</div>
          <div v-if="g.conclusions.length === 0" class="text-xs text-slate-600">暂无结论</div>
          <div v-for="c in g.conclusions" :key="c.id" class="text-xs border-t border-slate-700 py-1.5 first:border-0">
            <span class="font-mono text-slate-200">{{ c.input }}</span>
            <span class="text-slate-500"> → </span>
            <span class="font-mono text-green-400">{{ c.output }}</span>
            <div class="text-slate-500">{{ c.summary }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEtymologyStore, SOUND_CHANGE_RULES } from '../store/etymology'

const store = useEtymologyStore()

function sessionOf(ruleId: string) {
  return store.deductionSessions[ruleId] ?? null
}

function lastSelectionOf(ruleId: string): string | null {
  const s = sessionOf(ruleId)
  if (!s || !s.selectedConditionId) return null
  const rule = SOUND_CHANGE_RULES.find(r => r.id === ruleId)
  const step = rule?.steps[s.currentStep]
  const cond = step?.conditions.find(c => c.id === s.selectedConditionId)
  return cond ? cond.label : s.selectedConditionId
}
</script>
