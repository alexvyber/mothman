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
        <div style={{ position: "absolute", insetInlineEnd: "-6px", top: "0px" }}>
          <Button
            onClick={close}
            aria-label="Close modal"
            style={{ height: "36px", width: "36px", borderColor: "transparent", boxShadow: "none" }}
          >
            <Close />
          </Button>
        </div>
        <div className="moth-addon-modal-body">{children}</div>
      </DialogContent>
    </DialogOverlay>
  )
}
