import React from 'react'
import styles from './App.module.css'
import { TabbedAccordion } from './components/Accordion'

function App() {
  return (
    <div className={styles.Container}>
      <div className={styles.Content}>
        <TabbedAccordion activeIdx={1}>
          <TabbedAccordion.Item idx={0}>
            <h3>
              <TabbedAccordion.Button
                id="accordion-button-zion"
                aria-controls="accordion-panel-zion"
              >
                Zion biography
              </TabbedAccordion.Button>
            </h3>
            <TabbedAccordion.Panel
              id="accordion-panel-zion"
              aria-labelledby="accordion-button-zion"
            >
              <p>Zion is the son of the great Irish and Dennis</p>
            </TabbedAccordion.Panel>
          </TabbedAccordion.Item>
          <TabbedAccordion.Item idx={1}>
            <h3>
              <TabbedAccordion.Button
                id="accordion-button-irish"
                aria-controls="accordion-panel-irish"
              >
                Irish biography
              </TabbedAccordion.Button>
            </h3>
            <TabbedAccordion.Panel
              id="accordion-panel-irish"
              aria-labelledby="accordion-button-irish"
            >
              <p>Irish is the son of the great Berto and Chengly</p>
            </TabbedAccordion.Panel>
          </TabbedAccordion.Item>
        </TabbedAccordion>
      </div>
    </div>
  )
}

export default App
