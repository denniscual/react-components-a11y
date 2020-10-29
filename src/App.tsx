import React from 'react'
import styles from './App.module.css'
import Dialog from './components/dialog'

function App() {
  return (
    <div className={styles.Container}>
      <div className={styles.Content}>
        <Dialog aria-labelledby="dialog-title" aria-describedby="dialog-desc">
          <button>Close</button>
          <h1 id="dialog-title">Dialog title</h1>
          <p id="dialog-desc">Dialog description</p>
        </Dialog>
      </div>
    </div>
  )
}

export default App
