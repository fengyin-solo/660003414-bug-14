<template>
  <div class="bg-slate-800 rounded-lg p-4 border border-slate-700">
    <!-- 头部：返回规则卡片，不重置任何状态 -->
    <div class="flex items-start justify-between mb-4">
      <div>
        <button class="text-xs text-cyan-400 hover:underline mb-1" @click="emit('back')">← 返回规则卡片</button>
        <h3 class="text-lg font-bold" :style="{ color: rule.color }">{{ rule.name }}</h3>
        <p class="text-xs text-slate-500">{{ rule.law }}</p>
      </div>
      <button
        class="text-xs px-3 py-1.5 rounded border border-red-700 text-red-300 hover:bg-red-900/40"
        @click="confirmReset"
      >重开本条推演</button>
    </div>

    <!-- 步骤导航：恢复到离开时的当前组 -->
    <div class="flex items-center gap-2 mb-4">
      <template v-for="(step, i) in rule.steps" :key="step.id">
        <button
          class="flex-1 text-xs px-2 py-2 rounded border transition-colors text-left"
          :class="i === s.currentStep
            ? 'border-cyan-500 bg-slate-900'
            : isStepValid(i)
              ? 'border-green-700 bg-green-900/20'
              : 'border-slate-700 bg-slate-900/50'"
          @click="jumpTo(i)"
        >
          <div class="font-bold" :style="{ color: isStepValid(i) ? '#4ade80' : i === s.currentStep ? rule.color : '#94a3b8' }">
            {{ step.from }} → {{ step.to }}
          </div>
          <div class="text-[10px] text-slate-500 mt-0.5">第{{ ['一','二','三'][i] }}组</div>
        </button>
      </template>
    </div>

    <!-- 当前步骤 -->
    <div class="bg-slate-900 rounded-lg p-4 mb-3">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300">{{ currentStep.title }}</span>
        <span class="font-mono text-lg" :style="{ color: rule.color }">{{ currentStep.from }} → {{ currentStep.to }}</span>
      </div>
      <p class="text-sm text-slate-300 mb-3 leading-relaxed">{{ currentStep.description }}</p>

      <!-- 条件选择：选中状态持久保存 -->
      <div class="space-y-2 mb-3">
        <label
          v-for="opt in currentStep.options"
          :key="opt.id"
          class="flex items-start gap-2 text-sm p-2 rounded border cursor-pointer transition-colors"
          :class="s.selectedOptions[currentIndex] === opt.id
            ? opt.valid
              ? 'border-green-600 bg-green-900/20'
              : 'border-red-600 bg-red-900/20'
            : 'border-slate-700 hover:border-slate-500'"
        >
          <input
            type="radio"
            :name="`opt-${rule.id}-${currentIndex}`"
            class="mt-1"
            :checked="s.selectedOptions[currentIndex] === opt.id"
            @change="store.selectOption(rule.id, currentIndex, opt.id)"
          />
          <span class="text-slate-200">{{ opt.label }}</span>
        </label>
      </div>

      <!-- 失败原因：与当前步骤绑定，切换规则/页面或返回后仍在原位 -->
      <div v-if="s.failureReasons[currentIndex]" class="text-xs text-red-300 bg-red-900/30 border border-red-800 rounded p-2 mb-3">
        <span class="font-bold">推演失败：</span>{{ s.failureReasons[currentIndex] }}
      </div>
      <div v-else-if="isStepValid(currentIndex)" class="text-xs text-green-300 bg-green-900/20 border border-green-800 rounded p-2 mb-3">
        {{ currentHint }}
      </div>

      <div class="flex items-center justify-between">
        <button
          class="text-xs px-3 py-1.5 rounded border border-slate-600 text-slate-300 disabled:opacity-40"
          :disabled="currentIndex === 0"
          @click="store.prevStep(rule.id)"
        >上一组</button>
        <span class="text-xs font-mono text-slate-400">例：{{ currentStep.example.source }} → {{ currentStep.example.target }}</span>
        <button
          v-if="currentIndex < rule.steps.length - 1"
          class="text-xs px-3 py-1.5 rounded bg-cyan-700 text-white hover:bg-cyan-600"
          @click="store.nextStep(rule.id)"
        >下一组</button>
        <button
          v-else
          class="text-xs px-3 py-1.5 rounded bg-green-700 text-white hover:bg-green-600"
          :disabled="s.completed"
          @click="store.nextStep(rule.id)"
        >{{ s.completed ? '三组辅音变化已完成' : '完成推演' }}</button>
      </div>
    </div>

    <!-- 对照推演输入 + 已有结论（持久保留） -->
    <div class="bg-slate-900 rounded-lg p-4">
      <div class="text-xs font-bold text-slate-400 mb-2">源词对照推演</div>
      <div class="flex gap-2 mb-2">
        <input
          :value="s.sourceWord"
          placeholder="输入 PIE 源词，如 *pater"
          class="flex-1 bg-slate-800 border border-slate-600 rounded px-3 py-1.5 text-sm font-mono focus:outline-none focus:border-cyan-500"
          @input="store.setSourceWord(rule.id, ($event.target as HTMLInputElement).value)"
        />
        <button
          class="text-xs px-4 py-1.5 rounded bg-cyan-700 text-white hover:bg-cyan-600"
          @click="store.submitWord(rule.id)"
        >生成对照</button>
      </div>

      <!-- 空输入状态：保持可见，但不覆盖上一条结果 -->
      <div v-if="s.emptyInput" class="text-xs text-amber-300 bg-amber-900/20 border border-amber-800 rounded p-2 mb-2">
        输入为空：请输入源词后再生成；上一条对照结论未被清除，仍在下方显示。
      </div>

      <!-- 已生成的对照结论：离开再进入也不被新推演覆盖 -->
      <div v-if="s.resultWord" class="flex items-center gap-3 p-2 rounded bg-slate-800 border border-slate-700 mb-2">
        <span class="font-mono text-sm text-slate-300">{{ s.resultSource }}</span>
        <span class="text-slate-500">→</span>
        <span class="font-mono text-sm font-bold" :style="{ color: rule.color }">{{ s.resultWord }}</span>
        <span class="text-[10px] text-slate-500 ml-auto">上次对照结论（已保留）</span>
      </div>

      <!-- 规则自带的三组对照示例始终可见 -->
      <div class="text-[11px] text-slate-500">
        本规则三组对照：
        <span v-for="(c, i) in rule.comparisons" :key="i" class="font-mono ml-2">
          {{ c.proto }} → {{ c.modern }}（{{ c.gloss }}）
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SoundRule } from '../types'
import { useSoundChangeStore } from '../store/soundChange'

const props = defineProps<{ rule: SoundRule }>()
const emit = defineEmits<{ back: [] }>()
const store = useSoundChangeStore()

// 会话直接取自 store：组件挂载/卸载都不会重置，返回时恢复到原位置
const s = computed(() => store.session(props.rule.id))
const currentIndex = computed(() => Math.min(s.value.currentStep, props.rule.steps.length - 1))
const currentStep = computed(() => props.rule.steps[currentIndex.value])
const currentHint = computed(() => {
  const opt = currentStep.value.options.find(o => o.id === s.value.selectedOptions[currentIndex.value])
  return opt?.hint ?? ''
})

function isStepValid(i: number) {
  const opt = props.rule.steps[i].options.find(o => o.id === s.value.selectedOptions[i])
  return !!opt?.valid
}

function jumpTo(i: number) {
  // 允许在各组间跳转回顾；不清除任何选择与失败原因
  store.jumpToStep(props.rule.id, i)
}

function confirmReset() {
  if (window.confirm('确定重开本条推演？步骤、选择条件、失败原因和对照结论都会重置。')) {
    store.resetSession(props.rule.id)
  }
}
</script>
