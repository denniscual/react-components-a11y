import React from 'react'
import {
  useIsomorphicLayoutEffect,
  useForceUpdate,
  KEYBOARD_KEYS,
} from '../utils'

export default function createDescendantsManager(name: string) {
  const DescendantsContext = React.createContext<DescendantsProps>(
    {} as DescendantsProps
  )
  DescendantsContext.displayName = name

  function DescendantsProvider({ children }: React.PropsWithChildren<{}>) {
    const [registeredElements, setRegisteredElements] = React.useState<
      HTMLElement[]
    >([])

    const ctxValue = React.useMemo(
      () => ({
        registerElement(element: HTMLElement) {
          setRegisteredElements((prevRegisteredElements) => {
            // If empty, push the element at the first slot.
            if (prevRegisteredElements.length === 0) {
              return [element]
            }

            // Check if the element is already on the array.
            // If yes, bail the updates.
            const foundIdx = prevRegisteredElements.findIndex(
              (prevElement) => prevElement === element
            )
            const foundElement = prevRegisteredElements[foundIdx]

            if (foundElement) {
              return prevRegisteredElements
            }

            // When registering an element, we need to make sure we insert in
            // into the array in the same order that it appears in the DOM. So as
            // new elements are added or maybe some are removed, we always know
            // that the array is up-to-date and correct.
            //
            // So here we look at our registered elements and see if the new
            // element we are adding appears earlier than an existing element's
            // DOM node via `node.compareDocumentPosition`. If it does, we insert
            // the new element at this index.
            //
            // Because `registerDescendant` will be
            // called in an effect every time the Parent component gets render,
            // we should be sure that this index is accurate when descendent
            // elements come or go from our component.
            const index = prevRegisteredElements.findIndex((prevElement) => {
              // Does this element's DOM node appear before another item in the
              // array in our DOM tree? If so, return true to grab the index at
              // this point in the array so we know where to insert the new
              // element.
              return Boolean(
                prevElement.compareDocumentPosition(element as Node) &
                  Node.DOCUMENT_POSITION_PRECEDING
              )
            })

            let newElements = []

            // If an index is not found we will push the element to the end.
            if (index === -1) {
              newElements = [...prevRegisteredElements, element]
            } else {
              newElements = [
                ...prevRegisteredElements.slice(0, index),
                element,
                ...prevRegisteredElements.slice(index),
              ]
            }

            return newElements
          })
        },
        findElementIdx(element: HTMLElement | null) {
          if (!element) {
            return -1
          }
          return registeredElements.findIndex(
            (prevElement) => prevElement === element
          )
        },
        /**
         * Will select the previous element based on the given element position.
         * If the given element is the first on the array, it will pick the last elmeent.
         * */
        getPrevElement(element: HTMLElement) {
          const idx = registeredElements.findIndex(
            (prevElement) => prevElement === element
          )
          if (idx === -1) {
            return null
          }
          const prevIdx =
            (idx + registeredElements.length - 1) % registeredElements.length

          return registeredElements[prevIdx]
        },
        /**
         * Will select the next element based on the given element position.
         * If the given element is the last on the array, it will pick the first element.
         * */
        getNextElement(element: HTMLElement) {
          const idx = registeredElements.findIndex(
            (prevElement) => prevElement === element
          )
          if (idx === -1) {
            return null
          }
          const nextIdx =
            (idx + registeredElements.length + 1) % registeredElements.length

          return registeredElements[nextIdx]
        },
        getHead() {
          const element = registeredElements[0]
          if (!element) {
            return null
          }
          return element
        },
        getTail() {
          const element = registeredElements[registeredElements.length - 1]
          if (!element) {
            return null
          }
          return element
        },
      }),
      [registeredElements]
    )

    return (
      <DescendantsContext.Provider value={ctxValue}>
        {children}
      </DescendantsContext.Provider>
    )
  }

  function useDescendantIdx({ element }: { element: HTMLElement | null }) {
    const { registerElement, findElementIdx } = useDescendantsContext()
    const forceUpdate = useForceUpdate()
    // in initial render, this will return -1 because the element is null.
    const descendantIndex = findElementIdx(element)

    // Use layout effect to prevent flashing.
    useIsomorphicLayoutEffect(() => {
      if (!element) {
        // Basically if you're accessing an element from a `ref` then you access the element
        // outside its Parent Component, the `element` will always be `null` unless the Component gets re-render. So force update in here is
        // a must to returned the element. But if you access the element inside its Parent Component or the
        // Component who use the `ref` on its element, then no need to force update because Component can access the element inside the
        // effect.
        forceUpdate()
        return
      }
      registerElement(element)
    }, [registerElement, element, forceUpdate])

    return descendantIndex
  }

  function useDescendantKeydown<T extends HTMLElement>({
    element,
  }: {
    element: T | null
  }): React.KeyboardEventHandler<T> {
    const {
      getPrevElement,
      getNextElement,
      getHead,
      getTail,
    } = useDescendantsContext()
    return React.useCallback(
      (event: React.KeyboardEvent<T>) => {
        // Check here if the key is supported to our keyboard navigation.
        if (!Object.values(KEYBOARD_KEYS).includes(event.key)) {
          return
        }

        if (element) {
          switch (event.key) {
            case KEYBOARD_KEYS.ARROW_DOWN: {
              const nextElement = getNextElement(element)
              // TODO: Warn the uesr if the nextElement is undefined.
              nextElement?.focus()
              break
            }
            case KEYBOARD_KEYS.ARROW_UP: {
              const prevElement = getPrevElement(element)
              prevElement?.focus()
              break
            }
            case KEYBOARD_KEYS.HOME: {
              const element = getHead()
              element?.focus()
              break
            }
            case KEYBOARD_KEYS.END: {
              const element = getTail()
              element?.focus()
              break
            }
          }
        }
      },
      [getNextElement, getPrevElement, getHead, getTail, element]
    )
  }

  function useDescendantsContext() {
    return React.useContext(DescendantsContext)
  }

  return {
    DescendantsProvider,
    useDescendantsContext,
    useDescendantIdx,
    useDescendantKeydown,
  }
}

export type DescendantsProps = {
  registerElement(element: HTMLElement): void
  findElementIdx(element: HTMLElement | null): number
  getPrevElement(element: HTMLElement): HTMLElement | null
  getNextElement(element: HTMLElement): HTMLElement | null
  getHead(): HTMLElement | null
  getTail(): HTMLElement | null
}
