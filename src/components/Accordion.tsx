import React from 'react'
import styles from './Accordion.module.css'

/**
 * This module must expose a single Object which has Components `Group`, `Item`, `Button`, and `Panel`.
 *
 * `Group` returns a `div` element without a role and has Accordion Context.
 * */

/**
 * What we gonna do is to have 2 types of Accordion. The "tabbed" and "multiselect".
 * */

/**
 * WAI-ARIA Accordion specs - https://www.w3.org/TR/wai-aria-practices-1.2/#accordion
 * */

// ---------------------------------------- //
// ---------------------------------------- //
// Tabbed
// -----------------------------------------//
// -----------------------------------------//

const TabbedAccordionContext = React.createContext<
  [number, React.Dispatch<React.SetStateAction<number>>] | undefined
>(undefined)

function useTabbedAccordionCtx() {
  const ctx = React.useContext(TabbedAccordionContext)
  if (typeof ctx === 'undefined') {
    throw new Error(
      `Consuming "TabbedAccordionContext" outside its "Provider" can lead to error.`
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

function AccordionButton(props: JSX.IntrinsicElements['button']) {
  const accordionItemCtx = useAccordionItemCtx()
  const [activeIdx, setActiveIdx] = useTabbedAccordionCtx()

  const isActive = accordionItemCtx === activeIdx

  function handleClick() {
    setActiveIdx(accordionItemCtx)
  }

  return (
    <button
      {...props}
      onClick={handleClick}
      aria-expanded={isActive}
      aria-disabled={isActive}
    />
  )
}

function AccordionPanel(props: JSX.IntrinsicElements['div']) {
  const accordionItemCtx = useAccordionItemCtx()
  const [activeIdx] = useTabbedAccordionCtx()

  return (
    <div role="region" {...props} hidden={accordionItemCtx !== activeIdx} />
  )
}

function TabbedAccordion({
  activeIdx = 0,
  children,
  ...otherProps
}: {
  activeIdx?: number
} & JSX.IntrinsicElements['div']) {
  const accordionState = React.useState(activeIdx)
  return (
    <TabbedAccordionContext.Provider value={accordionState}>
      <div {...otherProps}>{children}</div>
    </TabbedAccordionContext.Provider>
  )
}

TabbedAccordion.Item = AccordionItem
TabbedAccordion.Button = AccordionButton
TabbedAccordion.Panel = AccordionPanel

export { TabbedAccordion }
