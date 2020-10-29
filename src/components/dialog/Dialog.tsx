import React, { PropsWithChildren } from 'react'
import { createPortal } from 'react-dom'
import {
  useIsomorphicLayoutEffect,
  useForceUpdate,
  forwardRefWithAs,
} from '../../utils'
import { FocusOn } from 'react-focus-on'
import styles from './Dialog.module.css'

function Portal({ as = 'div', children }: PropsWithChildren<{ as?: string }>) {
  const forceUpdate = useForceUpdate()
  const parentEl = React.useRef<HTMLDivElement | null>(null)

  useIsomorphicLayoutEffect(() => {
    const _parentEl = document.createElement(as) as HTMLDivElement

    // append the parent root to the body
    document.body.appendChild(_parentEl)
    parentEl.current = _parentEl
    forceUpdate()

    return () => {
      // when the Component is unmounted, remove the attached element.
      document.body.removeChild(_parentEl)
    }
  }, [forceUpdate, as])

  /**
   * The portal element is inserted in the DOM tree after
   * the Modal's children are mounted, meaning that children
   * will be mounted on a detached, separated, DOM node. Remember the
   * parent element is not yet mounted after the children is mounted. If a child
   * component requires to be attached to the DOM tree
   * immediately when mounted, for example to measure a
   * DOM node, or uses 'autoFocus' in a descendant, add
   * state to Modal and only render the children when Modal
   * is inserted in the DOM tree. In here we don't use `state` instead we check if
   * the `parentEl.current` is not null.
   * */
  return parentEl.current ? createPortal(children, parentEl.current) : null
}

const Dialog = forwardRefWithAs<HTMLDivElement, DialogProps, 'div'>(
  function Dialog(
    { as: Comp = 'div', isOpen, onClose, ...otherProps },
    forwardRef
  ) {
    const inertContainerRef = React.useRef<HTMLDivElement | null>(null)
    const mouseDownEventTargetRef = React.useRef<EventTarget | null>(null)

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

    const handleKeyDown: React.MouseEventHandler<HTMLDivElement> = (event) => {}

    return isOpen ? (
      <Portal>
        <FocusOn returnFocus>
          <div
            onClick={handleClick}
            onMouseDown={handleMouseDown}
            ref={inertContainerRef}
            className={styles.InertContainer}
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
}

/**
 * Windows under a modal dialog are inert. That is, users cannot interact with content outside
 * an active dialog window. Inert content outside an active dialog is typically visually obscured
 * or dimmed so it is difficult to discern, and in some implementations, attempts to
 * interact with the inert content cause the dialog to close.
 *
 * */
const InertContainer = function InertContainer({
  children,
}: PropsWithChildren<{}>) {
  return (
    <Portal>
      <div className={styles.InertContainer}>{children}</div>
    </Portal>
  )
}

export { Dialog as default }
