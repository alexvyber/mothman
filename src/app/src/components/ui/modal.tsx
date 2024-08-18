import { DialogContent, DialogOverlay } from "../../../../vendor/dialog"
import { Close } from "../icons"
import { Button } from "./button"

interface Props extends React.PropsWithChildren {
  close: () => void
  isOpen: boolean
  label?: string
  maxWidth?: string
}

export function Modal({ children, close, isOpen, label, maxWidth = "40em" }: Props) {
  return (
    // @ts-expect-error
    <DialogOverlay
      isOpen={isOpen}
      onDismiss={close}
      data-testid="moth-dialog-overlay"
    >
      {/* @ts-expect-error */}
      <DialogContent
        aria-label={label || "Modal"}
        data-testid="moth-dialog"
        style={{ maxWidth }}
      >
        <div className="absolute end-1.5 top-0">
          <Button
            onClick={close}
            aria-label="Close modal"
            className="h-9 w-9 border-none shadow-none"
          >
            <Close />
          </Button>
        </div>
        <div className="moth-addon-modal-body max-h-[80vh] overflow-auto">{children}</div>
      </DialogContent>
    </DialogOverlay>
  )
}
