import React from 'react'

// TODO
// - add keyboard binding.
// - review and abstract some of the utils which we can use for MultiSelect.
// - make the AccordionPanel accepts any html like div, section or etc.
// - handle the ref

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

const KEYBOARD_KEYS = {
  ARROW_DOWN: 'ArrowDown',
  ARROW_UP: 'ArrowUp',
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

type DOMTreeRegistrar = {
  registerElement(element: HTMLElement): void
  unRegisterElement(element: HTMLElement): void
  findElementIdx(element: HTMLElement): number
  getPrevElement(element: HTMLElement): HTMLElement | null
  getNextElement(element: HTMLElement): HTMLElement | null
}

const DOMTreeContext = React.createContext<DOMTreeRegistrar>(
  {} as DOMTreeRegistrar
)

function DOMTreeProvider({ children }: React.PropsWithChildren<{}>) {
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
      unRegisterElement(element: HTMLElement) {
        // Here if un-register, we need to update the tree
        // via removing the element on the array and call setState.
        const index = registeredElements.findIndex(
          (prevElement) => prevElement === element
        )
        if (index === -1) {
          return
        }
        return registeredElements.slice().splice(index, 1)
      },
      findElementIdx(element: HTMLElement) {
        return registeredElements.findIndex(
          (prevElement) => prevElement === element
        )
      },
      getPrevElement(element: HTMLElement) {
        const index = registeredElements.findIndex(
          (prevElement) => prevElement === element
        )

        if (index === -1) {
          return null
        }

        const prevIdx =
          (index + registeredElements.length - 1) % registeredElements.length

        return registeredElements[prevIdx]
      },
      getNextElement(element: HTMLElement) {
        const index = registeredElements.findIndex(
          (prevElement) => prevElement === element
        )
        if (index === -1) {
          return null
        }
        const nextIdx =
          (index + registeredElements.length + 1) % registeredElements.length

        return registeredElements[nextIdx]
      },
    }),
    [registeredElements]
  )

  return (
    <DOMTreeContext.Provider value={registrar}>
      {children}
    </DOMTreeContext.Provider>
  )
}

enum SingleAccordionTypes {
  tabbed = 'tabbed',
  collapsible = 'collapsible',
}

const SingleAccordionContext = React.createContext<
  | {
      activeIdx: [number, React.Dispatch<React.SetStateAction<number>>]
      type: SingleAccordionTypes
      id: string
    }
  | undefined
>(undefined)

function useSingleAccordionCtx() {
  const ctx = React.useContext(SingleAccordionContext)
  if (typeof ctx === 'undefined') {
    throw new Error(
      `Consuming "SingleAccordionContext" outside its "Provider" can lead to error.`
    )
  }
  return ctx
}

const AccordionItemContext = React.createContext<number | undefined>(undefined)

function useAccordionItemCtx() {
  const ctx = React.useContext(AccordionItemContext)
  if (typeof ctx === 'undefined') {
    throw new Error(
      `Consuming "AccordionItemContext" outside its "Provider" can lead to error.`
    )
  }
  return ctx
}

type AccordionItemProps = React.PropsWithChildren<{ idx: number }>

function AccordionItem({ idx, children }: AccordionItemProps) {
  return (
    <AccordionItemContext.Provider value={idx}>
      {children}
    </AccordionItemContext.Provider>
  )
}

function createSemanticId(parentId: string, order: number, type: string) {
  return `${parentId}-${order}-${type}`
}

function AccordionButton(
  props: Omit<JSX.IntrinsicElements['button'], 'onClick'>
) {
  const accordionItemCtx = useAccordionItemCtx()
  const {
    activeIdx: activeIdxState,
    type,
    id: singleAccordionId,
  } = useSingleAccordionCtx()
  const [activeIdx, setActiveIdx] = activeIdxState
  const isActive = accordionItemCtx === activeIdx

  // The aria props are different based on the type. If the type is `collapsible`,
  // we will not add `aria-disabled` to the button.

  const defaultAriaProps = {
    'aria-expanded': isActive,
    'aria-controls': createSemanticId(
      singleAccordionId,
      accordionItemCtx,
      'panel'
    ),
  }

  const ariaProps =
    type === SingleAccordionTypes.tabbed
      ? {
          ...defaultAriaProps,
          'aria-disabled': isActive,
        }
      : { ...defaultAriaProps }

  const buttonId = createSemanticId(
    singleAccordionId,
    accordionItemCtx,
    'button'
  )

  function handleClick() {
    if (type === SingleAccordionTypes.tabbed) {
      setActiveIdx(accordionItemCtx)
    } else {
      if (isActive) {
        setActiveIdx(-1)
      } else {
        setActiveIdx(accordionItemCtx)
      }
    }
  }

  const domRegistrar = React.useContext(DOMTreeContext)
  const buttonEl = React.useRef<HTMLButtonElement | null>(null)

  React.useLayoutEffect(() => {
    if (buttonEl.current) {
      domRegistrar.registerElement(buttonEl.current)
    }
  }, [domRegistrar])

  React.useEffect(() => {
    if (buttonEl.current) {
      const currentButtonEl = buttonEl.current
      return () => domRegistrar.unRegisterElement(currentButtonEl)
    }
  }, [domRegistrar])

  const handleKeyDown: React.KeyboardEventHandler<HTMLButtonElement> = (
    event
  ) => {
    if (buttonEl.current) {
      if (event.key === KEYBOARD_KEYS.ARROW_DOWN) {
        const nextElement = domRegistrar.getNextElement(buttonEl.current)
        nextElement?.focus()
      }
      if (event.key === KEYBOARD_KEYS.ARROW_UP) {
        const prevElement = domRegistrar.getNextElement(buttonEl.current)
        prevElement?.focus()
      }
    }
  }

  return (
    <button
      ref={buttonEl}
      id={buttonId}
      {...ariaProps}
      {...props}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    />
  )
}

function AccordionPanel(props: JSX.IntrinsicElements['div']) {
  const accordionItemCtx = useAccordionItemCtx()
  const {
    activeIdx: activeIdxState,
    id: singleAccordionId,
  } = useSingleAccordionCtx()
  const [activeIdx] = activeIdxState

  return (
    <div
      aria-labelledby={createSemanticId(
        singleAccordionId,
        accordionItemCtx,
        'button'
      )}
      id={createSemanticId(singleAccordionId, accordionItemCtx, 'panel')}
      {...props}
      hidden={accordionItemCtx !== activeIdx}
    />
  )
}

function SingleAccordion({
  activeIdx = 0,
  type = SingleAccordionTypes.tabbed,
  children,
  id,
  ...otherProps
}: {
  activeIdx?: number
  type?: SingleAccordionTypes
  // The unique id of the SingleAccordion. This is required for a lot of reasons
  // like leveraging the support for navigation. Right now, we will just rely
  // on an `id` beacuse I don't want to have a fancy solution for some keyboard problems.
  id: string
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
    <DOMTreeProvider>
      <SingleAccordionContext.Provider value={value}>
        <div {...otherProps}>{children}</div>
      </SingleAccordionContext.Provider>
    </DOMTreeProvider>
  )
}

SingleAccordion.Item = AccordionItem
SingleAccordion.Button = AccordionButton
SingleAccordion.Panel = AccordionPanel

export { SingleAccordion, SingleAccordionTypes }
