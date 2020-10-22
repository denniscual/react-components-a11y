import React from 'react'

/**
 *  A function which wraps the `React.forwardRef`. This abstracts the
 *  passed generic argument types to return a Polymorphic Component.
 *  This is the "Simplified way".
 *
 *  Though making a Polymorphic Component in typescript is a complex one.
 *  What we want in here is whatever the value of "as" we want to make sure
 *  the inferred props are correct. For the time writing this funciton, the types
 *  are working greatly. Though the returned type of the Component is not the type
 *  returned by the `React.forwardRef`. We did this to make sure the props type are correct.
 *  Depending on the returned type of the `React.forwardRef`, it doesnt returns the correct type. So we just manually assigned the returned type of the `render` as the
 *  return type of the `forwardRefWithAs`.
 * */
export default function forwardRefWithAs<
  T = Element,
  Props = {},
  El extends React.ElementType = React.ElementType,
  /**
   * An object where the keys are html element attributes. The included keys
   * will be removed on the Component props. This is good if library defines a default
   * value likee `id` of the root element and we don't want the user of the Component
   * override the value.
   * */
  OmitAttributeProps = {}
>(
  render: <E extends React.ElementType = El>(
    props: PolymorphicProps<E, Props, OmitAttributeProps>,
    ref:
      | ((instance: T | null) => void)
      | React.MutableRefObject<T | null>
      | null
  ) => React.ReactElement | null
): typeof render {
  // @ts-ignore Ignore this error for now to be able it returns the correct annottated Component.
  return React.forwardRef(render)
}

type PolymorphicProps<
  E extends React.ElementType,
  Props = {},
  OmitAttributeProps = {}
> = PolymorphicOwnProps<Props, E> &
  Omit<
    Omit<React.ComponentProps<E>, keyof OmitAttributeProps>,
    keyof PolymorphicOwnProps<Props, E>
  >

export type PolymorphicOwnProps<
  Props = {},
  E extends React.ElementType = React.ElementType
> = {
  as?: E
} & Props
