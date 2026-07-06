/** Bir AI çıktısının kalıcı sayfa adresi. `jobId` verilirse ilan-eşleştirme
 * bağlamındaki (job-scoped) rota kullanılır — aynı `AIOutput` varlığı hangi
 * ekrandan üretilirse üretilsin (CV Detay / İş Eşleştirme) aynı sayfaya çıkar. */
export function getAiOutputUrl(cvId: string, outputId: string, jobId?: string | null): string {
  return jobId
    ? `/jobs/${jobId}/match/${cvId}/outputs/${outputId}`
    : `/cvs/${cvId}/outputs/${outputId}`
}
