import React, {
  createContext,
  Dispatch,
  MutableRefObject,
  RefObject,
  SetStateAction,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  forwardRefWithAs,
  KEYBOARD_KEYS,
  useForkedRef,
  useIsomorphicLayoutEffect,
  wrapEventHandler,
  makeId,
  makeHash,
} from '../../utils'
import createDescendantsManager, {
  DescendantType,
} from '../CustomDescendantsManager'
import Portal from '../portal'

// THIS COMPONENT IS VOID!!!!!!!!!!!!!

const {
  useDescendantsState,
  DescendantsProvider,
  useRegisterDescendant,
} = createDescendantsManager('ComboboxDescendants')

enum ComboOptionTypes {
  notSelected = 'notSelected',
  selected = 'selected',
  hidden = 'hidden',
}

interface ComboOptionOtherType {
  type: ComboOptionTypes
  label: string
  isCurrent: boolean
  id: number
}

type ComboOptionType = DescendantType<ComboOptionOtherType>

/**
 *  A combobox is a widget made up of the combination of two distinct elements: 1) a single-line textbox, and 2) an
 *  associated pop-up element for helping users set the value of the textbox. The popup may be a listbox, grid,
 *  tree, or dialog.
 *
 *  Note that the role, state, and property guidance is based on ARIA 1.1
 *
 *  @see https://www.w3.org/TR/wai-aria-practices-1.1/#combobox
 * */
const Combobox = forwardRefWithAs<HTMLDivElement, ComboboxProps, 'div'>(
  function Combobox({
    as: Comp = 'div',
    id = 'Combobox',
    onSelect,
    ...otherProps
  }) {
    const comboboxRef = useRef<HTMLDivElement | null>(null)
    const [isPopupOpen, setIsPopupOpen] = useState(false)

    const comboboxInputRef = useRef<HTMLInputElement | null>(null)
    const comboboxListRef = useRef<HTMLUListElement | null>(null)

    const ctxValue = useMemo(
      () => ({
        isPopupOpenState: [isPopupOpen, setIsPopupOpen] as IsPopupOpenState,
        comboboxInputRef,
        comboboxListRef,
        id,
        onSelect,
      }),
      [comboboxInputRef, isPopupOpen, id, onSelect]
    )

    return (
      <DescendantsProvider>
        <ComboboxContext.Provider value={ctxValue}>
          <Comp
            ref={comboboxRef}
            role="combobox"
            /**
             * When the combobox popup is not visible, the element with role combobox has aria-expanded set to false.
             * When the popup element is visible, aria-expanded is set to true. Note that elements with role combobox
             * have a default value for aria-expanded of false.
             * */
            aria-expanded={isPopupOpen}
            {...otherProps}
          />
        </ComboboxContext.Provider>
      </DescendantsProvider>
    )
  }
)

interface ComboboxProps {
  onSelect(value: string): void
}

const ComboboxContext = createContext<{
  isPopupOpenState: IsPopupOpenState
  comboboxInputRef: MutableRefObject<HTMLInputElement | null>
  comboboxListRef: MutableRefObject<HTMLUListElement | null>
  id: string
  onSelect(value: string): void
}>({
  id: 'Combobox',
  isPopupOpenState: [false, () => {}],
  comboboxInputRef: { current: null },
  comboboxListRef: { current: null },
  onSelect: () => {},
})

type IsPopupOpenState = [
  isPopupOpen: boolean,
  setIsPopupOpen: Dispatch<SetStateAction<boolean>>
]

/**
 *
 * The nature of the suggested values and the way the suggestions are presented is called the autocomplete behavior. Comboboxes
 * can have one of four forms of autocomplete:
 *
 *   1. No autocomplete
 *   2. List autocomplete with manual selection
 *   3. List autocomplete with automatic selection
 *   4. List with inline autocomplete
 * */
const ComboboxInput = forwardRefWithAs<HTMLInputElement, {}, 'input'>(
  function ComboboxInput(
    {
      as: Comp = 'input',
      value,
      onChange,
      onKeyDown,
      onFocus,
      onBlur,
      ...otherProps
    },
    forwardRef
  ) {
    const {
      isPopupOpenState: [isPopupOpen, setIsPopupOpen],
      comboboxInputRef,
      onSelect,
    } = useContext(ComboboxContext)

    const {
      getSelectedOption,
      makeOptionSelected,
      getNextOption,
      getHead,
      getTail,
      hasComboOptions,
      resetOptions,
    } = useComboOptionDescendants()
    const selectedOption = getSelectedOption()

    const handleChange: React.ChangeEventHandler<HTMLInputElement> = (
      event
    ) => {
      if (event.target.value.trim() === '') {
        setIsPopupOpen(false)
        resetOptions()
      } else {
        if (hasComboOptions()) {
          setIsPopupOpen(true)
        }
      }
    }

    const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (
      event
    ) => {
      switch (event.key) {
        case KEYBOARD_KEYS.ARROW_DOWN: {
          setIsPopupOpen(true)
          // Alt + Down Arrow (Optional): If the popup is available but not displayed, displays the popup without moving focus.
          if (event.altKey) {
            break
          }
          if (isPopupOpen || Boolean(value.trim())) {
            // Places focus on the first focusable element in the popup.
            if (!selectedOption) {
              const head = getHead()
              // Init the selected option to the head option.
              if (head) makeOptionSelected(head.others.id)
            } else {
              const nextOption = getNextOption(selectedOption)
              if (nextOption) makeOptionSelected(nextOption.others.id)
            }
          }
          break
        }
        case KEYBOARD_KEYS.ARROW_UP: {
          /**
           * If the popup is displayed:
           *   - If the popup contains focus, returns focus to the textbox.
           *   - Closes the popup.
           * */
          if (event.altKey && isPopupOpen) {
            setIsPopupOpen(false)
            resetOptions()
          } else if (hasComboOptions()) {
            /**
             * If the popup is available, places focus on the last focusable element in the popup
             * */
            const tail = getTail()
            if (tail) {
              makeOptionSelected(tail.others.id)
              setIsPopupOpen(true)
            }
          }
          break
        }
        case KEYBOARD_KEYS.ESCAPE: {
          setIsPopupOpen(false)
          break
        }
        //  If an autocomplete suggestion is automatically selected, accepts the suggestion either by placing the
        //  input cursor at the end of the accepted value in the textbox
        case KEYBOARD_KEYS.ENTER: {
          if (isPopupOpen && selectedOption) {
            setIsPopupOpen(false)
            onSelect?.(selectedOption.others.label)
            resetOptions()
          }
        }
      }
    }

    const handleBlur = useHandleBlur()

    function handleFocus() {}

    const ref = useForkedRef(comboboxInputRef, forwardRef)

    return (
      <Comp
        ref={ref}
        value={value}
        onChange={wrapEventHandler(onChange, handleChange)}
        /**
         * It is displayed when the Down Arrow key is pressed or the show button is activated,
         * possibly with a dependency on the content of the textbox.
         * */
        onKeyDown={wrapEventHandler(onKeyDown, handleKeyDown)}
        /**
         * If the element receives focus, we shows the popup list.
         * */
        onFocus={wrapEventHandler(onFocus, handleFocus)}
        onBlur={wrapEventHandler(onBlur, handleBlur)}
        /**
         *
         * When the combobox popup is visible, the textbox element has aria-controls set to a value
         * that refers to the combobox popup element.
         * */
        aria-controls="combobox-list"
        /**
         * When a descendant of a listbox, grid, or tree popup is focused, DOM focus remains on the textbox and the
         * textbox has aria-activedescendant set to a value that refers to the focused element within the popup.
         * */
        aria-activedescendant="option-1"
        type="text"
        /**
         * Specify what kind of autocomplete does the combobox do.
         * Here we chooses the automcomplete behaviour "list"
         * with the implementation of "List autocomplete with manual selection".
         * */
        aria-autocomplete="list"
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
  function ComboboxList({ as: Comp = 'ul', ...otherProps }, forwardRef) {
    const {
      comboboxListRef,
      comboboxInputRef,
      isPopupOpenState: [isPopupOpen],
    } = useContext(ComboboxContext)

    const ref = useForkedRef(forwardRef, comboboxListRef)

    return (
      <Popover targetRef={comboboxInputRef}>
        <Comp
          ref={ref}
          hidden={!isPopupOpen}
          id="combobox-list"
          /**
       * Based on the Combobox specs, the descendants of the Combobox, excluding the combobox textbox, must not be focusable nor tabbable.
       * But here we make the element as focusable to be able we can
       * bypass the closing of popup whenever the combobox input lost its focus.
       * We don't want to close the popup if the combobox input lost its focus tobe
       * able we can run a logic before closing the popup.
       *
       * The cons of this hack is that it shows the default focus css state style 
       * on the element, we need to make sure to remove the focus on this element.
          /**
           * An element that contains or owns all the listbox options has role listbox.
           * */
          tabIndex={-1}
          role="listbox"
          /**
           * Each option in the listbox has role option and is a DOM descendant of the element with role listbox
           * or is referenced by an aria-owns property on the listbox element.
           * */
          aria-owns=""
          aria-hidden={true}
          {...otherProps}
        ></Comp>
      </Popover>
    )
  }
)

const ComboboxOption = forwardRefWithAs<
  HTMLLIElement,
  { label: string },
  'li',
  { children: React.ReactNode }
>(function ComboboxOption(
  { as: Comp = 'li', label, ...otherProps },
  forwardRef
) {
  const ownRef = useRef<HTMLLIElement | null>(null)
  const {
    id,
    onSelect,
    isPopupOpenState: [, setIsPopupOpen],
  } = useContext(ComboboxContext)
  const ownDescendantWithIndex = useRegisterDescendant({
    element: ownRef.current,
    // The initial combo option type is `notSelected`.
    others: {
      type: ComboOptionTypes.notSelected,
      label,
      isCurrent: false,
      id: makeHash(label),
    },
  })
  const isSelected =
    ownDescendantWithIndex &&
    ownDescendantWithIndex.descendant.others.type === ComboOptionTypes.selected
  const ref = useForkedRef(ownRef, forwardRef)
  const optionElId = makeId(id, ownDescendantWithIndex?.index ?? -1)

  function handleClick() {
    onSelect?.(label)
    setIsPopupOpen(false)
  }

  return (
    <Comp
      id={optionElId}
      ref={ref}
      onClick={handleClick}
      /**
       * Based on the Combobox specs, the descendants of the Combobox, excluding the combobox textbox, must not be focusable nor tabbable.
       * But here we make the element as focusable to be able we can
       * bypass the closing of popup whenever the combobox input lost its focus.
       * We don't want to close the popup if the combobox input lost its focus tobe
       * able we can run a logic before closing the popup.
       *
       * The cons of this hack is that it shows the default focus css state style
       * on the element, we need to make sure to remove the focus on this element.
       * */
      tabIndex={-1}
      /**
       * Each option in the listbox has role option and is a DOM descendant of the element with role listbox
       * */
      role="option"
      aria-selected={isSelected}
      style={{
        color: isSelected ? 'lightblue' : 'black',
      }}
      {...otherProps}
    >
      {label}
    </Comp>
  )
})

function useHandleBlur() {
  const {
    isPopupOpenState: [, setIsPopupOpen],
    comboboxInputRef,
    comboboxListRef,
    onSelect,
  } = useContext(ComboboxContext)
  const { getSelectedOption, resetOptions } = useComboOptionDescendants()
  const selectedOption = getSelectedOption()
  const handleBlur: React.FocusEventHandler<HTMLInputElement> = () => {
    // We wrap the codes for closing the popup inside the `requestAnimationFrame` to be able we can capture the
    // element inside the Combobox which is active element before it close.
    // Without wrapping, `ownerDocument.document.activeElement` will point to outside element.
    requestAnimationFrame(function closePopup() {
      const ownerDocument = comboboxInputRef.current?.ownerDocument ?? document
      // We only want to close the popup if the blur event was dispatched on an element which is not part of the combobox.
      if (
        ownerDocument.activeElement !== comboboxInputRef.current &&
        comboboxListRef.current &&
        ownerDocument.activeElement !== comboboxListRef.current
      ) {
        if (!comboboxListRef.current.contains(ownerDocument.activeElement)) {
          setIsPopupOpen(false)
          if (selectedOption) {
            onSelect(selectedOption.others.label)
            resetOptions()
          }
        }
      }
    })
  }
  return handleBlur
}

function useComboOptionDescendants() {
  const [comboOptions, setComboOptions] = useDescendantsState<
    ComboOptionOtherType
  >()

  return useMemo(() => {
    function getSelectedOption() {
      return comboOptions.find(
        (descendant) => descendant.others.type === ComboOptionTypes.selected
      )
    }

    function getPrevOption(currentOption: ComboOptionType) {
      const index = comboOptions.findIndex(
        (descendant) => descendant.others.id === currentOption.others.id
      )
      if (index === 0) {
        return null
      }
      const foundOption = comboOptions[index - 1]
      return nullableData(foundOption)
    }

    function getNextOption(currentOption: ComboOptionType) {
      const index = comboOptions.findIndex(
        (descendant) => descendant.others.id === currentOption.others.id
      )
      if (index === comboOptions.length - 1) {
        return null
      }
      const foundOption = comboOptions[index + 1]
      return nullableData(foundOption)
    }

    function makeOptionSelected(optionId: number) {
      setComboOptions((prevOptions) => {
        return prevOptions.map((prevOption) => {
          if (prevOption.others.id === optionId) {
            return {
              ...prevOption,
              others: {
                ...prevOption.others,
                type: ComboOptionTypes.selected,
              },
            }
          }
          return {
            ...prevOption,
            others: {
              ...prevOption.others,
              // Make the prev option selected to not selected without affecting the hidden option.
              type:
                prevOption.others.type === ComboOptionTypes.selected
                  ? ComboOptionTypes.notSelected
                  : prevOption.others.type,
            },
          }
        })
      })
    }

    function getHead() {
      const head = comboOptions[0]
      return nullableData(head)
    }

    function getTail() {
      const tail = comboOptions[comboOptions.length - 1]
      return nullableData(tail)
    }

    function resetOptions() {
      setComboOptions((prevOptions) => {
        return prevOptions.map((prevOption) => ({
          ...prevOption,
          others: {
            ...prevOption.others,
            type: ComboOptionTypes.notSelected,
          },
        }))
      })
    }

    function hasComboOptions() {
      return comboOptions.length > 0
    }

    return {
      getSelectedOption,
      getPrevOption,
      getNextOption,
      makeOptionSelected,
      getHead,
      getTail,
      hasComboOptions,
      resetOptions,
    }
  }, [setComboOptions, comboOptions])
}

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
          zIndex: 1,
        }}
        {...otherProps}
      />
    </Portal>
  )
})

function nullableData<T>(data: T) {
  return data ? data : null
}

export { Combobox, ComboboxInput, ComboboxList, ComboboxOption }
