import React from 'react'
import { makeId } from '../utils'
import createDescendantsManager from './DescendantsManager'

// TODO
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

const {
  DescendantsProvider,
  useDescendantIdx,
  useDescendantKeydown,
} = createDescendantsManager('SingleAccordionDescendants')

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

export { SingleAccordion, SingleAccordionTypes }
