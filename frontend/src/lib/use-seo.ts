import { useEffect } from "react"

const SITE_URL = "https://app.cvdoktoru.com.tr"
const SITE_NAME = "CV Doktoru"

interface SeoOptions {
  /** Sayfaya özel başlık — site adıyla birlikte gösterilir (ör. "Fiyatlandırma — CV Doktoru"). */
  title: string
  description: string
  /** Kanonik/OG URL için yol, ör. "/pricing". */
  path: string
}

function setMetaTag(attr: "name" | "property", key: string, content: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement("meta")
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute("content", content)
}

function setCanonical(href: string) {
  let el = document.querySelector('link[rel="canonical"]')
  if (!el) {
    el = document.createElement("link")
    el.setAttribute("rel", "canonical")
    document.head.appendChild(el)
  }
  el.setAttribute("href", href)
}

/** Rota bazlı SEO meta etiketlerini (title, description, OpenGraph, canonical)
 * client-side'da günceller — yeni bir kütüphane eklemeden, tek sayfalık
 * uygulamada her rotanın kendi meta bilgisini taşımasını sağlar. */
export function useSeo({ title, description, path }: SeoOptions) {
  useEffect(() => {
    const fullTitle = `${title} — ${SITE_NAME}`
    const url = `${SITE_URL}${path}`

    document.title = fullTitle
    setMetaTag("name", "description", description)
    setMetaTag("property", "og:title", fullTitle)
    setMetaTag("property", "og:description", description)
    setMetaTag("property", "og:url", url)
    setMetaTag("name", "twitter:title", fullTitle)
    setMetaTag("name", "twitter:description", description)
    setCanonical(url)
  }, [title, description, path])
}
