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

export {
  useIsomorphicLayoutEffect,
  useForceUpdate,
  makeId,
  classNames,
  useLazyRef,
}
