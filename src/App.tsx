import React from 'react'
import styles from './App.module.css'
import { SingleAccordion, SingleAccordionTypes } from './components/Accordion'

function App() {
  return (
    <div className={styles.Container}>
      <div className={styles.Content}>
        <SingleAccordion activeIdx={0} type={SingleAccordionTypes.collapsible}>
          <SingleAccordion.Item idx={0}>
            <h3>
              <SingleAccordion.Button
                id="accordion-button-zion"
                aria-controls="accordion-panel-zion"
              >
                Zion biography
              </SingleAccordion.Button>
            </h3>
            <SingleAccordion.Panel
              id="accordion-panel-zion"
              aria-labelledby="accordion-button-zion"
            >
              <p>Zion is the son of the great Irish and Dennis</p>
            </SingleAccordion.Panel>
          </SingleAccordion.Item>
          <SingleAccordion.Item idx={1}>
            <h3>
              <SingleAccordion.Button
                id="accordion-button-irish"
                aria-controls="accordion-panel-irish"
              >
                Irish biography
              </SingleAccordion.Button>
            </h3>
            <SingleAccordion.Panel
              id="accordion-panel-irish"
              aria-labelledby="accordion-button-irish"
            >
              <p>Irish is the son of the great Berto and Chengly</p>
            </SingleAccordion.Panel>
          </SingleAccordion.Item>
        </SingleAccordion>
      </div>
    </div>
  )
}

export default App
