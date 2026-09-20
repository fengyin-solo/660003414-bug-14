<template>
  <div v-if="rule && session" class="bg-slate-800 rounded-lg p-4 border border-slate-700 space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <span class="text-xs px-2 py-0.5 rounded bg-cyan-900 text-cyan-300 mr-2">{{ rule.title }}</span>
        <span class="font-mono text-sm text-slate-300">{{ rule.law }}</span>
      </div>
      <div class="flex gap-2">
        <button @click="store.closeDeduction()" class="text-sm rounded px-3 py-1.5 border border-slate-600 text-slate-300 hover:border-cyan-500">
          返回规则卡片
        </button>
        <button @click="store.restartDeduction(rule.id)" class="text-sm rounded px-3 py-1.5 border border-slate-600 text-slate-400 hover:text-red-400 hover:border-red-500">
          重开推演
        </button>
      </div>
    </div>

    <div class="text-xs text-slate-500">
      进度：步骤 {{ Math.min(session.currentStep + 1, rule.steps.length) }}/{{ rule.steps.length }}
      <span v-if="stepsDone" class="text-green-400">（全部步骤已完成，可生成对照结论）</span>
    </div>

    <!-- 当前步骤：会话保存在store中，切换页面/刷新后恢复到原步骤 -->
    <div v-if="!stepsDone && currentStep" class="bg-slate-900 rounded p-3">
      <div class="text-sm font-bold text-slate-200 mb-2">{{ currentStep.prompt }}</div>
      <div class="space-y-2">
        <button
          v-for="cond in currentStep.conditions" :key="cond.id"
          @click="store.selectCondition(rule.id, cond.id)"
          class="w-full text-left text-sm rounded px-3 py-2 border transition-colors"
          :class="session.selectedConditionId === cond.id
            ? 'border-red-500 bg-red-950/40 text-red-300'
            : 'border-slate-600 bg-slate-800 text-slate-300 hover:border-cyan-500'"
        >
          <div>{{ cond.label }}</div>
          <div v-if="cond.description" class="text-xs text-slate-500">{{ cond.description }}</div>
        </button>
      </div>
      <!-- 失败原因与上次选择随会话保留 -->
      <div v-if="session.failureReason" class="mt-2 text-xs text-red-400 bg-red-950/40 border border-red-900 rounded p-2">
        失败原因：{{ session.failureReason }}
      </div>
    </div>

    <!-- 生成对照结论 -->
    <div v-if="stepsDone" class="bg-slate-900 rounded p-3 space-y-2">
      <div class="text-sm font-bold text-slate-200">输入源词形，生成对照结论</div>
      <div class="flex gap-2">
        <input
          :value="session.inputWord"
          @input="store.setInputWord(rule.id, ($event.target as HTMLInputElement).value)"
          placeholder="如 pater / decem / *bʰrātēr ..."
          class="flex-1 bg-slate-800 border border-slate-600 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-cyan-500"
        />
        <button @click="store.applyDeduction(rule.id)" class="bg-cyan-600 hover:bg-cyan-500 text-white text-sm rounded px-4 py-1.5">
          生成结论
        </button>
      </div>
      <!-- 空输入状态保持可见，且不会错位覆盖上一条结果 -->
      <div v-if="session.emptyInputNotice" class="text-xs text-amber-400 bg-amber-950/40 border border-amber-900 rounded p-2">
        空输入：请输入待推演的词形。本次未产生结果，已有对照结论保持原样。
      </div>
    </div>

    <!-- 本组对照结论：只追加，不被新推演覆盖 -->
    <div class="bg-slate-900 rounded p-3">
      <div class="text-xs font-bold text-slate-400 mb-2">本组对照结论（{{ session.conclusions.length }}条）</div>
      <div v-if="session.conclusions.length === 0" class="text-xs text-slate-600">暂无结论</div>
      <div v-for="c in session.conclusions" :key="c.id" class="text-xs border-t border-slate-700 py-1.5 first:border-0 flex items-baseline gap-2">
        <span class="font-mono text-slate-200">{{ c.input }}</span>
        <span class="text-slate-500">→</span>
        <span class="font-mono text-green-400">{{ c.output }}</span>
        <span class="text-slate-500 ml-auto">{{ c.summary }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useEtymologyStore, SOUND_CHANGE_RULES } from '../store/etymology'

const store = useEtymologyStore()

const rule = computed(() => SOUND_CHANGE_RULES.find(r => r.id === store.activeDeductionRuleId) ?? null)
const session = computed(() => store.activeDeductionSession)
const stepsDone = computed(() => !!rule.value && !!session.value && session.value.currentStep >= rule.value.steps.length)
const currentStep = computed(() => {
  if (!rule.value || !session.value) return null
  return rule.value.steps[session.value.currentStep] ?? null
})
</script>
