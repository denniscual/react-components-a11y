import React from 'react'
import styles from './App.module.css'
import { MultiAccordion } from './components/accordion'

function App() {
  return (
    <div className={styles.Container}>
      <div className={styles.Content}>
        <MultiAccordion.Accordion activeIdx={[0, 1]}>
          <MultiAccordion.Item>
            <h3>
              <MultiAccordion.Button>Irish biography</MultiAccordion.Button>
            </h3>
            <MultiAccordion.Panel>
              <h4>My biography</h4>
              <p>Irish is the son of the great Berto and Chenglylyly</p>
            </MultiAccordion.Panel>
          </MultiAccordion.Item>
          <MultiAccordion.Item>
            <h3>
              <MultiAccordion.Button>Zion biography</MultiAccordion.Button>
            </h3>
            <MultiAccordion.Panel>
              <h4>My biography</h4>
              <p>Zion is the son of the great Irish and Gwapo Dennis</p>
            </MultiAccordion.Panel>
          </MultiAccordion.Item>
          <MultiAccordion.Item>
            <h3>
              <MultiAccordion.Button>Dennis biography</MultiAccordion.Button>
            </h3>
            <MultiAccordion.Panel>
              <h4>My biography</h4>
              <p>Dennis is the son of the great Edna and Cesar</p>
            </MultiAccordion.Panel>
          </MultiAccordion.Item>
          <MultiAccordion.Item>
            <h3>
              <MultiAccordion.Button>Samson biography</MultiAccordion.Button>
            </h3>
            <MultiAccordion.Panel>
              <h4>My biography</h4>
              <p>Samson is the son of the great Ningning</p>
            </MultiAccordion.Panel>
          </MultiAccordion.Item>
        </MultiAccordion.Accordion>
      </div>
    </div>
  )
}

export default App
