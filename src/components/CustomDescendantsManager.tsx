import React from 'react'
import {
  useIsomorphicLayoutEffect,
  useForceUpdate,
  KEYBOARD_KEYS,
} from '../utils'

export default function createDescendantsManager(name: string) {
  const DescendantsContext = React.createContext<DescendantsContextType>(({
    descendants: [],
    setDecendants: () => {},
  } as unknown) as DescendantsContextType)
  DescendantsContext.displayName = name

  function DescendantsProvider({ children }: React.PropsWithChildren<{}>) {
    const [registeredDescendants, setRegisteredDescendants] = React.useState<
      DescendantsType
    >([])

    const ctxValue = React.useMemo(
      () => ({
        descendants: registeredDescendants,
        registerDescendant(
          element: HTMLElement,
          others: Record<string, any> = {}
        ) {
          setRegisteredDescendants((prevRegisteredDescendants) => {
            // If empty, push the element at the first slot.
            if (prevRegisteredDescendants.length === 0) {
              return [{ element, others }]
            }

            // Check if the element is already on the array.
            // If yes, bail the updates.
            const foundIdx = prevRegisteredDescendants.findIndex(
              ({ element: prevElement }) => prevElement === element
            )
            const foundElement = prevRegisteredDescendants[foundIdx]

            if (foundElement) {
              return prevRegisteredDescendants
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
            const index = prevRegisteredDescendants.findIndex(
              ({ element: prevElement }) => {
                // Does this element's DOM node appear before another item in the
                // array in our DOM tree? If so, return true to grab the index at
                // this point in the array so we know where to insert the new
                // element.
                return Boolean(
                  prevElement.compareDocumentPosition(element as Node) &
                    Node.DOCUMENT_POSITION_PRECEDING
                )
              }
            )

            let newElements = []

            // If an index is not found we will push the element to the end.
            if (index === -1) {
              newElements = [...prevRegisteredDescendants, { element, others }]
            } else {
              newElements = [
                ...prevRegisteredDescendants.slice(0, index),
                { element, others },
                ...prevRegisteredDescendants.slice(index),
              ]
            }

            return newElements
          })
        },
        findDescendantByIdx(idx: number) {
          const descendant = registeredDescendants[idx]
          if (!descendant) {
            return null
          }
          return descendant
        },
        findDescendantIdx(element: HTMLElement | null) {
          if (!element) {
            return -1
          }
          return registeredDescendants.findIndex(
            ({ element: prevElement }) => prevElement === element
          )
        },
        /**
         * Will select the previous element based on the given element position.
         * If the given element is the first on the array, it will pick the last elmeent.
         * */
        getPrevElement(element: HTMLElement) {
          const idx = registeredDescendants.findIndex(
            ({ element: prevElement }) => prevElement === element
          )
          if (idx === -1) {
            return null
          }
          const prevIdx =
            (idx + registeredDescendants.length - 1) %
            registeredDescendants.length

          return registeredDescendants[prevIdx].element
        },
        /**
         * Will select the next element based on the given element position.
         * If the given element is the last on the array, it will pick the first element.
         * */
        getNextElement(element: HTMLElement) {
          const idx = registeredDescendants.findIndex(
            ({ element: prevElement }) => prevElement === element
          )
          if (idx === -1) {
            return null
          }
          const nextIdx =
            (idx + registeredDescendants.length + 1) %
            registeredDescendants.length

          return registeredDescendants[nextIdx].element
        },
        getHead() {
          const { element } = registeredDescendants[0]
          if (!element) {
            return null
          }
          return element
        },
        getTail() {
          const { element } = registeredDescendants[
            registeredDescendants.length - 1
          ]
          if (!element) {
            return null
          }
          return element
        },
        setDecendants: setRegisteredDescendants,
      }),
      [registeredDescendants]
    )

    return (
      <DescendantsContext.Provider value={ctxValue}>
        {children}
      </DescendantsContext.Provider>
    )
  }

  /**
   *  When registering descendant, at the background it creates the `index` order of the
   *  the registered descendant based on the the DOM Position of the element.
   *  This function will return the index and the descendant.
   *  Defaulted to null if the index is -1. Initially the index is -1 when
   *  accessing inside render because regisration happens inside effect cb.
   * */
  function useRegisterDescendant<T extends Record<string, any> = {}>({
    element,
    others,
  }: {
    element: HTMLElement | null
    others?: T
  }) {
    const {
      descendants,
      registerDescendant,
      findDescendantIdx,
    } = useDescendantsContext()
    const forceUpdate = useForceUpdate()
    // in initial render, this will return -1 because the element is null.
    const descendantIndex = findDescendantIdx(element)

    // We need to return the descendant from the `descendants` data to get the
    // updated descendant information. Mostly the updated information is the passed `others` data or possibly the index.
    const ownDescendant =
      descendantIndex > -1 ? descendants[descendantIndex] : null

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
      registerDescendant(element, others)
    }, [registerDescendant, element, forceUpdate, others])

    /*  */

    if (descendantIndex < 0) {
      return null
    }

    return ({
      index: descendantIndex,
      descendant: ownDescendant,
    } as unknown) as { index: number; descendant: DescendantType<T> }
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

  function useDescendantsState<T extends Record<string, any> = {}>() {
    const ctx = useDescendantsContext()
    return ([ctx.descendants, ctx.setDecendants] as unknown) as [
      DescendantsType<T>,
      React.Dispatch<React.SetStateAction<DescendantsType<T>>>
    ]
  }

  function useDescendantsContext() {
    return React.useContext(DescendantsContext)
  }

  return {
    DescendantsProvider,
    useDescendantsContext,
    useRegisterDescendant,
    useDescendantKeydown,
    useDescendantsState,
  }
}

// TODO: Add the `removeDescendant`.
export type DescendantsContextType = {
  descendants: DescendantsType
  /**
   * `others` is an object that accepts arbitrary value based on the needs of the consumer.
   * This property must be used sparingly. In most cased, `element` is sufficed.
   * */
  registerDescendant(element: HTMLElement, others?: Record<string, any>): void
  findDescendantIdx(element: HTMLElement | null): number
  findDescendantByIdx(
    idx: number
  ): {
    element: HTMLElement
    others: Record<string, any>
  } | null
  getPrevElement(element: HTMLElement): HTMLElement | null
  getNextElement(element: HTMLElement): HTMLElement | null
  getHead(): HTMLElement | null
  getTail(): HTMLElement | null
  /**
   * This setter is an escape hatch function to update the `other` data of
   * the descendants. If you use this to add or remove a descendant, you need to makre
   * sure to get the correct order of element based on its DOM position relative to it siblings.
   * Because of this, this setter is not recommented for manipulating the structure of the
   * descendants. Instead use the `registerDescendant` or `removeDescendant`
   * for changing the size of the descendants.
   * */
  setDecendants: React.Dispatch<React.SetStateAction<DescendantsType>>
}

export type DescendantsType<
  T extends Record<string, any> = {}
> = DescendantType<T>[]

export interface DescendantType<T extends Record<string, any>> {
  element: HTMLElement
  others: T
}
