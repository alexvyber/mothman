import { chromeDark, chromeLight, Inspector } from "react-inspector"

import { useMothmanContext } from "../../../../utils/global-context"
import { Action, Theme } from "../../../types"
import { Modal } from "../../ui/modal"

interface Props extends Pick<React.ComponentProps<typeof Modal>, "close" | "isOpen"> {}

export function ActionModal({ isOpen, close }: Props) {
  const { dispatch, globalState } = useMothmanContext()

  return (
    <Modal
      maxWidth="60em"
      isOpen={isOpen}
      close={close}
      label="Dialog with a log of events triggered by user."
    >
      {globalState.action.map((action, index) => (
        <Inspector
          table={false}
          key={index}
          sortObjectKeys={true}
          theme={
            {
              ...(globalState.theme === Theme.Light ? chromeLight : chromeDark),
              BASE_BACKGROUND_COLOR: "var(--moth-bg-color-secondary)",
            } as any
          }
          showNonenumerable={false}
          name={action.name}
          data={action.event}
        />
      ))}

      <button
        onClick={() => dispatch({ type: Action.UpdateAction, payload: { clear: true } })}
        type="button"
      >
        Clear actions
      </button>
    </Modal>
  )
}
