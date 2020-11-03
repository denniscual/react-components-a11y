import React from 'react'
import { forwardRefWithAs } from '../../utils'

/**
 * Alert
 *
 * An alert is an element that displays a brief, important message in a way that attracts the
 * user's attention without interrupting the user's task. Dynamically rendered alerts are
 * automatically announced by most screen readers, and in some operating systems,
 * they may trigger an alert sound. It is important to note that, at this time, screen
 * readers do not inform users of alerts that are present on the page before page load completes.
 *
 * @see WAI-ARIA https://www.w3.org/TR/wai-aria-practices-1.2/#alert
 * */

const Alert = forwardRefWithAs<HTMLDivElement, {}, 'div'>(
  function MultiAccordion({ as: Comp = 'div', ...otherProps }, forwardRef) {
    return (
      <Comp
        {...otherProps}
        /**
         * The widget has a role of alert.
         * */
        role="alert"
        ref={forwardRef}
      />
    )
  }
)

export default Alert
