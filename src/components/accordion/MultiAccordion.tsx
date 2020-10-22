import React from 'react'
import createDescendantsManager from '../DescendantsManager'
import {
  makeId,
  useForkedRef,
  wrapEventHandler,
  forwardRefWithAs,
} from '../../utils'

// TODO: Add example codes on the SingleAccordion.
// TODO: Check the codes from the MultiAccordion then refactor some little codes
//       inside the SingleAccordion based on the MultiAccordion. We did some great stuff
//       inside the MultiAccordion like the derive state and abstracting some logic like
//       whawt we did inside the MultiAccordion Component.

/**
 * Multiple Accordion
 *
 * An accordion is a vertically stacked set of interactive headings that each contain a
 * title, content snippet, or thumbnail representing a section of content. The headings
 * function as controls that enable users to reveal or hide their associated sections of content.
 * Accordions are commonly used to reduce the need to scroll when presenting multiple sections of
 * content on a single page.
 *
 * The Accordion can show 0 to multiple panels at the same time and he accordion item has its own state.
 * Internally the explicit state is handled by the MultiAccordion then create
 * a derived state for the MultiAccordionItem.
 *
 * Specs:
 *   - WAI-ARIA: https://www.w3.org/TR/wai-aria-practices-1.2/#accordion
 * */

const {
  DescendantsProvider,
  useDescendantIdx,
  useDescendantKeydown,
} = createDescendantsManager('MultiAccordionDescendants')

enum AccordionItemState {
  expanded = 'expanded',
  collapsed = 'collapsed',
}

/**
 *  This Component provdes information like `activeIdx` on its Consumer Components.
 *
 * @example
 * <MultiAccordion activeIdx={[0, 1]}>
 *   <MultiAccordionItem>
 *     <h3>
 *       <MultiAccordionButton>Irish biography</MultiAccordion.Button>
 *     </h3>
 *     <MultiAccordionPanel>
 *       <h4>My biography</h4>
 *       <p>Irish is the son of the great Berto and Chenglylyly</p>
 *     </MultiAccordionPanel>
 *    </MultiAccordionItem>
 *  </MultiAccordionAccordion>
 * */
const MultiAccordion = forwardRefWithAs<
  HTMLDivElement,
  MultiAccordionProps,
  'div'
>(function MultiAccordion(
  { as: Comp = 'div', id = 'multi-accordion', activeIdx = 0, ...otherProps },
  forwardRef
) {
  const [expandedItems, dispatch] = React.useReducer(
    multiAccordionReducer,
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
      id,
    }),
    [getItemState, id, toggleExpandedItem]
  )

  return (
    <DescendantsProvider>
      <MultiAccordionContext.Provider value={ctxValue}>
        <Comp {...otherProps} ref={forwardRef} />
      </MultiAccordionContext.Provider>
    </DescendantsProvider>
  )
})

type MultiAccordionProps = {
  // Note the value acts like the initial value of the React.useState.
  activeIdx?: number | number[]
  id?: string
}

function multiAccordionReducer(
  state: number[],
  action: { type: 'TOGGLE_EXPANDED_ITEM'; idx: number }
) {
  if (action.type === 'TOGGLE_EXPANDED_ITEM') {
    const { idx } = action

    if (idx < 0) {
      return state
    }

    // If the idx is on the state, then remove it.
    if (state.includes(idx)) {
      return state.filter((prevIdx) => prevIdx !== idx)
    }
    // Else add it
    return state.concat(idx)
  }
  return state
}

function useMultiAccordionCtx() {
  const ctx = React.useContext(MultiAccordionContext)
  if (typeof ctx === 'undefined') {
    throw new Error(
      `Consuming "MultiAccordionContext" outside its "Provider" can lead to error.`
    )
  }
  return ctx
}

const MultiAccordionContext = React.createContext<
  | {
      getItemState: (idx: number) => AccordionItemState
      toggleExpandedItem: (idx: number) => void
      id: string
    }
  | undefined
>(undefined)

/**
 * A Component which holds the index of the accordion button and its associated
 * panel. This Component define the id name of the Button and the Panel.
 * Also internally, the Component register an element, in this case the Button,
 * on the `MultiAccordion` Descendants collection.
 *
 * @example
 * <MultiAccordion activeIdx={[0, 1]}>
 *   <MultiAccordionItem>
 *     <h3>
 *       <MultiAccordionButton>Irish biography</MultiAccordion.Button>
 *     </h3>
 *     <MultiAccordionPanel>
 *       <h4>My biography</h4>
 *       <p>Irish is the son of the great Berto and Chenglylyly</p>
 *     </MultiAccordionPanel>
 *    </MultiAccordionItem>
 *  </MultiAccordionAccordion>
 * */
const MultiAccordionItem = forwardRefWithAs<
  HTMLDivElement,
  {},
  'div',
  { id: string }
>(function MultiAccordionItem({ as: Comp = 'div', ...otherProps }, forwardRef) {
  const {
    id: multiAccordionId,
    getItemState,
    toggleExpandedItem,
  } = useMultiAccordionCtx()
  const buttonEl = React.useRef<HTMLButtonElement | null>(null)
  // in initial render, this will return -1 because the element is null.
  const index = useDescendantIdx({ element: buttonEl.current })
  const itemState = getItemState(index)
  // This is a derived state.
  const isExpanded = itemState === AccordionItemState.expanded

  const itemId = makeId(`${multiAccordionId}-item`, index)
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
      isExpanded: boolean
      toggleItem: () => void
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
 * <MultiAccordion activeIdx={[0, 1]}>
 *   <MultiAccordionItem>
 *     <h3>
 *       <MultiAccordionButton>Irish biography</MultiAccordion.Button>
 *     </h3>
 *     <MultiAccordionPanel>
 *       <h4>My biography</h4>
 *       <p>Irish is the son of the great Berto and Chenglylyly</p>
 *     </MultiAccordionPanel>
 *    </MultiAccordionItem>
 *  </MultiAccordionAccordion>
 * */
const MultiAccordionButton = forwardRefWithAs<HTMLButtonElement, {}, 'button'>(
  function MultiAccordionButton(
    { as: Comp = 'button', ...otherProps },
    forwardRef
  ) {
    const {
      buttonRef: ownRef,
      buttonId,
      panelId,
      isExpanded,
      toggleItem,
    } = useAccordionItemCtx()

    // It returns a wrapper ref function where the passed value
    // will be provided on the ref argument list.
    const ref = useForkedRef(ownRef, forwardRef)

    const wrappedClickHandler = wrapEventHandler(
      otherProps.onClick,
      // The accordion button and accordoin panel are associated to only one AccordionItem.
      // This function will toggle the accordion item's state `isExpanded`.
      toggleItem
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
        /**
         * If the accordion panel associated with an accordion header is visible, the header
         * button element has aria-expanded set to true. If the panel is not visible, aria-expanded is set to false.
         * https://www.w3.org/TR/wai-aria-practices-1.2/#wai-aria-roles-states-and-properties
         * */
        aria-expanded={isExpanded}
        /**
         * The accordion header button element has aria-controls set to the ID of the element
         * containing the accordion panel content.
         * https://www.w3.org/TR/wai-aria-practices-1.2/#wai-aria-roles-states-and-properties
         * */
        aria-controls={panelId}
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
 * <MultiAccordion activeIdx={[0, 1]}>
 *   <MultiAccordionItem>
 *     <h3>
 *       <MultiAccordionButton>Irish biography</MultiAccordion.Button>
 *     </h3>
 *     <MultiAccordionPanel>
 *       <h4>My biography</h4>
 *       <p>Irish is the son of the great Berto and Chenglylyly</p>
 *     </MultiAccordionPanel>
 *    </MultiAccordionItem>
 *  </MultiAccordionAccordion>
 * */
const MultiAccordionPanel = forwardRefWithAs<
  HTMLDivElement,
  {},
  'div',
  { id: string }
>(function MultiAccordionPanel(
  { as: Comp = 'div', ...otherProps },
  forwardRef
) {
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

const api = {
  Accordion: MultiAccordion,
  Item: MultiAccordionItem,
  Button: MultiAccordionButton,
  Panel: MultiAccordionPanel,
}

export { api as default }
