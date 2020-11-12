import React, { RefObject, useRef, useState } from 'react'
import {
  forwardRefWithAs,
  useForkedRef,
  useIsomorphicLayoutEffect,
} from '../../utils'
import Portal from '../portal'

/**
 *  A combobox is a widget made up of the combination of two distinct elements: 1) a single-line textbox, and 2) an
 *  associated pop-up element for helping users set the value of the textbox. The popup may be a listbox, grid,
 *  tree, or dialog.
 *
 *  Note that the role, state, and property guidance is based on ARIA 1.1
 *
 *  @see https://www.w3.org/TR/wai-aria-practices-1.1/#combobox
 * */
const Combobox = forwardRefWithAs<HTMLDivElement, {}, 'div'>(function Combobox({
  as: Comp = 'div',
  ...otherProps
}) {
  const comboboxRef = useRef<HTMLDivElement | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  return (
    <Comp
      role="combobox"
      ref={comboboxRef}
      /**
       * When the combobox popup is not visible, the element with role combobox has aria-expanded set to false.
       * When the popup element is visible, aria-expanded is set to true. Note that elements with role combobox
       * have a default value for aria-expanded of false.
       * */
      aria-expanded={false}
      /**
       * When a descendant of a listbox, grid, or tree popup is focused, DOM focus remains on the textbox and the
       * textbox has aria-activedescendant set to a value that refers to the focused element within the popup.
       * */
      aria-activedescendant="option-1"
      /**
       * Specify what kind of autocomplete does the combobox do.
       * Soon, what we want is the "both" value. But for now just "none".
       * */
      aria-autocomplete="none"
      {...otherProps}
    />
  )
})

/**
 *
 * The nature of the suggested values and the way the suggestions are presented is called the autocomplete behavior. Comboboxes
 * can have one of four forms of autocomplete:
 *
 *   1. No autocomplete
 *   2. List autocomplete with manual selection
 *   3. List autocomplete with automatic selection
 *   4. List with inline autocomplete
 *
 * */
const ComboboxInput = forwardRefWithAs<HTMLInputElement, {}, 'input'>(
  function ComboboxInput({ as: Comp = 'input', ...otherProps }) {
    return (
      <Comp
        /**
         *  TODO: This aria-controls must be included on the textbox if the listbox is displayed.
         *
         * When the combobox popup is visible, the textbox element has aria-controls set to a value
         * that refers to the combobox popup element.
         * */
        aria-controls="combobox-list"
        type="text"
        {...otherProps}
      />
    )
  }
)

/**
 * The popup is hidden by default, and the conditions that trigger its display are specific to each implementation.
 * Some possible popup display conditions include:
 *   - It is displayed only if a certain number of characters are typed in the textbox and those characters match
 *     some portion of one of the suggested values.
 *   - It is displayed as soon as the textbox is focused, even if the textbox is empty.
 *   - It is displayed when the Down Arrow key is pressed or the show button is activated, possibly with a dependency on the content of the textbox.
 *   - It is displayed if the value of the textbox is altered in a way that creates one or more partial matches to a suggested value.
 * */
const ComboboxList = forwardRefWithAs<HTMLUListElement, {}, 'ul'>(
  function ComboboxList({ as: Comp = 'ul', ...otherProps }) {
    return (
      <Comp
        id="combobox-list"
        /**
         * An element that contains or owns all the listbox options has role listbox.
         * */
        role="listbox"
        /**
         * Each option in the listbox has role option and is a DOM descendant of the element with role listbox
         * or is referenced by an aria-owns property on the listbox element.
         * */
        aria-owns=""
        {...otherProps}
      />
    )
  }
)

const ComboboxOption = forwardRefWithAs<HTMLLIElement, {}, 'li'>(
  function ComboboxOption({ as: Comp = 'li', ...otherProps }) {
    return (
      <Comp
        /**
         * Each option in the listbox has role option and is a DOM descendant of the element with role listbox
         * */
        role="option"
        aria-selected={false}
        {...otherProps}
      />
    )
  }
)

const Popover = forwardRefWithAs<
  HTMLDivElement,
  {
    targetRef: RefObject<HTMLElement>
  },
  'div'
>(function Popover(
  { as: Comp = 'div', domRect, targetRef, ...otherProps },
  forwardRef
) {
  const [ownPosition, setOwnPosition] = useState(() => new DOMRect())
  const ownRef = useRef<HTMLDivElement | null>(null)
  const ref = useForkedRef(forwardRef, ownRef)

  useIsomorphicLayoutEffect(() => {
    if (targetRef.current) {
      setOwnPosition(targetRef.current.getBoundingClientRect())
    }
  }, [targetRef])

  return (
    <Portal>
      <Comp
        id="popover"
        ref={ref}
        style={{
          position: 'absolute',
          left: ownPosition.left,
          top: ownPosition.bottom,
        }}
        {...otherProps}
      />
    </Portal>
  )
})

export { Combobox as default, ComboboxInput, ComboboxList, ComboboxOption }
