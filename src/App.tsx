import React, {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import styles from './App.module.css'
import { useForkedRef, useIsomorphicLayoutEffect } from './utils'

export default function App() {
  const [values, setValues] = useState({
    react: true,
    vue: false,
    svelte: false,
  } as CheckboxCollection)
  return (
    <div className={styles.Container}>
      <div className={styles.Content}>
        <CheckboxGroup
          value={values}
          onChange={(values) => {
            setValues(values)
          }}
        >
          <fieldset>
            <legend>What are your favorite UI libraries?</legend>
            <div>
              <Checkbox type="checkbox" value="react" id="ui-react" />
              <label htmlFor="ui-react">ReactJS</label>
            </div>
            <input type="text" value="asdf" />
            <div>
              <Checkbox type="checkbox" value="vue" id="ui-vue" />
              <label htmlFor="ui-vue">Vue</label>
            </div>
            <div>
              <Checkbox type="checkbox" value="svelte" id="ui-svelte" />
              <label htmlFor="ui-svelte">Svelte</label>
            </div>
          </fieldset>
        </CheckboxGroup>
      </div>
    </div>
  )
}

// TODO: Make this polymorphic element.
function CheckboxGroup({
  value,
  onChange,
  ...otherProps
}: React.PropsWithChildren<CheckboxGroupProps>) {
  return (
    <div
      /**
       * TODO: We need to make sure the `onChange` is from the nearest checkbox not on the nested checkbox or different
       * input element like input text.
       *
       * We delegate the handling of the `onChange` event to this parent
       * element so that we can centralise the logic of updating the `value` state.
       * https://javascript.info/event-delegation
       *
       * */
      onChange={(event) => {
        const { target } = event
        onChange({
          ...value,
          // @ts-expect-error We expect the error here because the event we are expecting is
          // from input element not from div.
          [target.value]: target.checked, // update here the value of the items,
        })
      }}
    >
      <GroupItemsProvider items={value} setItems={onChange} {...otherProps} />
    </div>
  )
}

interface CheckboxGroupProps {
  value: CheckboxCollection
  onChange(value: CheckboxCollection): void
}

type CheckboxCollection = {
  [key: string]: boolean | 'mixed'
}

/**
 * This type of checkbox supports an additional third state known as partially checked.
 *
 * @see https://www.w3.org/TR/wai-aria-practices-1.2/#checkbox
 * @see https://www.w3.org/TR/wai-aria-practices-1.2/examples/checkbox/checkbox-2/checkbox-2.html
 * */
const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { checked, value, onChange = noop, ...otherProps },
  forwardRef
) {
  const groupItemsCtx = useGroupItemsCtx<boolean | 'mixed'>()
  const groupItemsCtxRef = useRef<typeof groupItemsCtx>(groupItemsCtx)

  const ownRef = React.useRef<HTMLInputElement | null>(null)
  const itemChecked = groupItemsCtx?.items[value] ?? checked

  useIsomorphicLayoutEffect(
    function registerCheckbox() {
      if (groupItemsCtxRef.current && ownRef.current) {
        const { items, registerItem, removeItem } = groupItemsCtxRef.current
        const _itemChecked = items[value]
        registerItem(value, _itemChecked)
        ownRef.current.indeterminate = _itemChecked === 'mixed'

        return () => removeItem(value)
      }
    },
    [value]
  )

  useIsomorphicLayoutEffect(() => {
    if (!groupItemsCtxRef.current && ownRef.current) {
      ownRef.current.indeterminate = itemChecked === 'mixed'
    }
  }, [itemChecked])

  const inputChecked =
    typeof itemChecked === 'boolean' ? itemChecked : undefined
  const ref = useForkedRef(ownRef, forwardRef)

  return (
    <input
      {...otherProps}
      value={value}
      aria-checked={itemChecked}
      ref={ref}
      type="checkbox"
      checked={inputChecked}
      onChange={onChange}
    />
  )
})

interface CheckboxProps
  extends Omit<React.ComponentPropsWithRef<'input'>, 'checked' | 'value'> {
  checked?: boolean | 'mixed'
  value: string
}

function useGroupItemsCtx<T>() {
  const ctx = useContext(GroupItemsContext)
  return ctx as GroupItemsProps<T> | null
}

function GroupItemsProvider({
  items,
  setItems,
  ...otherProps
}: React.PropsWithChildren<{
  items: Record<string, any>
  setItems: (items: Record<string, any>) => void
}>) {
  const ctxValue = useMemo(() => {
    function registerItem(key: string, value: any) {
      setItems({
        ...items,
        [key]: value,
      })
    }

    function removeItem(key: string) {
      delete items[key]
      setItems({
        ...items,
      })
    }

    return {
      items,
      registerItem,
      removeItem,
    }
  }, [items, setItems])

  return <GroupItemsContext.Provider {...otherProps} value={ctxValue} />
}

const GroupItemsContext = createContext<GroupItemsProps | null>(null)
GroupItemsContext.displayName = 'GroupItemsContext'

interface GroupItemsProps<T = any> {
  items: Record<string, T>
  registerItem(key: string, value: T): void
  removeItem(key: string): void
}

function noop() {}
