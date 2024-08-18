import type { RequestHandler } from "msw"
import { args, argTypes } from "virtual:stories"

import { useMemo, useRef } from "react"

import { StoryDecorator } from "../src/types"
import { useMothmanContext } from "../utils/global-context"
import ArgsProvider from "./args-provider"
import { Msw } from "./msw"

export default function composeEnhancers(module: any, storyName: string) {
  let decorators = [] as StoryDecorator[]
  let mswHandlers = [] as RequestHandler[]
  const parameters = {} as Record<string, any>

  const props = {
    args: { ...args },
    argTypes: { ...argTypes },
    component: module[storyName],
  }

  if (module.default?.parameters) Object.assign(parameters, module.default.parameters)
  if (module[storyName].parameters) Object.assign(parameters, module[storyName].parameters)

  if (module.default?.msw) {
    mswHandlers = module.default.msw
  }

  if (module[storyName]?.msw) {
    mswHandlers = module[storyName].msw
  }

  if (module?.default?.args) Object.assign(props.args, module.default.args)
  if (module[storyName]?.args) Object.assign(props.args, module[storyName].args)

  if (module.default?.argTypes) Object.assign(props.argTypes, module.default.argTypes)
  if (module[storyName]?.argTypes) Object.assign(props.argTypes, module[storyName].argTypes)

  if (module[storyName] && Array.isArray(module[storyName].decorators)) {
    decorators = [...decorators, ...module[storyName].decorators]
  }

  if (module.default && Array.isArray(module.default.decorators)) {
    decorators = [...decorators, ...module.default.decorators]
  }

  return function RenderDecoratedStory() {
    const { globalState, dispatch } = useMothmanContext()

    const WithArgs = useMemo(
      () => () => (
        <Msw msw={mswHandlers}>
          <ArgsProvider {...props} />
        </Msw>
      ),
      []
    )

    if (decorators.length === 0) return <WithArgs />

    const getBindedDecorator = (i: number) => {
      return useRef(() => {
        const args = {} as Record<string, any>

        for (const [key, entry] of Object.entries(globalState.control)) {
          Object.assign(args, { [key]: entry.value })
        }

        const decorator = decorators[i]

        const decorated = decorator(i === 0 ? WithArgs : getBindedDecorator(i - 1), {
          globalState,
          dispatch,
          parameters,
          argTypes: props.argTypes,
          args,
        })

        return decorated
      }).current
    }

    const Decorated = getBindedDecorator(decorators.length - 1)

    return globalState.controlInitialized ? <Decorated /> : <WithArgs />
  }
}
