import type { CognateSet, LanguageFamily, SoundChangeRule } from '../types'

export const LANGUAGE_FAMILIES: LanguageFamily[] = [
  { id: 'ie', name: '印欧语系', color: '#3b82f6', languages: ['英语','法语','德语','西班牙语','俄语','拉丁语'], era: '公元前4000年' },
  { id: 'st', name: '汉藏语系', color: '#22c55e', languages: ['汉语','藏语','缅甸语'], era: '公元前4000年' },
  { id: 'aa', name: '亚非语系', color: '#f59e0b', languages: ['阿拉伯语','希伯来语'], era: '公元前6000年' },
  { id: 'ural', name: '乌拉尔语系', color: '#8b5cf6', languages: ['芬兰语','匈牙利语'], era: '公元前5000年' },
]

export const COGNATE_SETS: CognateSet[] = [
  { root: '*pṓds', meaning: '脚/足', languages: { '英语': 'foot', '法语': 'pied', '德语': 'Fuß', '西班牙语': 'pie', '俄语': 'ступня', '拉丁语': 'pēs' }, period: 'PIE', family: 'ie' },
  { root: '*mātér', meaning: '母亲', languages: { '英语': 'mother', '法语': 'mère', '德语': 'Mutter', '西班牙语': 'madre', '俄语': 'мать', '拉丁语': 'māter' }, period: 'PIE', family: 'ie' },
  { root: '*pṓtr', meaning: '父亲', languages: { '英语': 'father', '法语': 'père', '德语': 'Vater', '西班牙语': 'padre', '俄语': 'отец', '拉丁语': 'pater' }, period: 'PIE', family: 'ie' },
  { root: '*h₂épo', meaning: '水', languages: { '英语': 'aqua', '法语': 'eau', '德语': 'Au', '西班牙语': 'agua', '俄语': 'вода', '拉丁语': 'aqua' }, period: 'PIE', family: 'ie' },
  { root: '*dʰómos', meaning: '家', languages: { '英语': 'dome', '法语': 'maison', '德语': 'Dom', '西班牙语': 'domo', '俄语': 'дом', '拉丁语': 'domus' }, period: 'PIE', family: 'ie' },
  { root: '*wḗdr̥', meaning: '水/Water', languages: { '英语': 'water', '法语': 'eau', '德语': 'Wasser', '俄语': 'вода', '拉丁语': 'unda' }, period: 'PIE', family: 'ie' },
  { root: '*sol-', meaning: '太阳', languages: { '英语': 'sun', '法语': 'soleil', '德语': 'Sonne', '西班牙语': 'sol', '俄语': 'солнце', '拉丁语': 'sol' }, period: 'PIE', family: 'ie' },
  { root: '*luks-', meaning: '光/亮', languages: { '英语': 'light', '法语': 'lumière', '德语': 'Licht', '西班牙语': 'luz', '俄语': 'луч', '拉丁语': 'lux' }, period: 'PIE', family: 'ie' },
  { root: '*nokʷt-', meaning: '夜晚', languages: { '英语': 'night', '法语': 'nuit', '德语': 'Nacht', '西班牙语': 'noche', '俄语': 'ночь', '拉丁语': 'nox' }, period: 'PIE', family: 'ie' },
  { root: '*okʷ-', meaning: '眼睛', languages: { '英语': 'eye', '法语': 'oeil', '德语': 'Auge', '西班牙语': 'ojo', '俄语': 'oko', '拉丁语': 'oculus' }, period: 'PIE', family: 'ie' },
  { root: '*ed-', meaning: '吃', languages: { '英语': 'eat', '德语': 'essen', '俄语': 'есть', '拉丁语': 'edere' }, period: 'PIE', family: 'ie' },
  { root: '*ǵneh₃-', meaning: '知道', languages: { '英语': 'know', '德语': 'kennen', '西班牙语': 'conocer', '俄语': 'знать', '拉丁语': 'gnoscere' }, period: 'PIE', family: 'ie' },
  { root: '*h₃érō', meaning: '鹰', languages: { '英语': 'eagle', '法语': 'aigle', '德语': 'Adler', '西班牙语': 'águila', '拉丁语': 'aquila' }, period: 'PIE', family: 'ie' },
  { root: '*sker-', meaning: '切割', languages: { '英语': 'shear', '德语': 'scheren', '俄语': 'резать', '拉丁语': 'scindere' }, period: 'PIE', family: 'ie' },
  { root: '*gʷen-', meaning: '女人', languages: { '英语': 'queen', '德语': 'Frau', '俄语': 'жена' }, period: 'PIE', family: 'ie' },
]

export const SOUND_CHANGE_RULES: SoundChangeRule[] = [
  {
    id: 'grimm-1', group: 1, title: '第一组辅音变化', law: 'p→f · t→θ · k→h',
    description: '原始印欧语清不送气塞音在日耳曼语中擦化：p→f、t→θ(th)、k→h(x)。',
    example: { from: 'pater', to: 'father', fromLang: '拉丁语', toLang: '英语' },
    steps: [
      {
        id: 'g1s1', prompt: '第1步：识别源词中的目标辅音类型',
        conditions: [
          { id: 'g1s1c1', label: '清不送气塞音 p / t / k', description: 'Grimm定律第一组的作用对象' },
          { id: 'g1s1c2', label: '浊不送气塞音 b / d / g', description: '属于第二组作用对象' },
          { id: 'g1s1c3', label: '送气浊塞音 bʰ / dʰ / gʰ', description: '属于第三组作用对象' },
        ],
        correctConditionId: 'g1s1c1',
      },
      {
        id: 'g1s2', prompt: '第2步：选择该组辅音的演化方向',
        conditions: [
          { id: 'g1s2c1', label: '擦化：塞音变为同部位擦音', description: 'p→f、t→θ、k→h' },
          { id: 'g1s2c2', label: '清化：浊塞音变为清塞音', description: 'b→p、d→t、g→k' },
          { id: 'g1s2c3', label: '去送气：送气浊音变为普通浊音', description: 'bʰ→b、dʰ→d、gʰ→g' },
        ],
        correctConditionId: 'g1s2c1',
      },
      {
        id: 'g1s3', prompt: '第3步：确认音变发生的语音环境',
        conditions: [
          { id: 'g1s3c1', label: '词首与元音间均适用', description: '无条件音变，如 pater→father' },
          { id: 'g1s3c2', label: '仅词首位置适用', description: '词中保留原塞音' },
          { id: 'g1s3c3', label: '仅词尾位置适用', description: '词首保留原塞音' },
        ],
        correctConditionId: 'g1s3c1',
      },
    ],
  },
  {
    id: 'grimm-2', group: 2, title: '第二组辅音变化', law: 'b→p · d→t · g→k',
    description: '原始印欧语浊不送气塞音在日耳曼语中清化：b→p、d→t、g→k。',
    example: { from: 'decem', to: 'ten', fromLang: '拉丁语', toLang: '英语' },
    steps: [
      {
        id: 'g2s1', prompt: '第1步：识别源词中的目标辅音类型',
        conditions: [
          { id: 'g2s1c1', label: '浊不送气塞音 b / d / g', description: 'Grimm定律第二组的作用对象' },
          { id: 'g2s1c2', label: '清不送气塞音 p / t / k', description: '属于第一组作用对象' },
          { id: 'g2s1c3', label: '鼻音 m / n', description: '不参与Grimm定律' },
        ],
        correctConditionId: 'g2s1c1',
      },
      {
        id: 'g2s2', prompt: '第2步：选择该组辅音的演化方向',
        conditions: [
          { id: 'g2s2c1', label: '清化：浊塞音变为清塞音', description: 'b→p、d→t、g→k' },
          { id: 'g2s2c2', label: '擦化：塞音变为擦音', description: 'p→f、t→θ、k→h' },
          { id: 'g2s2c3', label: '鼻化：塞音变为鼻音', description: '不符合Grimm定律' },
        ],
        correctConditionId: 'g2s2c1',
      },
      {
        id: 'g2s3', prompt: '第3步：确认音变发生的语音环境',
        conditions: [
          { id: 'g2s3c1', label: '所有位置无条件适用', description: '如 decem→ten、genu→knee' },
          { id: 'g2s3c2', label: '仅重读音节前适用', description: '非重读环境保留浊音' },
          { id: 'g2s3c3', label: '仅词尾适用', description: '词首保留浊音' },
        ],
        correctConditionId: 'g2s3c1',
      },
    ],
  },
  {
    id: 'grimm-3', group: 3, title: '第三组辅音变化', law: 'bʰ→b · dʰ→d · gʰ→g',
    description: '原始印欧语送气浊塞音在日耳曼语中失去送气：bʰ→b、dʰ→d、gʰ→g。',
    example: { from: '*bʰrātēr', to: 'brother', fromLang: '原始印欧语', toLang: '英语' },
    steps: [
      {
        id: 'g3s1', prompt: '第1步：识别源词中的目标辅音类型',
        conditions: [
          { id: 'g3s1c1', label: '送气浊塞音 bʰ / dʰ / gʰ', description: 'Grimm定律第三组的作用对象' },
          { id: 'g3s1c2', label: '浊不送气塞音 b / d / g', description: '属于第二组作用对象' },
          { id: 'g3s1c3', label: '清擦音 f / θ / h', description: '已是第一组音变的结果' },
        ],
        correctConditionId: 'g3s1c1',
      },
      {
        id: 'g3s2', prompt: '第2步：选择该组辅音的演化方向',
        conditions: [
          { id: 'g3s2c1', label: '去送气：送气浊音变为普通浊音', description: 'bʰ→b、dʰ→d、gʰ→g' },
          { id: 'g3s2c2', label: '清化：变为清塞音', description: 'bʰ→p 不符合Grimm定律' },
          { id: 'g3s2c3', label: '擦化：变为浊擦音', description: '本组在日耳曼语中不擦化' },
        ],
        correctConditionId: 'g3s2c1',
      },
      {
        id: 'g3s3', prompt: '第3步：确认音变发生的语音环境',
        conditions: [
          { id: 'g3s3c1', label: '所有位置无条件适用', description: '如 *bʰrātēr→brother、*dʰómos→doom' },
          { id: 'g3s3c2', label: '仅元音间适用', description: '词首保留送气' },
          { id: 'g3s3c3', label: '仅词首适用', description: '词中保留送气' },
        ],
        correctConditionId: 'g3s3c1',
      },
    ],
  },
]

export function buildGraph() {
  const nodes: any[] = []
  const links: any[] = []
  COGNATE_SETS.forEach((cs, ci) => {
    const rootId = 'root_' + ci
    nodes.push({ id: rootId, word: cs.root, language: 'Proto-IE', meaning: cs.meaning, family: 'ie', era: '公元前5000年' })
    Object.entries(cs.languages).forEach(([lang, word]) => {
      if (!word || word === '-') return
      const nid = ci + '_' + lang
      nodes.push({ id: nid, word, language: lang, meaning: cs.meaning, family: 'ie', era: '现代' })
      links.push({ source: rootId, target: nid, type: 'derived' })
    })
  })
  return { nodes, links }
}
