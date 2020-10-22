import React from 'react'
import styles from './App.module.css'
import { SingleAccordion } from './components/accordion'

function App() {
  return (
    <div className={styles.Container}>
      <div className={styles.Content}>
        <SingleAccordion.Accordion>
          <SingleAccordion.Item>
            <h3>
              <SingleAccordion.Button>Irish biography</SingleAccordion.Button>
            </h3>
            <SingleAccordion.Panel>
              <h4>My biography</h4>
              <p>Irish is the son of the great Berto and Chenglylyly</p>
            </SingleAccordion.Panel>
          </SingleAccordion.Item>
          <SingleAccordion.Item>
            <h3>
              <SingleAccordion.Button>Zion biography</SingleAccordion.Button>
            </h3>
            <SingleAccordion.Panel>
              <h4>My biography</h4>
              <p>Zion is the son of the great Irish and Gwapo Dennis</p>
            </SingleAccordion.Panel>
          </SingleAccordion.Item>
          <SingleAccordion.Item>
            <h3>
              <SingleAccordion.Button>Dennis biography</SingleAccordion.Button>
            </h3>
            <SingleAccordion.Panel>
              <h4>My biography</h4>
              <p>Dennis is the son of the great Edna and Cesar</p>
            </SingleAccordion.Panel>
          </SingleAccordion.Item>
          <SingleAccordion.Item>
            <h3>
              <SingleAccordion.Button>Samson biography</SingleAccordion.Button>
            </h3>
            <SingleAccordion.Panel>
              <h4>My biography</h4>
              <p>Samson is the son of the great Ningning</p>
            </SingleAccordion.Panel>
          </SingleAccordion.Item>
        </SingleAccordion.Accordion>
      </div>
    </div>
  )
}

export default App
