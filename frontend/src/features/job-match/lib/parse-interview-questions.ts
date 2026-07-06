export interface ParsedQuestionSection {
  heading: string
  questions: string[]
}

const HEADING_RE = /^(teknik sorular|i̇?k sorular[ıi])\s*:?$/i
const QUESTION_RE = /^\d+[.)]\s*(.+)$/

/** AI'nin döndürdüğü mülakat hazırlığı metni yapılandırılmış bir alan değil,
 * serbest metin (bkz. build_interview_prep_prompt: "TEKNİK SORULAR:\n1. ...").
 * Gerçek OpenAI çıktısı bu formatı takip ederse sorular mini kartlara bölünür;
 * format tutmazsa (ör. mock sağlayıcı) null döner ve çağıran taraf düz metne
 * düşer — hiçbir soru uydurulmaz, sadece var olan metin best-effort ayrıştırılır. */
export function parseInterviewQuestions(content: string): ParsedQuestionSection[] | null {
  const lines = content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)

  const sections: ParsedQuestionSection[] = []
  let current: ParsedQuestionSection | null = null

  for (const line of lines) {
    if (HEADING_RE.test(line)) {
      current = { heading: line.replace(/:$/, ""), questions: [] }
      sections.push(current)
      continue
    }
    const match = line.match(QUESTION_RE)
    if (match) {
      if (!current) {
        current = { heading: "", questions: [] }
        sections.push(current)
      }
      current.questions.push(match[1])
    }
  }

  const totalQuestions = sections.reduce((sum, section) => sum + section.questions.length, 0)
  return totalQuestions >= 2 ? sections : null
}
