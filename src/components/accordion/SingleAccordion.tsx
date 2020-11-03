import React from 'react'
import { forwardRefWithAs } from '../../utils'
import { RootAccordion, AccordionType } from './RootAccordion'

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
 * @see WAI-ARIA https://www.w3.org/TR/wai-aria-practices-1.2/#accordion
 * */

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
    type = AccordionType.tabbed,
    ...otherProps
  },
  forwardRef
) {
  /**
   *  For SingleAccordion, 1 single expanded/active item at a time. Due to this,
   *  whenever we toggle an item, we need to make sure the returned array length is 0 or 1.
   * */
  const onToggle = React.useCallback(
    function onToggle(state: number[], idx: number) {
      // If accordion type is tabbed, then we can't toggle an item.
      if (type === AccordionType.tabbed) {
        // Add it if the item is not on the list
        if (!state.includes(idx)) {
          return [idx]
        }
        // If the item is already on the list, retain the list.
        return state
      } else {
        // Here the item is toggleble.
        if (state.includes(idx)) {
          return []
        }
        return [idx]
      }
    },
    [type]
  )

  return (
    <RootAccordion
      id={id}
      activeIdx={activeIdx}
      type={type}
      onToggle={onToggle}
    >
      <Comp {...otherProps} ref={forwardRef} />
    </RootAccordion>
  )
})

type SingleAccordionProps = {
  activeIdx?: number
  type?: AccordionType
  id?: string
}

export default SingleAccordion
