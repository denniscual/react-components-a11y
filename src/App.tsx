import React from 'react'
import styles from './App.module.css'
import {
  SingleAccordion,
  MultiAccordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionType,
} from './components/accordion'

function App() {
  return (
    <div className={styles.Container}>
      <div className={styles.Content}>
        <SingleAccordion type={AccordionType.collapsible}>
          <AccordionItem>
            <h3>
              <AccordionButton>Irish biography</AccordionButton>
            </h3>
            <AccordionPanel>
              <h4>My biography</h4>
              <p>Irish is the son of the great Berto and Chenglylyly</p>
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem>
            <h3>
              <AccordionButton>Zion biography</AccordionButton>
            </h3>
            <AccordionPanel>
              <h4>My biography</h4>
              <p>Zion is the son of the great Irish and Gwapo Dennis</p>
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem>
            <h3>
              <AccordionButton>Dennis biography</AccordionButton>
            </h3>
            <AccordionPanel>
              <h4>My biography</h4>
              <p>Dennis is the son of the great Edna and Cesar</p>
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem>
            <h3>
              <AccordionButton>Samson biography</AccordionButton>
            </h3>
            <AccordionPanel>
              <h4>My biography</h4>
              <p>Samson is the son of the great Ningning</p>
            </AccordionPanel>
          </AccordionItem>
        </SingleAccordion>
      </div>
      <div className={styles.Content}>
        <MultiAccordion>
          <AccordionItem>
            <h3>
              <AccordionButton>Irish biography</AccordionButton>
            </h3>
            <AccordionPanel>
              <h4>My biography</h4>
              <p>Irish is the son of the great Berto and Chenglylyly</p>
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem>
            <h3>
              <AccordionButton>Zion biography</AccordionButton>
            </h3>
            <AccordionPanel>
              <h4>My biography</h4>
              <p>Zion is the son of the great Irish and Gwapo Dennis</p>
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem>
            <h3>
              <AccordionButton>Dennis biography</AccordionButton>
            </h3>
            <AccordionPanel>
              <h4>My biography</h4>
              <p>Dennis is the son of the great Edna and Cesar</p>
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem>
            <h3>
              <AccordionButton>Samson biography</AccordionButton>
            </h3>
            <AccordionPanel>
              <h4>My biography</h4>
              <p>Samson is the son of the great Ningning</p>
            </AccordionPanel>
          </AccordionItem>
        </MultiAccordion>
      </div>
    </div>
  )
}

export default App
