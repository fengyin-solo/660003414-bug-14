<template>
  <div class="bg-slate-800 rounded-lg p-4 border border-slate-700">
    <h3 class="text-sm font-bold text-slate-400 mb-3">同源词对照表</h3>
    <div class="flex gap-2 mb-3">
      <input v-model="store.searchQuery" placeholder="搜索词根/含义..." class="flex-1 bg-slate-900 border border-slate-600 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-cyan-500" />
      <select v-model="store.selectedFamily" class="bg-slate-900 border border-slate-600 rounded px-2 text-sm text-slate-300">
        <option value="all">全部语系</option>
        <option v-for="f in LANGUAGE_FAMILIES" :key="f.id" :value="f.id">{{ f.name }}</option>
      </select>
    </div>
    <div class="overflow-x-auto max-h-96 overflow-y-auto">
      <table class="w-full text-xs">
        <thead class="sticky top-0 bg-slate-700">
          <tr>
            <th class="px-2 py-2 text-left text-slate-300">词根</th>
            <th class="px-2 py-2 text-left text-slate-300">含义</th>
            <th class="px-2 py-2 text-left text-cyan-400">英语</th>
            <th class="px-2 py-2 text-left text-blue-400">法语</th>
            <th class="px-2 py-2 text-left text-green-400">德语</th>
            <th class="px-2 py-2 text-left text-orange-400">西班牙语</th>
            <th class="px-2 py-2 text-left text-purple-400">俄语</th>
            <th class="px-2 py-2 text-left text-yellow-400">拉丁语</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cs in store.filteredCognates" :key="cs.root" class="border-t border-slate-700 hover:bg-slate-700">
            <td class="px-2 py-1.5 font-mono text-slate-200 font-bold">{{ cs.root }}</td>
            <td class="px-2 py-1.5 text-slate-400">{{ cs.meaning }}</td>
            <td class="px-2 py-1.5 font-mono text-cyan-300">{{ cs.languages['英语'] || '—' }}</td>
            <td class="px-2 py-1.5 font-mono text-blue-300">{{ cs.languages['法语'] || '—' }}</td>
            <td class="px-2 py-1.5 font-mono text-green-300">{{ cs.languages['德语'] || '—' }}</td>
            <td class="px-2 py-1.5 font-mono text-orange-300">{{ cs.languages['西班牙语'] || '—' }}</td>
            <td class="px-2 py-1.5 font-mono text-purple-300">{{ cs.languages['俄语'] || '—' }}</td>
            <td class="px-2 py-1.5 font-mono text-yellow-300">{{ cs.languages['拉丁语'] || '—' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEtymologyStore, LANGUAGE_FAMILIES } from '../store/etymology'

const store = useEtymologyStore()
</script>
