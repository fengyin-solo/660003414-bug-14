import type { SoundRule } from '../types'

/**
 * 可推演的音变规则。
 * 每条规则由若干“辅音变化组”步骤组成，每步需选择正确的语音条件才能继续。
 */
export const SOUND_RULES: SoundRule[] = [
  {
    id: 'grimm',
    name: '格林定律推演',
    law: 'Grimm’s Law（第一次辅音推移）',
    summary: '原始印欧语清塞音进入原始日耳曼语时变为清擦音，词首与重读音节中无条件发生。',
    formula: 'p → f · t → θ · k → h',
    color: '#22d3ee',
    steps: [
      {
        id: 'grimm-1',
        title: '第一组辅音变化：清塞音 → 清擦音',
        from: 'p',
        to: 'f',
        description: 'PIE 清双唇塞音 *p 在原始日耳曼语中变为唇齿清擦音 f。请选择该音变发生的语音条件。',
        correctOptionId: 'any',
        options: [
          { id: 'any', valid: true, label: '词首或重读音节中（无条件）', hint: '正确：*p 在日耳曼语中无条件演变为 f，如 *pṓtr → father。' },
          { id: 'after-s', valid: false, label: '仅在 s 之后', hint: '错误：sp、st、sk 中的塞音反而保持不推移（如 *sp- 保留 sp）。' },
          { id: 'between-vowels', valid: false, label: '仅在两个元音之间', hint: '错误：元音间位置并非该变化的必要条件，词首同样变化。' },
        ],
        example: { source: '*pater', target: 'father' },
      },
      {
        id: 'grimm-2',
        title: '第二组辅音变化：清塞音 → 清擦音',
        from: 't',
        to: 'θ',
        description: 'PIE 清齿龈塞音 *t 变为齿间清擦音 θ（后在英语中写作 th）。请选择正确条件。',
        correctOptionId: 'onset',
        options: [
          { id: 'onset', valid: true, label: '音节首（包括词首）', hint: '正确：*t 在音节首位置推移为 θ，如 *tréyes → three。' },
          { id: 'after-s', valid: false, label: '紧跟在 s 之后', hint: '错误：*st 簇中的 t 受格里姆定律例外约束，保持为 t（如 *st-）。' },
          { id: 'word-final-only', valid: false, label: '仅出现在词尾', hint: '错误：该变化不限于词尾，three 的 θ 位于词首。' },
        ],
        example: { source: '*tréyes', target: 'three' },
      },
      {
        id: 'grimm-3',
        title: '第三组辅音变化：清塞音 → 清擦音',
        from: 'k',
        to: 'h',
        description: 'PIE 清软腭塞音 *k 变为声门清擦音 h。请选择正确条件。',
        correctOptionId: 'stressed',
        options: [
          { id: 'stressed', valid: true, label: '重读音节中的词首位置', hint: '正确：*k 在重读音节词首推移为 h，如 *ḱérd → heart。' },
          { id: 'after-s', valid: false, label: 's 后的辅音簇 sk 中', hint: '错误：s 后的清塞音不发生推移，sk 保持为 sk。' },
          { id: 'nasal', valid: false, label: '紧邻鼻音时', hint: '错误：鼻音邻接不是该推移的触发条件，反属其他音变范围。' },
        ],
        example: { source: '*ḱérd', target: 'heart' },
      },
    ],
    comparisons: [
      { proto: '*pṓtr', modern: 'father', gloss: '父亲' },
      { proto: '*tréyes', modern: 'three', gloss: '三' },
      { proto: '*ḱérd', modern: 'heart', gloss: '心脏' },
    ],
  },
  {
    id: 'grimm-voiced',
    name: '浊塞音清化推演',
    law: 'Grimm’s Law（浊塞音推移）',
    summary: '原始印欧语浊塞音在原始日耳曼语中清化为对应的清塞音。',
    formula: 'b → p · d → t · ɡ → k',
    color: '#34d399',
    steps: [
      {
        id: 'gd-1',
        title: '第一组辅音变化：浊塞音 → 清塞音',
        from: 'd',
        to: 't',
        description: 'PIE 浊齿龈塞音 *d 清化为清塞音 t。请选择该音变的发生条件。',
        correctOptionId: 'general',
        options: [
          { id: 'general', valid: true, label: '一般位置（词首/词中）', hint: '正确：*d 在日耳曼语一般位置清化为 t，如 *déḱm̥ → ten。' },
          { id: 'voiced-context', valid: false, label: '前后元音之间且保留浊音', hint: '错误：浊音环境不能阻止清化，日耳曼语结果仍是清塞音。' },
          { id: 'cluster', valid: false, label: '仅在擦音簇中', hint: '错误：清化不依赖擦音簇环境。' },
        ],
        example: { source: '*déḱm̥', target: 'ten' },
      },
      {
        id: 'gd-2',
        title: '第二组辅音变化：浊塞音 → 清塞音',
        from: 'ɡ',
        to: 'k',
        description: 'PIE 浊软腭塞音 *ɡ 清化为 k。请选择正确条件。',
        correctOptionId: 'general',
        options: [
          { id: 'general', valid: true, label: '重读音节中无条件', hint: '正确：*ɡ 在重读音节清化为 k，如 *ǵónu → knee。' },
          { id: 'before-u', valid: false, label: '仅在圆唇元音 u 前', hint: '错误：圆唇化属另一组唇化软腭音的演变，不是清化条件。' },
          { id: 'intervocalic', valid: false, label: '仅元音间且变为擦音', hint: '错误：格林定律给出的是清塞音 k，而非擦音。' },
        ],
        example: { source: '*ǵónu', target: 'knee' },
      },
      {
        id: 'gd-3',
        title: '第三组辅音变化：浊塞音 → 清塞音',
        from: 'b',
        to: 'p',
        description: 'PIE 浊双唇塞音 *b 清化为 p（PIE 中 *b 罕见）。请选择正确条件。',
        correctOptionId: 'general',
        options: [
          { id: 'general', valid: true, label: '一般音系位置', hint: '正确：*b 依同一推移链清化为 p。' },
          { id: 'labial-only', valid: false, label: '仅在唇音后', hint: '错误：音变本身针对 *b，不要求另一个唇音相邻。' },
          { id: 'final', valid: false, label: '仅词尾位置', hint: '错误：清化不局限于词尾。' },
        ],
        example: { source: '*-bʰ-', target: 'p-（推移链）' },
      },
    ],
    comparisons: [
      { proto: '*déḱm̥', modern: 'ten', gloss: '十' },
      { proto: '*ǵónu', modern: 'knee', gloss: '膝盖' },
      { proto: '*preb-', modern: '（*b 罕见）', gloss: '罕见音位' },
    ],
  },
]
