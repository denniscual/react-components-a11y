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
        <p>
          Quae, perferendis do ornare, dicta interdum, neque, excepteur! Eos
          quasi! Tempor primis quis quaerat! Aperiam rerum aperiam. Convallis
          eleifend, adipisci, duis habitant enim dolore. Id pharetra! Proin
          officiis, corrupti cubilia perspiciatis venenatis. Laboris felis
          suspendisse urna? Pharetra deleniti, duis voluptas vulputate lorem
          veniam? Fugiat assumenda, illo expedita rutrum! Justo aperiam
          temporibus ligula, vero magnis delectus massa? Velit rerum quod
          distinctio, urna penatibus qui? Numquam, facilisis! Assumenda?
          Adipiscing varius voluptatibus conubia maecenas semper, taciti
          necessitatibus at, vitae nascetur, nascetur arcu. Exercitationem,
          consectetuer? Perspiciatis aliquid libero ut facere facere parturient!
          Ullamcorper rutrum, porttitor officia nulla sunt ipsam primis! Minus
          ipsa delectus officia.
        </p>
        <Dialog
          isOpen={isOpen}
          onClose={handleCloseDialog}
          aria-labelledby="dialog-title"
          aria-describedby="dialog-desc"
          disableAutoFocus
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
