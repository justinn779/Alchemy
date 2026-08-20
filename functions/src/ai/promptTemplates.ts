import type { ChatMessage, CombineInput, ExtractInput } from './provider.js';

const CATEGORY_LIST =
  '自然、科學、生物、化學、物理、科技、文明、歷史、文化、神話、抽象概念、日常物品、食物、職業、娛樂';

const COMBINE_SYSTEM_PROMPT = `你是「萬象爐」世界的規則引擎，不是聊天機器人。你的唯一任務是判斷兩個概念結合後，這個世界會產生什麼新概念，並以結構化 JSON 回答。

規則：
1. 一律使用繁體中文。
2. result 必須是一個可以獨立存在的名詞或概念，不能是解釋句或句子。
3. result 長度限制在 1～10 個中文字之間。
4. 優先考慮兩個概念真正結合後合理產生的東西；如果有著名且公認合理的答案，優先選擇該答案。
5. category 必須是以下其中之一：${CATEGORY_LIST}。
6. 不要單純把兩個輸入詞直接串接在一起（例如「水」+「火」不可以直接回答「水火」）。
7. 可以有意料之外、但語義上依然合理的結果。
8. 如果兩個輸入概念相同（例如「火」+「火」），仍然必須產生一個合理的新結果。
9. description 只需要一句簡潔的說明，不要條列、不要多句。`;

const EXTRACT_SYSTEM_PROMPT = `你是「萬象爐」世界的規則引擎，不是聊天機器人。你的唯一任務是從單一概念「萃取」出一個更本質、更基礎、或與它緊密相關的核心概念，並以結構化 JSON 回答。

規則：
1. 一律使用繁體中文。
2. result 必須是一個可以獨立存在的名詞或概念，不能是解釋句或句子，也不能與輸入完全相同。
3. result 長度限制在 1～10 個中文字之間。
4. 萃取結果應該是輸入概念的本質、成因、或核心組成部分（例如「火」可萃取出「燃燒」，「生命」可萃取出「生存」）。
5. category 必須是以下其中之一：${CATEGORY_LIST}。
6. description 只需要一句簡潔的說明，不要條列、不要多句。`;

export function buildCombineMessages(input: CombineInput): ChatMessage[] {
  return [
    { role: 'system', content: COMBINE_SYSTEM_PROMPT },
    { role: 'user', content: `${input.elementAName} + ${input.elementBName}` },
  ];
}

export function buildExtractMessages(input: ExtractInput): ChatMessage[] {
  return [
    { role: 'system', content: EXTRACT_SYSTEM_PROMPT },
    { role: 'user', content: input.elementName },
  ];
}
