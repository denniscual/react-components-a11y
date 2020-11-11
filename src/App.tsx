import React from 'react'
import styles from './App.module.css'
import { Combobox } from './components/combobox'

export default function App() {
  return (
    <div className={styles.Container}>
      <div className={styles.Content}>
        <Combobox />
      </div>
    </div>
  )
}
