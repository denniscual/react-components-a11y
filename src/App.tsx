import React, { useState } from 'react'
import styles from './App.module.css'
import {
  CheckboxGroup,
  Checkbox,
  CheckboxCollection,
} from './components/checkbox'

export default function App() {
  const [values, setValues] = useState({
    react: true,
    vue: false,
    svelte: false,
  } as CheckboxCollection)

  return (
    <div className={styles.Container}>
      <div className={styles.Content}>
        <button
          onClick={() =>
            setValues({
              react: true,
              vue: false,
              svelte: 'mixed',
            })
          }
        >
          Update values
        </button>
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
      </div>
    </div>
  )
}
