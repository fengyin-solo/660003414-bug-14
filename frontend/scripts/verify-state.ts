// 状态持久化逻辑的快速验证脚本（esbuild 打包到 Node，localStorage 用内存 shim）
import { createPinia, setActivePinia } from 'pinia'
import { useSoundChangeStore } from '../src/store/soundChange'

const mem: Record<string, string> = {}
;(globalThis as any).localStorage = {
  getItem: (k: string) => mem[k] ?? null,
  setItem: (k: string, v: string) => { mem[k] = v },
  removeItem: (k: string) => { delete mem[k] },
}

let pass = 0, fail = 0
function assert(cond: boolean, msg: string) {
  if (cond) { pass++; console.log('  ✓', msg) }
  else { fail++; console.error('  ✗', msg) }
}

setActivePinia(createPinia())
let store = useSoundChangeStore()
const [ruleA, ruleB] = [store.rules[0].id, store.rules[1].id]

console.log('场景1：每条推演独立保存步骤/选择/失败原因')
store.openRule(ruleA)
// 第一组选错误条件 → 产生失败原因，步骤停留
store.selectOption(ruleA, 0, 'after-s')
assert(store.session(ruleA).currentStep === 0, '错误选择后步骤不前进')
assert(!!store.session(ruleA).failureReasons[0], '第一组失败原因已保存')
// 改选正确 → 失败清除，前进到第二组
store.selectOption(ruleA, 0, 'any')
assert(!store.session(ruleA).failureReasons[0], '改选正确后第一组失败原因清除')
store.nextStep(ruleA)
assert(store.session(ruleA).currentStep === 1, '前进到第二组（不再回到第一组）')
store.selectOption(ruleA, 1, 'onset')
store.nextStep(ruleA)
assert(store.session(ruleA).currentStep === 2, '前进到第三组')
assert(store.session(ruleA).selectedOptions[1] === 'onset', '第二组选择条件已保存')
// 另一条规则仍在第一组、且无失败原因
assert(store.session(ruleB).currentStep === 0, '规则B独立停留在第一组')
assert(Object.keys(store.session(ruleB).failureReasons).length === 0, '规则B无失败原因串入')

console.log('场景2：切到词表页 / 返回规则卡片，恢复到原位置')
store.switchPage('words')
store.backToCards()
// 模拟页面切换导致组件重挂载：重新创建 pinia 实例（store 从 localStorage 恢复）
setActivePinia(createPinia())
store = useSoundChangeStore()
store.openRule(ruleA)
const sa = store.session(ruleA)
assert(sa.currentStep === 2, '返回后规则A仍在第三组（未回退到第一组）')
assert(sa.selectedOptions[0] === 'any' && sa.selectedOptions[1] === 'onset', '已选条件恢复')
assert(!!mem['sound-derivation-sessions-v1'], '会话已持久化')

console.log('场景3：对照结论不被新推演/重进覆盖')
store.setSourceWord(ruleA, '*pater')
store.submitWord(ruleA)
assert(store.session(ruleA).resultWord === '*faθer', '生成对照结论（*pater → *faθer，p→f、t→θ）')
assert(store.session(ruleA).resultSource === '*pater', '结论与源词成对保存')
// 离开再进入（新 pinia）
setActivePinia(createPinia())
store = useSoundChangeStore()
store.openRule(ruleA)
assert(store.session(ruleA).resultWord === '*faθer', '返回后上一条对照结论仍在')

console.log('场景4：空输入不清空/错位上一条结果')
store.setSourceWord(ruleA, '')
store.submitWord(ruleA)
assert(store.session(ruleA).emptyInput === true, '空输入状态被记录')
assert(store.session(ruleA).resultWord === '*faθer', '空输入未覆盖已有对照结论')
assert(store.session(ruleA).resultSource === '*pater', '空输入未改动结论对应的源词')
// 重新输入后空输入提示消失，提交产生新结论
store.setSourceWord(ruleA, '*tréyes')
assert(store.session(ruleA).emptyInput === false, '重新输入后空输入提示消失')
store.submitWord(ruleA)
assert(store.session(ruleA).resultWord === '*θréyes' || store.session(ruleA).resultWord.includes('θ'), '新推演生成新结论')

console.log('场景5：只有明确重开才重置')
setActivePinia(createPinia())
store = useSoundChangeStore()
store.resetSession(ruleA)
const sr = store.session(ruleA)
assert(sr.currentStep === 0, '重开后步骤归零')
assert(Object.keys(sr.selectedOptions).length === 0, '重开后选择清空')
assert(Object.keys(sr.failureReasons).length === 0, '重开后失败原因清空')
assert(sr.resultWord === '' && !sr.emptyInput, '重开后结论与空输入状态清空')
// 规则B不受影响
assert(store.session(ruleB).currentStep === 0, '重开规则A不影响规则B（B本就未开始）')

console.log(`\n结果：${pass} 通过，${fail} 失败`)
process.exit(fail ? 1 : 0)
