import React from 'react'
import styles from './App.module.css'
import { Sample as CheckboxSample } from './components/checkbox'

export default function App() {
  return (
    <div className={styles.Container}>
      <div className={styles.Content}>
        <CheckboxSample />
      </div>
    </div>
  )
}
