import React from 'react'

/**
 * React currently throws a warning when using useLayoutEffect on the server.
 * To get around it, we can conditionally useEffect on the server (no-op) and
 * useLayoutEffect in the browser. We occasionally need useLayoutEffect to
 * ensure we don't get a render flash for certain operations, but we may also
 * need affected components to render on the server. One example is when setting
 * a component's descendants to retrieve their index values.
 *
 * Important to note that using this hook as an escape hatch will break the
 * eslint dependency warnings unless you rename the import to `useLayoutEffect`.
 * Use sparingly only when the effect won't effect the rendered HTML to avoid
 * any server/client mismatch.
 *
 * If a useLayoutEffect is needed and the result would create a mismatch, it's
 * likely that the component in question shouldn't be rendered on the server at
 * all, so a better approach would be to lazily render those in a parent
 * component after client-side hydration.
 *
 * TODO: We are calling useLayoutEffect in a couple of places that will likely
 * cause some issues for SSR users, whether the warning shows or not. Audit and
 * fix these.
 *
 * https://gist.github.com/gaearon/e7d97cdf38a2907924ea12e4ebdf3c85
 * https://github.com/reduxjs/react-redux/blob/master/src/utils/useIsomorphicLayoutEffect.js
 *
 * @param effect
 * @param deps
 */
const useIsomorphicLayoutEffect = canUseDOM()
  ? React.useLayoutEffect
  : React.useEffect

function canUseDOM() {
  return !!(
    typeof window !== 'undefined' &&
    window.document &&
    window.document.createElement
  )
}

function useForceUpdate() {
  const [, dispatch] = React.useReducer((s: number) => s + 1, 0)
  return dispatch
}

function makeId(label: string, anotherLabel: number | string) {
  return `${label}-${anotherLabel}`
}

function useLazyRef<T>(cb: () => T) {
  const lazyRef = React.useRef<T | null>(null)
  if (!lazyRef.current) {
    lazyRef.current = cb()
  }
  return lazyRef.current
}

function classNames(...classNames: string[]) {
  return classNames
    .filter(Boolean)
    .reduce((acc, value) => acc.concat(` ${value}`), '')
    .trim()
}

/**
 * Passes or assigns a value to multiple refs (typically a DOM node). Useful for
 * dealing with components that need an explicit ref for DOM calculations but
 * also forwards refs assigned by an app.
 *
 * @param refs Refs to fork
 */
function useForkedRef<RefValueType = any>(
  ...refs: (AssignableRef<RefValueType> | null | undefined)[]
) {
  return React.useMemo(() => {
    // return null if some of the ref is null
    if (refs.every((ref) => ref === null)) {
      return null
    }
    return (node: any) => {
      refs.forEach((ref) => {
        assignRef(ref, node)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...refs])
}

/**
 * Passes or assigns an arbitrary value to a ref function or object.
 *
 * @param ref
 * @param value
 */
function assignRef<RefValueType = any>(
  ref: AssignableRef<RefValueType> | null | undefined,
  value: any
) {
  if (ref == null) return
  if (isFunction(ref)) {
    ref(value)
  } else {
    try {
      ref.current = value
    } catch (error) {
      throw new Error(`Cannot assign value "${value}" to ref "${ref}"`)
    }
  }
}

/**
 * Checks whether or not a value is a function.
 *
 * @param value
 */
function isFunction(value: any): value is Function {
  return !!(value && {}.toString.call(value) === '[object Function]')
}

/**
 * React.Ref uses the readonly type `React.RefObject` instead of
 * `React.MutableRefObject`, We pretty much always assume ref objects are
 * mutable (at least when we create them), so this type is a workaround so some
 * of the weird mechanics of using refs with TS.
 */
export type AssignableRef<ValueType> =
  | {
      bivarianceHack(instance: ValueType | null): void
    }['bivarianceHack']
  | React.MutableRefObject<ValueType | null>

/**
 * Wraps a lib-defined event handler and a user-defined event handler, returning
 * a single handler that allows a user to prevent lib-defined handlers from
 * firing.
 *
 * @param theirHandler User-supplied event handler
 * @param ourHandler Library-supplied event handler
 */
function wrapEventHandler<EventType extends React.SyntheticEvent | Event>(
  theirHandler: ((event: EventType) => any) | undefined,
  ourHandler: (event: EventType) => any
): (event: EventType) => any {
  return (event) => {
    theirHandler && theirHandler(event)
    // check if in inside the `theirHandler` stops the event propagation of the lib-defined handler like `event.stopPropagation`.
    // If not call, we gonna call the 2 handlers including the lib-defined.
    if (!event.defaultPrevented) {
      return ourHandler(event)
    }
  }
}

export {
  useIsomorphicLayoutEffect,
  useForceUpdate,
  makeId,
  classNames,
  useLazyRef,
  isFunction,
  assignRef,
  useForkedRef,
  wrapEventHandler,
}
