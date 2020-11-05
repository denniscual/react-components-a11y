import React, { useState } from 'react'
import { CheckboxGroup, Checkbox } from './Checkbox'

export default function Sample() {
  const initState = {
    react: false,
    vue: false,
    svelte: 'mixed',
  } as const
  const [values, setValues] = useState(initState)

  return (
    <div>
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
      <button
        onClick={() => setValues(initState)}
        style={{ display: 'display', marginTop: 16 }}
      >
        Reset
      </button>
    </div>
  )
}
