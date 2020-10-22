import React from 'react'
import createDescendantsManager from './DescendantsManager'
import {
  makeId,
  useForkedRef,
  wrapEventHandler,
  forwardRefWithAs,
} from '../utils'

// ---------------------------------------- //
// ---------------------------------------- //
// Single Accordion
//
// The Accordion only shows 0 or 1 panel at a time. This is distinguished by the `type`.
// As default, SingleAccordion will always shows 1 panel a time. But this can be change
// by passing a `type` value `collapsible`. In this behaviour, the Accordion can show atleast 0 or 1 panel.
// -----------------------------------------//
// -----------------------------------------//

const {
  DescendantsProvider,
  useDescendantIdx,
  useDescendantKeydown,
} = createDescendantsManager('SingleAccordionDescendants')

enum SingleAccordionTypes {
  tabbed = 'tabbed',
  collapsible = 'collapsible',
}

type SingleAccordionProps = {
  activeIdx?: number
  type?: SingleAccordionTypes
  id?: string
}

const SingleAccordion = forwardRefWithAs<
  HTMLDivElement,
  SingleAccordionProps,
  'div'
>(function SingleAccordion(
  {
    as: Comp = 'div',
    id = 'single-accordion',
    activeIdx = 0,
    type = SingleAccordionTypes.tabbed,
    ...otherProps
  },
  forwardRef
) {
  const activeIdxState = React.useState(activeIdx)
  const value = React.useMemo(
    () => ({
      activeIdx: activeIdxState,
      type,
      id,
    }),
    [activeIdxState, id, type]
  )
  return (
    <DescendantsProvider>
      <SingleAccordionContext.Provider value={value}>
        <Comp ref={forwardRef} {...otherProps} />
      </SingleAccordionContext.Provider>
    </DescendantsProvider>
  )
})

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

const SingleAccordionItem = forwardRefWithAs<
  HTMLDivElement,
  {},
  'div',
  { id: string }
>(function SingleAccordionItem(
  { as: Comp = 'div', ...otherProps },
  forwardRef
) {
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
      <Comp ref={forwardRef} id={itemId} {...otherProps} />
    </AccordionItemContext.Provider>
  )
})

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

const SingleAccordionButton = forwardRefWithAs<HTMLButtonElement, {}, 'button'>(
  function SingleAccordionButton(
    { as: Comp = 'button', ...otherProps },
    forwardRef
  ) {
    const { idx, buttonRef: ownRef, buttonId, panelId } = useAccordionItemCtx()
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

    const ref = useForkedRef(ownRef, forwardRef)

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

    // @ts-ignore Accessing `otherProps.onClick` will throw an error
    // because it is not defined on the props.
    const wrappedClickHandler = wrapEventHandler(
      otherProps.onClick,
      handleClick
    )

    const handleKeyDown = useDescendantKeydown<HTMLButtonElement>({
      element: ownRef.current,
    })
    const wrappedKeyDownHandler = wrapEventHandler(
      // @ts-ignore Accessing `otherProps.onKeyDown` will throw an error
      // because it is not defined on the props.
      otherProps.onKeyDown,
      handleKeyDown
    )

    return (
      <Comp
        ref={ref}
        {...otherProps}
        {...ariaProps}
        id={buttonId}
        onClick={wrappedClickHandler}
        onKeyDown={wrappedKeyDownHandler}
      />
    )
  }
)

const SingleAccordionPanel = forwardRefWithAs<
  HTMLDivElement,
  {},
  'div',
  { id: string }
>(function SingleAccordionPanel(
  { as: Comp = 'div', ...otherProps },
  forwardRef
) {
  const { idx, panelId, buttonId } = useAccordionItemCtx()
  const { activeIdx: activeIdxState } = useSingleAccordionCtx()
  const [activeIdx] = activeIdxState

  return (
    <Comp
      ref={forwardRef}
      {...otherProps}
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
})

export {
  SingleAccordion,
  SingleAccordionButton,
  SingleAccordionItem,
  SingleAccordionPanel,
  SingleAccordionTypes,
}
