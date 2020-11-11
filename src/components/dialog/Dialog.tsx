import React, { useCallback, useRef, useEffect } from 'react'
import { forwardRefWithAs, KEYBOARD_KEYS, useForkedRef } from '../../utils'
import { FocusOn } from 'react-focus-on'
import styles from './Dialog.module.css'
import Portal from '../portal'

/**
 * Dialog (Modal)
 *
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
 *
 * @see WAI-aria https://www.w3.org/TR/wai-aria-practices-1.2/#dialog_modal
 *
 * @example
 *
 *  <Dialog
 *    isOpen={isOpen}
 *    onClose={handleCloseDialog}
 *    aria-labelledby="dialog-title"
 *    disableAutoFocus
 *  >
 *  <button onClick={handleCloseDialog}>Close</button>
 *  <h1 id="dialog-title">Add Delivery Address</h1>
 *  <div>
 *    <label>
 *      Street
 *      <input type="text" />
 *    </label>
 *    <label>
 *      City
 *      <input type="password" />
 *    </label>
 *  </div>
 *  </AlertDialog>
 * */
const Dialog = forwardRefWithAs<HTMLDivElement, DialogProps, 'div'>(
  function Dialog(
    {
      as: Comp = 'div',
      role = 'dialog',
      disableAutoFocus = false,
      initElementFocusRef,
      isOpen,
      onClose,
      ...otherProps
    },
    forwardRef
  ) {
    const dialogOverlayRef = useRef<HTMLDivElement | null>(null)
    const mouseDownEventTargetRef = useRef<EventTarget | null>(null)
    // Dialog ref
    const dialogRef = React.useRef<HTMLDivElement | null>(null)
    const ref = useForkedRef(dialogRef, forwardRef)

    // We use this to override the initial focus element.
    const handleLockActivation = useCallback(
      function handleLockActivation() {
        // It will only override the initial focus element if the `disableAutoFocus` is set to `true`.
        if (
          disableAutoFocus &&
          !initElementFocusRef?.current &&
          process.env.NODE_ENV === 'development'
        ) {
          throw new Error(
            `The "autoFocus" is disabled but the "initElementFocusRef" is undefined. You need to make sure that your "initElementFocusRef" is defined when disabling "autoFocus".`
          )
        }
        initElementFocusRef?.current?.focus()
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

    /**
     * We are using the passive effect (useEffect) not the sync effect (useLayoutEffect`) to avoid blocking the thread
     * while traversing an elements and possible setting of attributes.
     * */
    useEffect(() => {
      if (dialogRef.current) {
        return handleElementsAriaHidden(dialogRef.current)
      }
    }, [])

    return (
      <Portal>
        {isOpen && (
          /**
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
           * */
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
              ref={dialogOverlayRef}
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
                ref={ref}
                className={styles.DialogContainer}
                /**
                 * The element that serves as the dialog container has a role of dialog.
                 * https://www.w3.org/TR/wai-aria-practices-1.2/#dialog_roles_states_props
                 * */
                role={role}
                /**
                 * The dialog container element has aria-modal set to true.
                 * https://www.w3.org/TR/wai-aria-practices-1.2/#dialog_roles_states_props
                 * */
                aria-modal={true}
              />
            </div>
          </FocusOn>
        )}
      </Portal>
    )
  }
)

export interface DialogProps {
  role?: string
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

/**
 * This would handle the elements aria hidden. Own function will
 * set the `aria-hidden` to `"true"`. The return function will remove or
 * revert the orignal value of the `aria-hidden` which is obviously
 * `"false"`.
 * https://www.w3.org/TR/wai-aria-practices-1.2/#dialog_roles_states_props
 * */
function handleElementsAriaHidden(dialogElement: HTMLElement) {
  // Manually traversing its portal element (direct child of the body.)
  const portalNode = dialogElement.parentNode?.parentNode?.parentNode

  if (!portalNode) {
    throw new Error(
      'Make sure the passed `dialogElement` inside the `Dialog` was defined.'
    )
  }

  // Handles all of the direct children of the `body` where
  // its `aria-hidden` is set to false.
  const notAriaHiddenElements: [Element, string | null][] = []
  const children = document.querySelectorAll('body > *')
  // Use this `Array.prototype.forEach` to support legacy browsers
  // instead of using `Array.from` or the `children.forEach`.
  // Read more about this - https://developer.mozilla.org/en-US/docs/Web/API/NodeList.
  Array.prototype.forEach.call(children, function (element: Element) {
    // Exclude its portal element.
    if (portalNode === element) {
      return
    }

    const elementAriaHidden = element.getAttribute('aria-hidden')
    const isElementHidden = elementAriaHidden && elementAriaHidden === 'true'
    if (isElementHidden) {
      return
    }

    element.setAttribute('aria-hidden', 'true')
    // We need to make sure to retain the original value once the diealog is closed. E.g if the
    // participated element was intentionally set its `aria-hidden` to `false`, basically we need
    // to retain this value. Else, if no `aria-hidden`, its a null, then remove the attribute.
    notAriaHiddenElements.push([element, elementAriaHidden])
  })

  return () => {
    notAriaHiddenElements.forEach(([element, originalValue]) => {
      if (!originalValue) {
        element.removeAttribute('aria-hidden')
      } else {
        element.setAttribute('aria-hidden', originalValue)
      }
    })
  }
}

export { Dialog as default }
