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

const Dialog = forwardRefWithAs<HTMLDivElement, {}, 'div'>(function Dialog(
  { as: Comp = 'div', children, ...otherProps },
  forwardRef
) {
  return (
    <Portal>
      <FocusOn className={styles.DialogOverlay}>
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
        >
          {children}
        </Comp>
      </FocusOn>
    </Portal>
  )
})

export { Dialog as default }
