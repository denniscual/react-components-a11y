import React, { createContext, useContext, useMemo } from 'react'

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

function useGroupItemsContext<T>() {
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

export { GroupItemsProvider, useGroupItemsContext }
