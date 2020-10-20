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

  const buttonId = createSemanticId(
    singleAccordionId,
    accordionItemCtx,
    'button'
  )

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

  function handleClick() {
    if (type === SingleAccordionTypes.tabbed) {
      setActiveIdx(accordionItemCtx)
    }
    // If collapsible
    else {
      if (isActive) {
        setActiveIdx(-1)
      } else {
        setActiveIdx(accordionItemCtx)
      }
    }
  }

  return (
    <button id={buttonId} {...ariaProps} {...props} onClick={handleClick} />
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
    <SingleAccordionContext.Provider value={value}>
      <div {...otherProps}>{children}</div>
    </SingleAccordionContext.Provider>
  )
}

SingleAccordion.Item = AccordionItem
SingleAccordion.Button = AccordionButton
SingleAccordion.Panel = AccordionPanel

export { SingleAccordion, SingleAccordionTypes }
