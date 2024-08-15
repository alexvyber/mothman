import type { RequestHandler } from "msw"
import { args, argTypes } from "virtual:stories"

import { useMemo, useRef } from "react"

import { StoryDecorator } from "../src/types"
import { useMothmanContext } from "../utils/global-context"
import ArgsProvider from "./args-provider"
import { Msw } from "./msw"

export default function composeEnhancers(module: any, storyName: string) {
  let decorators = [] as StoryDecorator[]
  let parameters = {} as Record<string, any>
  let mswHandlers = [] as RequestHandler[]

  if (module.default?.msw) {
    mswHandlers = module.default.msw
  }

  if (module[storyName]?.msw) {
    mswHandlers = module[storyName].msw
  }

  const props = {
    args: {
      ...args,
      ...(module.default?.args ? module.default.args : {}),
      ...(module[storyName].args ? module[storyName].args : {}),
    },

    argTypes: {
      ...argTypes,
      ...(module.default?.argTypes ? module.default.argTypes : {}),
      ...(module[storyName].argTypes ? module[storyName].argTypes : {}),
    },

    component: module[storyName],
  }

  if (module[storyName] && Array.isArray(module[storyName].decorators)) {
    decorators = [...decorators, ...module[storyName].decorators]
  }

  if (module.default && Array.isArray(module.default.decorators)) {
    decorators = [...decorators, ...module.default.decorators]
  }

  parameters = {
    ...(module.default?.parameters ? module.default.parameters : {}),
    ...(module[storyName].parameters ? module[storyName].parameters : {}),
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
          args[key] = entry.value
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
