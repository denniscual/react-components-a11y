import React from 'react'

export type PolymorphicComp<
  El extends React.ElementType = React.ElementType,
  Props = {},
  OmitAttributeProps = {}
> = <E extends React.ElementType = El>(
  props: PolymorphicProps<E, Props, OmitAttributeProps>
) => React.ReactElement | null

// export interface PolymorphicComp<
//   El extends React.ElementType = React.ElementType,
//   Props = {},
//   OmitAttributeProps = {}
// > {
//   <E extends React.ElementType = El>(
//     props: PolymorphicProps<E, Props, OmitAttributeProps>
//   ): React.ReactElement | null
//   displayName?: string
//   // explicit rejected with `never` required due to
//   // https://github.com/microsoft/TypeScript/issues/36826
//   /**
//    * defaultProps are not supported on render functions
//    */
//   defaultProps?: never
//   /**
//    * propTypes are not supported on render functions
//    */
//   propTypes?: never
// }

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
