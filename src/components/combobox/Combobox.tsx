import React, { RefObject, useRef, useState } from 'react'
import {
  forwardRefWithAs,
  useForkedRef,
  useIsomorphicLayoutEffect,
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
