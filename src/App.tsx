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
        </Dialog>
      </div>
      <p>
        Soluta excepturi praesent cursus eos, varius beatae hymenaeos, neque
        ipsa proin dictumst perferendis quibusdam laoreet diamlorem nostra
        necessitatibus eaque iaculis cras rerum pede deleniti, cupidatat
        distinctio, ante conubia volutpat repudiandae? Distinctio dapibus
        viverra aliquam morbi magni repudiandae dapibus labore cubilia. Sit
        eveniet, nunc quod ipsam. At autem exercitationem ipsa ullamco molestie,
        accusantium per taciti sit numquam, duis tellus morbi praesentium,
        diamlorem hendrerit, metus. Facilisi? Massa, ullamco ultrices iure esse
        eu nostra tortor, nihil volutpat accumsan nostra minima pretium, ab
        ipsum diam. Gravida reiciendis quisquam, praesentium delectus, nisl
        velit? Potenti corporis, amet? Sociis diam venenatis penatibus
        fermentum. Libero eligendi. Vel egestas.
      </p>
    </div>
  )
}

export default App
