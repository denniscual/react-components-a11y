import React, {
  forwardRef,
  useRef,
  useMemo,
  useContext,
  createContext,
} from 'react'
import { useForkedRef, useIsomorphicLayoutEffect } from '../../utils'

/**
 * Group the checkboxes and handle the checkboxes state based on the `value` and `onChange` props of this Component.
 *
 * @example
 *
 * export default function App() {
 *   const [values, setValues] = useState({
 *     react: true,
 *     vue: false,
 *     svelte: false,
 *   })
 *
 *   return (
 *       <CheckboxGroup
 *         value={values}
 *         onChange={(values) => {
 *           setValues(values)
 *         }}
 *       >
 *         <fieldset>
 *           <legend>What are your favorite UI libraries?</legend>
 *           <div>
 *             <Checkbox type="checkbox" value="react" id="ui-react" />
 *             <label htmlFor="ui-react">ReactJS</label>
 *           </div>
 *           <div>
 *             <Checkbox type="checkbox" value="vue" id="ui-vue" />
 *             <label htmlFor="ui-vue">Vue</label>
 *           </div>
 *           <div>
 *             <Checkbox type="checkbox" value="svelte" id="ui-svelte" />
 *             <label htmlFor="ui-svelte">Svelte</label>
 *           </div>
 *         </fieldset>
 *       </CheckboxGroup>
 *    )
 *  }
 * */
function CheckboxGroup<T extends { [key: string]: boolean | 'mixed' }>({
  value,
  onChange,
  ...otherProps
}: React.PropsWithChildren<CheckboxGroupProps<T>>) {
  return (
    <GroupItemsProvider items={value} setItems={onChange} {...otherProps} />
  )
}

interface CheckboxGroupProps<T = any> {
  value: CheckboxCollection<T>
  onChange(value: CheckboxCollection<T>): void
}

export type CheckboxCollection<T = any> = T

/**
 * Checkbox
 *
 * This type of checkbox supports an additional third state known as partially checked.
 * One common use of a tri-state checkbox can be found in software installers where a single
 * tri-state checkbox is used to represent and control the state of an entire group of install options.
 * And, each option in the group can be individually turned on or off with a dual state checkbox.
 *
 * @see https://www.w3.org/TR/wai-aria-practices-1.2/#checkbox
 * @see https://www.w3.org/TR/wai-aria-practices-1.2/examples/checkbox/checkbox-2/checkbox-2.html
 *
 * @example
 *
 * <Checkbox type="checkbox" value="react" id="ui-react" />
 * */
const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { checked, value, onChange, ...otherProps },
  forwardRef
) {
  const groupItemsCtx = useGroupItemsCtx<boolean | 'mixed'>()
  const groupItemsCtxRef = useRef<typeof groupItemsCtx>(groupItemsCtx)
  const itemChecked = groupItemsCtx?.items[value] ?? checked
  const ownRef = React.useRef<HTMLInputElement | null>(null)

  useIsomorphicLayoutEffect(
    function registerCheckbox() {
      if (groupItemsCtxRef.current && ownRef.current) {
        const { items, setItem, removeItem } = groupItemsCtxRef.current
        const _itemChecked = items[value]
        setItem(value, _itemChecked)
        ownRef.current.indeterminate = _itemChecked === 'mixed'

        return () => removeItem(value)
      }
    },
    [value]
  )

  useIsomorphicLayoutEffect(() => {
    if (ownRef.current) {
      ownRef.current.indeterminate = itemChecked === 'mixed'
    }
  }, [itemChecked])

  const handleOnChange =
    onChange && groupItemsCtx
      ? onChange
      : (event: React.ChangeEvent<HTMLInputElement>) => {
          if (groupItemsCtx) {
            groupItemsCtx.setItem(value, event.currentTarget.checked)
          }
        }

  const inputChecked = typeof itemChecked === 'boolean' && itemChecked
  const ref = useForkedRef(ownRef, forwardRef)

  return (
    <input
      {...otherProps}
      value={value}
      aria-checked={itemChecked}
      /**
       * When checked, the checkbox element has state aria-checked set to true.
       * When not checked, it has state aria-checked set to false.
       * When partially checked, it has state aria-checked set to mixed.
       * - https://www.w3.org/TR/wai-aria-practices-1.2/#wai-aria-roles-states-and-properties-5
       * */
      checked={inputChecked}
      ref={ref}
      type="checkbox"
      onChange={handleOnChange}
    />
  )
})

interface CheckboxProps
  extends Omit<React.ComponentPropsWithRef<'input'>, 'checked' | 'value'> {
  checked?: boolean | 'mixed'
  value: string
}

function GroupItemsProvider<T extends { [key: string]: any }>({
  items,
  setItems,
  ...otherProps
}: React.PropsWithChildren<GroupItemsProviderProps<T>>) {
  const ctxValue = useMemo(() => {
    function setItem(key: string, value: any) {
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
      setItem,
      removeItem,
    }
  }, [items, setItems])

  return <GroupItemsContext.Provider {...otherProps} value={ctxValue} />
}

interface GroupItemsProviderProps<T extends { [key: string]: any }> {
  items: T
  setItems(value: T): void
}

function useGroupItemsCtx<T>() {
  const ctx = useContext(GroupItemsContext)
  return ctx as GroupItemsProps<T> | null
}

const GroupItemsContext = createContext<GroupItemsProps | null>(null)
GroupItemsContext.displayName = 'GroupItemsContext'

interface GroupItemsProps<T = any> {
  items: {
    [key: string]: T
  }
  setItem(key: string, value: T): void
  removeItem(key: string): void
}

export { Checkbox, CheckboxGroup }
