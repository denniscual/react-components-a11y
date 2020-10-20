import React from 'react'
import { useIsomorphicLayoutEffect } from '../utils'

// TODO
// - review our util
// - review and abstract some of the utils which we can use for MultiSelect.
// - make the AccordionPanel accepts any html like div, section or etc.
// - handle the ref
// - make some Components polymorphic in terms of their rendered root elements.

/**
 * WAI-ARIA Accordion specs - https://www.w3.org/TR/wai-aria-practices-1.2/#accordion
 * */

/**
 *
 * The `AccordionPanel` returns an host elemnt without a `role` prop. The user will decide if he/she
 * gonna add it or now. There is section on the WAI-ARIA Accordion specs which talks about the
 * the "cons" of using a region role. - https://www.w3.org/TR/wai-aria-practices-1.2/#wai-aria-roles-states-and-properties
 * */

// ---------------------------------------- //
// ---------------------------------------- //
// Single Accordion
//
// The Accordion only shows 0 or 1 panel at a time. This is distinguished by the `type`.
// As default, SingleAccordion will always shows 1 panel a time. But this can be change
// by passing a `type` value `collapsible`. In this behaviour, the Accordion can show atleast 0 or 1 panel.
// -----------------------------------------//
// -----------------------------------------//

enum SingleAccordionTypes {
  tabbed = 'tabbed',
  collapsible = 'collapsible',
}

function SingleAccordion({
  activeIdx = 0,
  type = SingleAccordionTypes.tabbed,
  children,
  /**
   * The prop is not required but it is recommended to pass an `id` if
   * the page has multiple instance of `SingleAccordion`.
   * */
  id = 'single-accordion',
  ...otherProps
}: {
  activeIdx?: number
  type?: SingleAccordionTypes
  // The unique id of the SingleAccordion. This is required for a lot of reasons
  // like leveraging the support for navigation. Right now, we will just rely
  // on an `id` beacuse I don't want to have a fancy solution for some keyboard problems.
  id?: string
} & JSX.IntrinsicElements['div']) {
  const activeIdxState = React.useState(activeIdx)
  const value = React.useMemo(
    () => ({
      activeIdx: activeIdxState,
      type,
      id,
    }),
    [activeIdxState, type, id]
  )
  return (
    <DescendantsProvider>
      <SingleAccordionContext.Provider value={value}>
        <div {...otherProps}>{children}</div>
      </SingleAccordionContext.Provider>
    </DescendantsProvider>
  )
}

SingleAccordion.Item = AccordionItem
SingleAccordion.Button = AccordionButton
SingleAccordion.Panel = AccordionPanel

function useSingleAccordionCtx() {
  const ctx = React.useContext(SingleAccordionContext)
  if (typeof ctx === 'undefined') {
    throw new Error(
      `Consuming "SingleAccordionContext" outside its "Provider" can lead to error.`
    )
  }
  return ctx
}

const SingleAccordionContext = React.createContext<
  | {
      activeIdx: [number, React.Dispatch<React.SetStateAction<number>>]
      type: SingleAccordionTypes
      id: string
    }
  | undefined
>(undefined)

function useDescendantIdx({ element }: { element: HTMLElement | null }) {
  const { registerElement, findElementIdx } = React.useContext(
    DescendantsContext
  )
  const [, forceUpdate] = React.useState(() => ({}))
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
      forceUpdate({})
      return
    }
    registerElement(element)
  }, [registerElement, element])

  return descendantIndex
}

function useDescendantKeydown<T extends HTMLElement>({
  element,
}: {
  element: T | null
}): React.KeyboardEventHandler<T> {
  const { getPrevElement, getNextElement } = React.useContext(
    DescendantsContext
  )
  return React.useCallback(
    (event: React.KeyboardEvent<T>) => {
      if (element) {
        if (event.key === KEYBOARD_KEYS.ARROW_DOWN) {
          const nextElement = getNextElement(element)
          // TODO: Warn the uesr if the nextElement is undefined.
          nextElement?.focus()
        }
        if (event.key === KEYBOARD_KEYS.ARROW_UP) {
          const prevElement = getPrevElement(element)
          prevElement?.focus()
        }
      }
    },
    [getNextElement, getPrevElement, element]
  )
}

function DescendantsProvider({ children }: React.PropsWithChildren<{}>) {
  const [registeredElements, setRegisteredElements] = React.useState<
    HTMLElement[]
  >([])

  const registrar = React.useMemo(
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
    }),
    [registeredElements]
  )

  return (
    <DescendantsContext.Provider value={registrar}>
      {children}
    </DescendantsContext.Provider>
  )
}

const DescendantsContext = React.createContext<DescendantsProps>(
  {} as DescendantsProps
)

type DescendantsProps = {
  registerElement(element: HTMLElement): void
  findElementIdx(element: HTMLElement | null): number
  getPrevElement(element: HTMLElement): HTMLElement | null
  getNextElement(element: HTMLElement): HTMLElement | null
}

function AccordionItem({ children }: AccordionItemProps) {
  const { id: singleAccordionId } = useSingleAccordionCtx()
  const buttonEl = React.useRef<HTMLButtonElement | null>(null)

  const index = useDescendantIdx({ element: buttonEl.current })
  const itemId = makeId(`${singleAccordionId}-item`, index)
  const buttonId = makeId(itemId, 'button')
  const panelId = makeId(itemId, 'panel')

  const ctxValue = {
    idx: index,
    buttonId,
    panelId,
    buttonRef: buttonEl,
  }

  return (
    <AccordionItemContext.Provider value={ctxValue}>
      <div id={itemId}>{children}</div>
    </AccordionItemContext.Provider>
  )
}

// TODO: Remove the id prop? Make the app generate its own id???
type AccordionItemProps = React.PropsWithChildren<
  {} & JSX.IntrinsicElements['div']
>

function useAccordionItemCtx() {
  const ctx = React.useContext(AccordionItemContext)
  if (typeof ctx === 'undefined') {
    throw new Error(
      `Consuming "AccordionItemContext" outside its "Provider" can lead to error.`
    )
  }
  return ctx
}

const AccordionItemContext = React.createContext<
  | {
      idx: number
      buttonId: string
      panelId: string
      buttonRef: React.MutableRefObject<HTMLButtonElement | null>
    }
  | undefined
>(undefined)

const KEYBOARD_KEYS = {
  ARROW_DOWN: 'ArrowDown',
  ARROW_UP: 'ArrowUp',
}

function AccordionButton(
  props: Omit<JSX.IntrinsicElements['button'], 'onClick'>
) {
  const { idx, buttonRef, buttonId, panelId } = useAccordionItemCtx()
  const { activeIdx: activeIdxState, type } = useSingleAccordionCtx()
  const [activeIdx, setActiveIdx] = activeIdxState
  const isActive = idx === activeIdx

  // The aria props are different based on the type. If the type is `collapsible`,
  // we will not add `aria-disabled` to the button.

  const defaultAriaProps = {
    'aria-expanded': isActive,
    'aria-controls': panelId,
  }

  const ariaProps =
    type === SingleAccordionTypes.tabbed
      ? {
          ...defaultAriaProps,
          'aria-disabled': isActive,
        }
      : { ...defaultAriaProps }

  function handleClick() {
    if (type === SingleAccordionTypes.tabbed) {
      setActiveIdx(idx)
    } else {
      if (isActive) {
        setActiveIdx(-1)
      } else {
        setActiveIdx(idx)
      }
    }
  }

  const handleKeyDown = useDescendantKeydown<HTMLButtonElement>({
    element: buttonRef.current,
  })

  return (
    <button
      ref={buttonRef}
      {...props}
      {...ariaProps}
      id={buttonId}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    />
  )
}

function AccordionPanel(props: JSX.IntrinsicElements['div']) {
  const { idx, panelId, buttonId } = useAccordionItemCtx()
  const { activeIdx: activeIdxState } = useSingleAccordionCtx()
  const [activeIdx] = activeIdxState

  return (
    <div
      {...props}
      /**
       * Some screen readers when using "Up" and "Down" keys, it will not
       * jump the focus on next accordion header, but will jump to the active panel.
       * Because of this, we will make this "div" focusable.
       * */
      tabIndex={-1}
      aria-labelledby={buttonId}
      id={panelId}
      hidden={idx !== activeIdx}
      role="region"
    />
  )
}

function makeId(label: string, anotherLabel: number | string) {
  return `${label}-${anotherLabel}`
}

function useLazyRef<T>(cb: () => T) {
  const lazyRef = React.useRef<T | null>(null)
  if (!lazyRef.current) {
    lazyRef.current = cb()
  }
  return lazyRef.current
}

function classNames(...classNames: string[]) {
  return classNames
    .filter(Boolean)
    .reduce((acc, value) => acc.concat(` ${value}`), '')
    .trim()
}

export { SingleAccordion, SingleAccordionTypes }
