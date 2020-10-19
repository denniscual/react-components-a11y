import React from 'react'
import styles from './App.module.css'
import { Accordion } from './components/Accordion'

function App() {
  return (
    <div className={styles.Container}>
      <div className={styles.Content}>
        <Accordion />
      </div>
    </div>
  )
}

export default App
