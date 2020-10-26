import React from 'react'
import { forwardRefWithAs } from '../../utils'
import { RootAccordion } from './RootAccordion'

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
  return (
    <RootAccordion id={id} activeIdx={activeIdx}>
      <Comp {...otherProps} ref={forwardRef} />
    </RootAccordion>
  )
})

type MultiAccordionProps = {
  // Note the value acts like the initial value of the React.useState.
  activeIdx?: number | number[]
  id?: string
}

export default MultiAccordion
