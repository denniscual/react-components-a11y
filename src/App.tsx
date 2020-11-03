import React, { useState } from 'react'
import styles from './App.module.css'
import Dialog from './components/dialog'

function App() {
  const [isOpen, setIsOpen] = useState(false)

  function handleCloseDialog() {
    setIsOpen(false)
  }

  return (
    <div className={styles.Container}>
      <div className={styles.Content}>
        <button onClick={() => setIsOpen(true)}>Open dialog</button>
        <Dialog
          isOpen={isOpen}
          onClose={handleCloseDialog}
          aria-labelledby="dialog-title"
          aria-describedby="dialog-desc"
        >
          <button onClick={handleCloseDialog}>Close</button>
          <h1 id="dialog-title">Dialog title</h1>
          <p id="dialog-desc">Dialog description</p>
          <div>
            <label>
              Username
              <input type="text" />
            </label>
            <label>
              Password
              <input type="password" />
            </label>
          </div>
        </Dialog>
      </div>
    </div>
  )
}

export default App
