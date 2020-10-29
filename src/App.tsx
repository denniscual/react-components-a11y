import React from 'react'
import styles from './App.module.css'
import Dialog from './components/Dialog'

function App() {
  return (
    <div className={styles.Container}>
      <div className={styles.Content}>
        <Dialog />
      </div>
    </div>
  )
}

export default App
