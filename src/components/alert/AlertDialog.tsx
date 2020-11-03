import React from 'react'
import { forwardRefWithAs } from '../../utils'
import Dialog, { DialogProps } from '../dialog'

/**
 * Alert Dialog
 *
 * An alert dialog is a modal dialog that interrupts the user's workflow to communicate an
 * important message and acquire a response. Examples include action confirmation prompts and
 * error message confirmations. The alertdialog role enables assistive technologies and browsers to distinguish
 * alert dialogs from other dialogs so they have the option of giving alert dialogs special treatment,
 * such as playing a system alert sound.
 *
 * Check the keyboard interactions and focus management of the `Dialog` Component.
 *
 * @see WAI-aria https://www.w3.org/TR/wai-aria-practices-1.2/#alertdialog
 *
 * @example
 *
 *  <AlertDialog
 *    isOpen={isOpen}
 *    onClose={handleCloseDialog}
 *    aria-labelledby="dialog-title"
 *    aria-describedby="dialog-desc"
 *    disableAutoFocus
 *  >
 *    <h1 id="dialog-title">Confirmation</h1>
 *    <p id="dialog-desc">Are you sure you want to discard all of your notes?</p>
 *    <div>
 *      <button type="button" onClose={handleCloseDialog}>No</button>
 *      <button type="button">Yes</button>
 *    </div>
 *  </AlertDialog>
 * */
const AlertDialog = forwardRefWithAs<HTMLDivElement, DialogProps, 'div'>(
  function AlertDialog(props, forwardRef) {
    return <Dialog ref={forwardRef} role="alertdialog" {...props} />
  }
)

export default AlertDialog
