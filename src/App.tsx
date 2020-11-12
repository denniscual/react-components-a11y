import React from 'react'
import styles from './App.module.css'
import { Sample as ComboboxSample } from './components/combobox'

export default function App() {
  return (
    <div className={styles.Container}>
      <div className={styles.Content}>
        <ComboboxSample />
      </div>
    </div>
  )
}
