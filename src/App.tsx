import React from 'react'
import styles from './App.module.css'
import { SingleAccordion } from './components/Accordion'

function App() {
  return (
    <div className={styles.Container}>
      <div className={styles.Content}>
        <SingleAccordion id="biography-accordion" activeIdx={0}>
          <SingleAccordion.Item idx={0}>
            <h3>
              <SingleAccordion.Button>Zion biography</SingleAccordion.Button>
            </h3>
            <SingleAccordion.Panel role="region">
              <h4>My biography</h4>
              <p>Zion is the son of the great Irish and Dennis</p>
            </SingleAccordion.Panel>
          </SingleAccordion.Item>
          <SingleAccordion.Item idx={1}>
            <h3>
              <SingleAccordion.Button>Irish biography</SingleAccordion.Button>
            </h3>
            <SingleAccordion.Panel role="region">
              <h4>My biography</h4>
              <p>Irish is the son of the great Berto and Chengly</p>
            </SingleAccordion.Panel>
          </SingleAccordion.Item>
        </SingleAccordion>
      </div>
    </div>
  )
}

export default App
