<template>
  <div class="space-y-4">
    <!-- 推演面板与规则卡片互斥显示；会话存于store，往返进入不丢失、不覆盖 -->
    <DeductionPanel v-if="store.activeDeductionRuleId" />
    <RulesPanel v-else />
  </div>
</template>

<script setup lang="ts">
import { useEtymologyStore } from '../store/etymology'
import RulesPanel from './RulesPanel.vue'
import DeductionPanel from './DeductionPanel.vue'

const store = useEtymologyStore()
</script>
