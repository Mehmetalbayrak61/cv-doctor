import { useEffect, useState } from "react"

import { UpgradeModal } from "./upgrade-modal"
import { subscribeUpgradeModal } from "./upgrade-modal-bus"

export function UpgradeModalProvider() {
  const [open, setOpen] = useState(false)

  useEffect(() => subscribeUpgradeModal(() => setOpen(true)), [])

  return <UpgradeModal open={open} onOpenChange={setOpen} />
}
