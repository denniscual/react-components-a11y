import React from 'react'
import createDescendantsManager from '../DescendantsManager'
import {
  makeId,
  useForkedRef,
  wrapEventHandler,
  forwardRefWithAs,
} from '../../utils'

/**
 * Single Accordion
 *
 * An accordion is a vertically stacked set of interactive headings that each contain a
 * title, content snippet, or thumbnail representing a section of content. The headings
 * function as controls that enable users to reveal or hide their associated sections of content.
 * Accordions are commonly used to reduce the need to scroll when presenting multiple sections of
 * content on a single page.
 *
 * The Accordion only shows 0 or 1 panel at a time. This is distinguished by the `type`.
 * As default, SingleAccordion will always shows 1 panel a time. But this can be change
 * by passing a `type` value `collapsible`. In this behaviour, the Accordion can show atleast 0 or 1 panel and also
 * the active panel can collapse itself.
 *
 * Specs:
 *   - WAI-ARIA: https://www.w3.org/TR/wai-aria-practices-1.2/#accordion
 * */

const {
  DescendantsProvider,
  useDescendantIdx,
  useDescendantKeydown,
} = createDescendantsManager('SingleAccordionDescendants')

enum SingleAccordionTypes {
  tabbed = 'tabbed',
  collapsible = 'collapsible',
}

/**
 *  This Component provdes information like `activeIdx` on its Consumer Components.
 * */
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
        <Comp {...otherProps} ref={forwardRef} />
      </SingleAccordionContext.Provider>
    </DescendantsProvider>
  )
})

type SingleAccordionProps = {
  activeIdx?: number
  type?: SingleAccordionTypes
  id?: string
}

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

/**
 * A Component which holds the index of the accordion button and its associated
 * panel. This Component define the id name of the Button and the Panel.
 * Also internally, the Component register an element, in this case the Button,
 * on the `SingleAccordion` Descendants collection.
 * */
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

/**
 * The title of each accordion header is contained in an element with role button.
 *
 * Each accordion header `button` is wrapped in an element with role
 * `heading` that has a value set for `aria-level` that is appropriate
 * for the information architecture of the page.
 * https://www.w3.org/TR/wai-aria-practices-1.2/#accordion
 * I believe this should be left for apps to handle, since headings
 * are necessarily context-aware. An app can wrap a button inside any
 * arbitrary tag(s).
 *
 * @example
 * <div>
 *   <h3>
 *     <AccordionButton>Click Me</AccordionButton>
 *   </h3>
 * </div>
 * */
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
      /**
       * If the accordion panel associated with an accordion header is visible, the header
       * button element has aria-expanded set to true. If the panel is not visible, aria-expanded is set to false.
       * https://www.w3.org/TR/wai-aria-practices-1.2/#wai-aria-roles-states-and-properties
       * */
      'aria-expanded': isActive,
      /**
       * The accordion header button element has aria-controls set to the ID of the element
       * containing the accordion panel content.
       * https://www.w3.org/TR/wai-aria-practices-1.2/#wai-aria-roles-states-and-properties
       * */
      'aria-controls': panelId,
    }

    const ariaProps =
      type === SingleAccordionTypes.tabbed
        ? {
            ...defaultAriaProps,
            /**
             * If the accordion panel associated with an accordion header is visible, and if the accordion
             * does not permit the panel to be collapsed, the header button element has aria-disabled set to true.
             * https://www.w3.org/TR/wai-aria-practices-1.2/#wai-aria-roles-states-and-properties
             * */
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

    const wrappedClickHandler = wrapEventHandler(
      otherProps.onClick,
      handleClick
    )

    const handleKeyDown = useDescendantKeydown<HTMLButtonElement>({
      element: ownRef.current,
    })
    const wrappedKeyDownHandler = wrapEventHandler(
      otherProps.onKeyDown,
      handleKeyDown
    )

    return (
      <Comp
        {...otherProps}
        {...ariaProps}
        ref={ref}
        id={buttonId}
        onClick={wrappedClickHandler}
        onKeyDown={wrappedKeyDownHandler}
      />
    )
  }
)

/**
 * Section of content associated with an accordion header.
 *
 * @example
 * <div>
 *   <h3>
 *     <AccordionButton>Click Me</AccordionButton>
 *   </h3>
 * </div>
 * */
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
      {...otherProps}
      ref={forwardRef}
      /**
       * Optionally, each element that serves as a container for panel content has role region
       * and aria-labelledby with a value that refers to the button that controls display of the panel.
       * https://www.w3.org/TR/wai-aria-practices-1.2/#wai-aria-roles-states-and-properties
       * */
      role="region"
      aria-labelledby={buttonId}
      /**
       * Some screen readers when using "Up" and "Down" keys, it will not
       * jump the focus on next accordion header, but will jump to the active panel.
       * Because of this, we will make this "div" focusable.
       * */
      tabIndex={-1}
      id={panelId}
      hidden={idx !== activeIdx}
    />
  )
})

const api = {
  Accordion: SingleAccordion,
  Item: SingleAccordionItem,
  Button: SingleAccordionButton,
  Panel: SingleAccordionPanel,
}

export { api as default, SingleAccordionTypes }
