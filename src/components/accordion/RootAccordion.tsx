import React from 'react'
import createDescendantsManager from '../DescendantsManager'
import {
  makeId,
  forwardRefWithAs,
  useForkedRef,
  wrapEventHandler,
} from '../../utils'

export enum AccordionType {
  tabbed = 'tabbed',
  collapsible = 'collapsible',
}

enum AccordionItemState {
  expanded = 'expanded',
  collapsed = 'collapsed',
}

const {
  DescendantsProvider,
  useDescendantIdx,
  useDescendantKeydown,
} = createDescendantsManager('AccordionDescendants')

/**
 *  This Component provdes information like `activeIdx` on its Consumer Components.
 *
 * @example
 * <RootAccordion activeIdx={[0, 1]}>
 *   <AccordionItem>
 *     <h3>
 *       <AccordionButton>Irish biography</AccordionButton>
 *     </h3>
 *     <AccordionPanel>
 *       <h4>My biography</h4>
 *       <p>Irish is the son of the great Berto and Chenglylyly</p>
 *     </AccordionPanel>
 *    </AccordionItem>
 *  </RootAccordion>
 * */
function RootAccordion({
  id,
  activeIdx,
  type = AccordionType.collapsible,
  onToggle = defaultAccordionOnToggle,
  children,
}: React.PropsWithChildren<{
  id: string
  activeIdx: number | number[]
  type?: AccordionType
  /**
   * A function that will be invoked whenever the AccordionButton is called.
   * Use this if you want to change the toggle logic of the action button.
   * Default logic is to add or remove the item based on the given idx on the list.
   * Good for Multi Item Accordion.
   * */
  onToggle?: (state: number[], idx: number) => number[]
}>) {
  const { ctxValue } = useAccordion(id, activeIdx, type, onToggle)
  return (
    <DescendantsProvider>
      <AccordionContext.Provider value={ctxValue}>
        {children}
      </AccordionContext.Provider>
    </DescendantsProvider>
  )
}

// A function which will toggle, either add or remove, the item on the item list.
// The default toggle logic is suitable for multi item accordion.
function defaultAccordionOnToggle(state: number[], idx: number) {
  // If the idx is on the state, then remove it.
  if (state.includes(idx)) {
    return state.filter((prevIdx) => prevIdx !== idx)
  }
  // Else add it
  return state.concat(idx)
}

function useAccordion(
  id = 'Accordion',
  activeIdx: number | number[],
  type: AccordionType,
  onToggle: (state: number[], idx: number) => number[]
) {
  const accordionReducer = React.useCallback(
    function accordionReducer(
      state: number[],
      action: { type: 'TOGGLE_EXPANDED_ITEM'; idx: number }
    ) {
      if (action.idx < 0) {
        return state
      }
      if (action.type === 'TOGGLE_EXPANDED_ITEM') {
        const { idx } = action
        return onToggle(state, idx)
      }
      return state
    },
    [onToggle]
  )

  const [expandedItems, dispatch] = React.useReducer(
    accordionReducer,
    [],
    (init) => {
      if (Array.isArray(activeIdx)) {
        return activeIdx
      }
      return init.concat(activeIdx)
    }
  )

  const getItemState = React.useCallback(
    (idx: number) => {
      if (idx < 0 || !expandedItems.includes(idx)) {
        return AccordionItemState.collapsed
      }

      return AccordionItemState.expanded
    },
    [expandedItems]
  )

  const toggleExpandedItem = React.useCallback(
    (idx: number) => dispatch({ type: 'TOGGLE_EXPANDED_ITEM', idx }),
    []
  )

  const ctxValue = React.useMemo(
    () => ({
      getItemState,
      toggleExpandedItem,
      type,
      id,
    }),
    [getItemState, toggleExpandedItem, id, type]
  )

  return {
    ctxValue,
  }
}

function useAccordionCtx() {
  const ctx = React.useContext(AccordionContext)
  if (typeof ctx === 'undefined') {
    throw new Error(
      `Consuming "AccordionContext" outside its "Provider" can lead to error.`
    )
  }
  return ctx
}

const AccordionContext = React.createContext<
  | {
      getItemState: (idx: number) => AccordionItemState
      toggleExpandedItem: (idx: number) => void
      id: string
      type: AccordionType
    }
  | undefined
>(undefined)
AccordionContext.displayName = 'AccordionProvider'

/**
 * A Component which holds the index of the accordion button and its associated
 * panel. This Component define the id name of the Button and the Panel.
 * Also internally, the Component register an element, in this case the Button,
 * on the `Accordion Descendants collection.
 *
 * @example
 * <RootAccordion activeIdx={[0, 1]}>
 *   <AccordionItem>
 *     <h3>
 *       <AccordionButton>Irish biography</AccordionButton>
 *     </h3>
 *     <AccordionPanel>
 *       <h4>My biography</h4>
 *       <p>Irish is the son of the great Berto and Chenglylyly</p>
 *     </AccordionPanel>
 *    </AccordionItem>
 *  </RootAccordion>
 * */
const AccordionItem = forwardRefWithAs<
  HTMLDivElement,
  {},
  'div',
  { id: string }
>(function AccordionItem({ as: Comp = 'div', ...otherProps }, forwardRef) {
  const { ctxValue, accordionItemId } = useAccordionItem()
  return (
    <AccordionItemContext.Provider value={ctxValue}>
      <Comp ref={forwardRef} id={accordionItemId} {...otherProps} />
    </AccordionItemContext.Provider>
  )
})

function useAccordionItem() {
  const { getItemState, toggleExpandedItem, id } = useAccordionCtx()
  const buttonEl = React.useRef<HTMLButtonElement | null>(null)
  // in initial render, this will return -1 because the element is null.
  const index = useDescendantIdx({ element: buttonEl.current })
  const itemState = getItemState(index)
  // This is a derived state.
  const isExpanded = itemState === AccordionItemState.expanded

  const itemId = makeId(`${id}-item`, index)
  const buttonId = makeId(itemId, 'button')
  const panelId = makeId(itemId, 'panel')

  const ctxValue = React.useMemo(() => {
    function toggleItem() {
      toggleExpandedItem(index)
    }
    return {
      isExpanded,
      idx: index,
      buttonId,
      panelId,
      buttonRef: buttonEl,
      toggleItem,
    }
  }, [buttonId, index, isExpanded, panelId, toggleExpandedItem])

  return {
    ctxValue,
    accordionItemId: itemId,
  }
}

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
      isExpanded: boolean
      toggleItem: () => void
    }
  | undefined
>(undefined)
AccordionItemContext.displayName = 'AccordionItemProvider'

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
 * <RootAccordion activeIdx={[0, 1]}>
 *   <AccordionItem>
 *     <h3>
 *       <AccordionButton>Irish biography</AccordionButton>
 *     </h3>
 *     <AccordionPanel>
 *       <h4>My biography</h4>
 *       <p>Irish is the son of the great Berto and Chenglylyly</p>
 *     </AccordionPanel>
 *    </AccordionItem>
 *  </RootAccordion>
 * */
const AccordionButton = forwardRefWithAs<HTMLButtonElement, {}, 'button'>(
  function AccordionButton({ as: Comp = 'button', ...otherProps }, forwardRef) {
    const {
      buttonRef: ownRef,
      buttonId,
      panelId,
      isExpanded,
      toggleItem,
    } = useAccordionItemCtx()
    const { type } = useAccordionCtx()

    // The aria props are different based on the type. If the type is `collapsible`,
    // we will not add `aria-disabled` to the button.
    const defaultAriaProps = {
      /**
       * If the accordion panel associated with an accordion header is visible, the header
       * button element has aria-expanded set to true. If the panel is not visible, aria-expanded is set to false.
       * https://www.w3.org/TR/wai-aria-practices-1.2/#wai-aria-roles-states-and-properties
       * */
      'aria-expanded': isExpanded,
      /**
       * The accordion header button element has aria-controls set to the ID of the element
       * containing the accordion panel content.
       * https://www.w3.org/TR/wai-aria-practices-1.2/#wai-aria-roles-states-and-properties
       * */
      'aria-controls': panelId,
    }

    const ariaProps =
      type === AccordionType.tabbed
        ? {
            ...defaultAriaProps,
            /**
             * If the accordion panel associated with an accordion header is visible, and if the accordion
             * does not permit the panel to be collapsed, the header button element has aria-disabled set to true.
             * https://www.w3.org/TR/wai-aria-practices-1.2/#wai-aria-roles-states-and-properties
             * */
            'aria-disabled': isExpanded,
          }
        : { ...defaultAriaProps }

    const ref = useForkedRef(ownRef, forwardRef)

    const wrappedClickHandler = wrapEventHandler(otherProps.onClick, toggleItem)

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
 * <RootAccordion activeIdx={[0, 1]}>
 *   <AccordionItem>
 *     <h3>
 *       <AccordionButton>Irish biography</AccordionButton>
 *     </h3>
 *     <AccordionPanel>
 *       <h4>My biography</h4>
 *       <p>Irish is the son of the great Berto and Chenglylyly</p>
 *     </AccordionPanel>
 *    </AccordionItem>
 *  </RootAccordion>
 * */
const AccordionPanel = forwardRefWithAs<
  HTMLDivElement,
  {},
  'div',
  { id: string }
>(function AccordionPanel({ as: Comp = 'div', ...otherProps }, forwardRef) {
  const { panelId, buttonId, isExpanded } = useAccordionItemCtx()

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
      hidden={!isExpanded}
    />
  )
})

export { RootAccordion, AccordionItem, AccordionButton, AccordionPanel }
