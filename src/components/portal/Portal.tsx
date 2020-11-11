import React, { PropsWithChildren, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  useIsomorphicLayoutEffect,
  useForceUpdate,
  useLazyRef,
} from '../../utils'

/**
 * Higher level  Component to create  mount children  to an element
 * which is direct sibling  of the `document.body` element.
 * */
export default function Portal({
  as = 'portal',
  children,
}: PropsWithChildren<{ as?: string }>) {
  const forceUpdate = useForceUpdate()
  const portalRef = useLazyRef(() => document.createElement(as))

  useIsomorphicLayoutEffect(() => {
    const portalEl = portalRef.current
    // append the parent root to the body
    document.body.appendChild(portalEl)
    // force update to render the portal.
    forceUpdate()

    return () => {
      // when the Component is unmounted, remove the attached element.
      document.body.removeChild(portalEl)
    }
  }, [forceUpdate, as, portalRef])

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
   * the `portalRef.current` is not null.
   * */
  return createPortal(children, portalRef.current)
}
