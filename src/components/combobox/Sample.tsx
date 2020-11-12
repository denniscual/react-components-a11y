import React from 'react'
import {
  Combobox,
  ComboboxInput,
  ComboboxList,
  ComboboxOption,
} from './Combobox'

export default function Sample() {
  return (
    <div>
      <label id="fav-library-combobox">What is your favorite library?</label>
      <Combobox aria-labelledby="fav-library-combobox">
        <ComboboxInput value="hello world" />
        <ComboboxList>
          <ComboboxOption>Reactjs</ComboboxOption>
          <ComboboxOption>Vue</ComboboxOption>
          <ComboboxOption>Svelte</ComboboxOption>
        </ComboboxList>
      </Combobox>
    </div>
  )
}
