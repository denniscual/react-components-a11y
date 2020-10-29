import React from 'react'
import { forwardRefWithAs, KEYBOARD_KEYS } from '../../utils'
import { FocusOn } from 'react-focus-on'
import styles from './Dialog.module.css'
import Portal from '../Portal'

// TODO: Add aria-hidden to true to all inert elements to prevent screen readers read the conent.

/**
 * Keyboard interactions (https://www.w3.org/TR/wai-aria-practices-1.2/#keyboard-interaction-7):
 * - When a dialog opens, focus moves to an element inside the dialog. About whats element will be the initial
 *   focused, it depends on the case. ✅
 * - Tab:
 *   * Moves focus to the next tabbable element inside the dialog. ✅
 *   * If focus is on the last tabbable element inside the dialog, moves focus  *     to the first.
 *     tabbable element inside the dialog. ✅
 * - Shift + Tab:
 *   * Moves focus to the previous tabbable element inside the dialog.
 *   * If focus is on the first tabbable element inside the dialog, moves
 *     focus to the last tabbable element inside the dialog. ✅
 * - Escape:
 *   * Closes the dialog. ✅
 *
 * WAI-ARIA Roles, States, and Properties (https://www.w3.org/TR/wai-aria-practices-1.2/#dialog_roles_states_props)
 * - The element that serves as the dialog container has a role of dialog. ✅
 * - The dialog container element has aria-modal set to true.✅
 * */

const Dialog = forwardRefWithAs<HTMLDivElement, DialogProps, 'div'>(
  function Dialog(
    {
      as: Comp = 'div',
      disableAutoFocus = false,
      initElementFocusRef,
      isOpen,
      onClose,
      ...otherProps
    },
    forwardRef
  ) {
    const inertContainerRef = React.useRef<HTMLDivElement | null>(null)
    const mouseDownEventTargetRef = React.useRef<EventTarget | null>(null)

    // We use this to override the initial focus element.
    const handleLockActivation = React.useCallback(
      function handleLockActivation() {
        // It will only override the initial focus element if the `disableAutoFocus` is set to `true`.
        if (disableAutoFocus) {
          initElementFocusRef?.current?.focus()
        }
      },
      [initElementFocusRef, disableAutoFocus]
    )

    /**
     * We use the handleMouseDown and handleClick handlers for closing the modal
     * when clicking to the element. THe order of execution is `onMouseDown` then `onClick`. So what we did is
     * in `handleMouseDown`, we will get the current target object which points to the element to which this event handler
     * has been attached.
     * THen on the `handleClick` we will check where the event is fired. If the event is fired on the overlay element, then
     * we wll invoke the `onClose`. Else, prevent the closing of modal.
     * */
    const handleMouseDown: React.MouseEventHandler<HTMLDivElement> = (
      event
    ) => {
      mouseDownEventTargetRef.current = event.currentTarget
    }

    const handleClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
      if (mouseDownEventTargetRef.current === event.target) {
        event.stopPropagation()
        onClose()
      }
    }

    /**
     * Hitting Escape key must close the dialog.
     * https://www.w3.org/TR/wai-aria-practices-1.2/#keyboard-interaction-7
     * */
    const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (
      event
    ) => {
      if (event.key === KEYBOARD_KEYS.ESCAPE) {
        event.stopPropagation()
        onClose()
      }
    }

    return isOpen ? (
      <Portal>
        {/**
         * Windows under a modal dialog are inert. That is, users cannot interact with content outside
         * an active dialog window. Inert content outside an active dialog is typically visually obscured
         * or dimmed so it is difficult to discern, and in some implementations, attempts to
         * interact with the inert content cause the dialog to close.
         *
         * Like non-modal dialogs, modal dialogs contain their tab sequence. That is, Tab and Shift + Tab
         * do not move focus outside the dialog. However, unlike most non-modal dialogs,
         * modal dialogs do not provide means for moving keyboard focus outside the dialog window without closing
         * the dialog.
         *
         * With this, we use a React library to handle the focus lock and body scroll lock.
         * https://github.com/theKashey/react-focus-on
         *
         * */}
        <FocusOn
          // In all circumstances, focus moves to an element contained in the dialog.
          autoFocus={!disableAutoFocus}
          /**
           * This will return the focus to the element who open the dialog like `button`.
           * */
          returnFocus
          onActivation={handleLockActivation}
        >
          <div
            ref={inertContainerRef}
            /**
             * Don't worry, this `div` element can't accept focus. We add this element
             * inside the `FocusOn` to be able we can close the dialog when clicking to itself and achieve the styles we want.
             * */
            onClick={handleClick}
            onMouseDown={handleMouseDown}
            className={styles.DialogOverlay}
            onKeyDown={handleKeyDown}
          >
            <Comp
              {...otherProps}
              ref={forwardRef}
              className={styles.DialogContainer}
              /**
               * The element that serves as the dialog container has a role of dialog.
               * https://www.w3.org/TR/wai-aria-practices-1.2/#dialog_roles_states_props
               * */
              role="dialog"
              /**
               * The dialog container element has aria-modal set to true.
               * https://www.w3.org/TR/wai-aria-practices-1.2/#dialog_roles_states_props
               * */
              aria-modal={true}
            />
          </div>
        </FocusOn>
      </Portal>
    ) : null
  }
)

interface DialogProps {
  isOpen: boolean
  onClose(): void
  /**
   * If we want to enable or disable the autoFocus to the Dialog content.
   * Defaulted to `false`. Read more about this https://github.com/theKashey/react-focus-lock#autofocus
   *
   * We give the user a chance to override the initial focus element because thats a11y said about the focus placement!
   * https://www.w3.org/TR/wai-aria-practices-1.2/#keyboard-interaction-7
   *
   * */
  disableAutoFocus?: boolean
  initElementFocusRef?: React.RefObject<HTMLElement>
}

export { Dialog as default }
