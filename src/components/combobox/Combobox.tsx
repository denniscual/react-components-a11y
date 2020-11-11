import React, { RefObject, useEffect, useRef, useState } from 'react'
import {
  forwardRefWithAs,
  useIsomorphicLayoutEffect,
  useForkedRef,
} from '../../utils'
import Portal from '../portal'

export default function Combobox() {
  const comboboxRef = useRef<HTMLDivElement | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div>
      <div ref={comboboxRef}>
        <button onClick={() => setIsOpen((prev) => !prev)}>Show Popover</button>
        <button
          onClick={() => {
            if (comboboxRef.current) {
              const offsetTop = comboboxRef.current.offsetTop
              comboboxRef.current.style.position = 'relative'
              comboboxRef.current.style.top = offsetTop + 20 + 'px'
            }
          }}
        >
          Move the combobox
        </button>
        Combobox
      </div>
      <Popover targetRef={comboboxRef}>{isOpen && 'List box'}</Popover>
    </div>
  )
}

// TODO: Continue the popover. make sure that we listen to targetRef so that if the position of the targetRef change, so our popover.
const Popover = forwardRefWithAs<
  HTMLDivElement,
  {
    domRect?: Omit<DOMRect, 'toJSON' | 'x' | 'y'>
    targetRef: RefObject<HTMLElement>
  },
  'div'
>(function Popover(
  { as: Comp = 'div', domRect, targetRef, ...otherProps },
  forwardRef
) {
  const [elementDOMRect, setElementDOMRect] = useState({
    width: 0,
    height: 0,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  })

  const ownRef = useRef<HTMLDivElement | null>(null)
  const ref = useForkedRef(ownRef, forwardRef)

  useIsomorphicLayoutEffect(() => {
    if (!domRect && targetRef.current) {
      const domRect = targetRef.current.getBoundingClientRect()
      setElementDOMRect(domRect)
    }
  }, [domRect, targetRef])

  useEffect(() => {
    if (targetRef.current && ownRef.current) {
      // Create an observer instance linked to the callback function
      const observer = new MutationObserver(function mutationObserver(
        mutationsList
      ) {
        // Use traditional 'for loops' for IE 11
        for (const mutation of mutationsList) {
          console.log(mutation.oldValue)
          console.log(
            'The ' + mutation.attributeName + ' attribute was modified.'
          )
        }
      })
      // Start observing the target node for configured mutations
      observer.observe(targetRef.current, {
        attributes: true,
        attributeOldValue: true,
      })
      return () => {
        // Later, you can stop observing
        observer.disconnect()
      }
    }
  }, [targetRef])

  return (
    <Portal>
      <Comp
        id="popover"
        ref={ref}
        style={{
          position: 'absolute',
          left: elementDOMRect.left,
          top: elementDOMRect.bottom,
        }}
        {...otherProps}
      />
    </Portal>
  )
})
