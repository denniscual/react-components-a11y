import React, { ChangeEvent, useState } from 'react'
import {
  Combobox,
  ComboboxInput,
  ComboboxList,
  ComboboxOption,
} from './Combobox'

export default function Sample() {
  const [text, setText] = useState('')
  const initLibs = ['ReactJS', 'Vue', 'Svelte']
  const [libraries, setLibraries] = useState(initLibs)

  function filterLibs(value: string) {
    if (!Boolean(value)) {
      setLibraries(initLibs)
    } else {
      // do a filter in here
      setLibraries((prevLibs) => {
        return prevLibs.filter((lib) => lib.includes(value))
      })
    }
  }

  /**
   * Fire whenever the user choose an option to the listbox
   * via enter or click events.
   * */
  function onSelect(value: string) {
    setText(value)
    filterLibs(value)
  }

  return (
    <div>
      <label id="fav-library-combobox">What is your favorite library?</label>
      <Combobox aria-labelledby="fav-library-combobox" onSelect={onSelect}>
        <ComboboxInput
          value={text}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            const { value } = event.target
            setText(value)

            const trimmedValue = value.trim()

            filterLibs(trimmedValue)
          }}
        />
        <ComboboxList>
          {libraries.map((library) => (
            <ComboboxOption key={library} label={library} />
          ))}
        </ComboboxList>
      </Combobox>
    </div>
  )
}
