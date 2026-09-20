<template>
  <div class="space-y-4">
    <!-- 规则卡片列表 -->
    <template v-if="!store.activeRule">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-bold text-slate-400">音变规则面板</h3>
        <span class="text-xs text-slate-500">每张卡片独立保存推演进度，切换或离开后自动恢复</span>
      </div>
      <div class="grid md:grid-cols-2 gap-4">
        <div
          v-for="rule in store.rules"
          :key="rule.id"
          class="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-cyan-600 cursor-pointer transition-colors"
          @click="store.openRule(rule.id)"
        >
          <div class="flex items-start justify-between mb-2">
            <div>
              <div class="text-base font-bold" :style="{ color: rule.color }">{{ rule.name }}</div>
              <div class="text-xs text-slate-500">{{ rule.law }}</div>
            </div>
            <span
              class="text-[10px] px-2 py-0.5 rounded-full"
              :class="progress(rule.id).done ? 'bg-green-900 text-green-300' : 'bg-slate-700 text-slate-300'"
            >{{ progress(rule.id).label }}</span>
          </div>
          <div class="font-mono text-sm text-slate-200 my-2">{{ rule.formula }}</div>
          <p class="text-xs text-slate-400 leading-relaxed">{{ rule.summary }}</p>
          <!-- 进度条：恢复时可见，证明步骤状态被保留 -->
          <div class="flex gap-1 mt-3">
            <span
              v-for="(step, i) in rule.steps"
              :key="step.id"
              class="h-1.5 flex-1 rounded-full"
              :style="{ backgroundColor: i < progress(rule.id).steps ? rule.color : '#334155' }"
            ></span>
          </div>
        </div>
      </div>
    </template>

    <!-- 单条规则的推演面板 -->
    <template v-else>
      <DerivationPanel :rule="store.activeRule" @back="store.backToCards()" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { useSoundChangeStore } from '../store/soundChange'
import type { SoundRule } from '../types'
import DerivationPanel from './DerivationPanel.vue'

const store = useSoundChangeStore()

function progress(ruleId: string) {
  const s = store.session(ruleId)
  const rule = store.rules.find(r => r.id === ruleId) as SoundRule
  const doneSteps = rule.steps.filter((_, i) => {
    const opt = rule.steps[i].options.find(o => o.id === s.selectedOptions[i])
    return opt?.valid
  }).length
  return {
    steps: doneSteps,
    done: s.completed,
    label: s.completed
      ? '已完成 · 可继续查看'
      : s.resultWord
        ? '已生成对照'
        : doneSteps > 0 ? `进行中 · ${doneSteps}/${rule.steps.length} 组` : '未开始',
  }
}
</script>
