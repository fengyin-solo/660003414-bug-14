<template>
  <div class="min-h-screen bg-slate-900 text-slate-200">
    <header class="border-b border-slate-700 px-6 py-4">
      <h1 class="text-2xl font-bold text-cyan-400">语言词源图谱与多语系演化追踪</h1>
      <p class="text-sm text-slate-500 mt-1">D3.js力导向图 · 印欧语系演化 · 同源词对照 · 音变推演</p>
      <nav class="flex gap-2 mt-3">
        <button
          v-for="tab in tabs" :key="tab.id"
          @click="store.setView(tab.id)"
          class="text-sm rounded px-4 py-1.5 border transition-colors"
          :class="store.currentView === tab.id
            ? 'border-cyan-500 bg-cyan-950/50 text-cyan-300'
            : 'border-slate-600 text-slate-400 hover:border-slate-400'"
        >{{ tab.label }}</button>
      </nav>
    </header>
    <div class="p-4">
      <keep-alive>
        <GraphView v-if="store.currentView === 'graph'" />
        <WordListPage v-else-if="store.currentView === 'words'" />
        <RulesView v-else />
      </keep-alive>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEtymologyStore, type ViewName } from './store/etymology'
import GraphView from './components/GraphView.vue'
import WordListPage from './components/WordListPage.vue'
import RulesView from './components/RulesView.vue'

const store = useEtymologyStore()
const tabs: { id: ViewName; label: string }[] = [
  { id: 'graph', label: '词源图谱' },
  { id: 'rules', label: '音变规则' },
  { id: 'words', label: '词表' },
]
</script>
