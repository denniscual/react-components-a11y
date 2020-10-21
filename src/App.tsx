import React from 'react'
import styles from './App.module.css'
import {
  SingleAccordion,
  SingleAccordionItem,
  SingleAccordionPanel,
  SingleAccordionButton,
} from './components/Accordion'

function App() {
  const ref = React.useRef<HTMLButtonElement | null>(null)
  return (
    <div className={styles.Container}>
      <div className={styles.Content}>
        <SingleAccordion>
          <SingleAccordionItem>
            <h3>
              <SingleAccordionButton ref={ref}>
                Irish biography
              </SingleAccordionButton>
            </h3>
            <SingleAccordionPanel>
              <h4>My biography</h4>
              <p>Irish is the son of the great Berto and Chenglylyly</p>
            </SingleAccordionPanel>
          </SingleAccordionItem>
          <SingleAccordionItem>
            <h3>
              <SingleAccordionButton>Zion biography</SingleAccordionButton>
            </h3>
            <SingleAccordionPanel>
              <h4>My biography</h4>
              <p>Zion is the son of the great Irish and Dennis</p>
            </SingleAccordionPanel>
          </SingleAccordionItem>
          <SingleAccordionItem>
            <h3>
              <SingleAccordionButton>Dennis biography</SingleAccordionButton>
            </h3>
            <SingleAccordionPanel>
              <h4>My biography</h4>
              <p>Dennis is the son of the great Edna and Cesar</p>
            </SingleAccordionPanel>
          </SingleAccordionItem>
          <SingleAccordionItem>
            <h3>
              <SingleAccordionButton>Samson biography</SingleAccordionButton>
            </h3>
            <SingleAccordionPanel>
              <h4>My biography</h4>
              <p>Samson is the son of the great Ningning</p>
            </SingleAccordionPanel>
          </SingleAccordionItem>
        </SingleAccordion>
      </div>
    </div>
  )
}

export default App
