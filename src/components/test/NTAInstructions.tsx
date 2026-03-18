'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './NTAInstructions.module.css';

interface Props {
  testId: string;
}

export default function NTAInstructions({ testId }: Props) {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleProceed = () => {
    if (!agreed) {
      setShowModal(true);
      return;
    }
    // Proceed to test
    router.push(`/test/${testId}/exam`);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>National Testing Agency</div>
      </header>

      <main className={styles.mainContent}>
        <h2 className={styles.heading}>GENERAL INSTRUCTIONS</h2>
        
        <div className={styles.instructions}>
          <h4>General Instructions:</h4>
          <ol>
            <li>Total duration of examination is as specified in the test details.</li>
            <li>The clock will be set at the server. The countdown timer in the top right corner of screen will display the remaining time available for you to complete the examination. When the timer reaches zero, the examination will end by itself. You will not be required to end or submit your examination.</li>
            <li>The Question Palette displayed on the right side of screen will show the status of each question using one of the following symbols:
              <ul style={{ listStyleType: 'none', paddingLeft: 0, marginTop: '10px' }}>
                <li style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ display: 'inline-block', width: '30px', height: '30px', background: '#e0e0e0', border: '1px solid #999', textAlign: 'center', lineHeight: '28px', marginRight: '10px', borderRadius: '4px', fontWeight: 'bold' }}>1</span> You have not visited the question yet.
                </li>
                <li style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ display: 'inline-block', width: '30px', height: '30px', background: '#ff5722', color: 'white', textAlign: 'center', lineHeight: '26px', marginRight: '10px', clipPath: 'polygon(0 0, 100% 0, 100% 75%, 50% 100%, 0 75%)', fontWeight: 'bold' }}>2</span> You have not answered the question.
                </li>
                <li style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ display: 'inline-block', width: '30px', height: '30px', background: '#4caf50', color: 'white', textAlign: 'center', lineHeight: '36px', marginRight: '10px', clipPath: 'polygon(50% 0%, 100% 25%, 100% 100%, 0 100%, 0% 25%)', fontWeight: 'bold' }}>3</span> You have answered the question.
                </li>
                <li style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ display: 'inline-block', width: '30px', height: '30px', background: '#673ab7', color: 'white', textAlign: 'center', lineHeight: '30px', borderRadius: '50%', marginRight: '10px', fontWeight: 'bold' }}>4</span> You have NOT answered the question, but have marked the question for review.
                </li>
                <li style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ display: 'inline-block', width: '30px', height: '30px', background: '#673ab7', color: 'white', textAlign: 'center', lineHeight: '30px', borderRadius: '50%', position: 'relative', marginRight: '10px', fontWeight: 'bold' }}>
                    5
                    <span style={{ position: 'absolute', right: '-4px', bottom: '-4px', width: '14px', height: '14px', background: '#4caf50', borderRadius: '50%', border: '1px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: 'white', fontSize: '9px', fontWeight: 'bold', lineHeight: '1' }}>✓</span>
                    </span>
                  </span> 
                  The question(s) "Answered and Marked for Review" will be considered for evaluation.
                </li>
              </ul>
            </li>
          </ol>

          <h4>Navigating to a Question:</h4>
          <ol start={4}>
            <li>To answer a question, do the following:
              <ol style={{ listStyleType: 'lower-alpha' }}>
                <li>Click on the question number in the Question Palette at the right of your screen to go to that numbered question directly. Note that using this option does NOT save your answer to the current question.</li>
                <li>Click on <strong>Save & Next</strong> to save your answer for the current question and then go to the next question.</li>
                <li>Click on <strong>Mark for Review & Next</strong> to save your answer for the current question, mark it for review, and then go to the next question.</li>
              </ol>
            </li>
          </ol>

          <h4>Answering a Question:</h4>
          <ol start={5}>
            <li>Procedure for answering a multiple choice type question:
              <ol style={{ listStyleType: 'lower-alpha' }}>
                <li>To select your answer, click on the button of one of the options</li>
                <li>To deselect your chosen answer, click on the button of the chosen option again or click on the <strong>Clear Response</strong> button</li>
                <li>To change your chosen answer, click on the button of another option</li>
                <li>To save your answer, you MUST click on the <strong>Save & Next</strong> button</li>
                <li>To mark the question for review, click on the <strong>Mark for Review & Next</strong> button.</li>
              </ol>
            </li>
            <li>To change your answer to a question that has already been answered, first select that question for answering and then follow the procedure for answering that type of question.</li>
          </ol>

          <h4>Navigating through sections:</h4>
          <ol start={7}>
            <li>Sections in this question paper are displayed on the top bar of the screen. Questions in a section can be viewed by clicking on the section name. The section you are currently viewing will be highlighted.</li>
            <li>After clicking the <strong>Save & Next</strong> button on the last question for a section, you will automatically be taken to the first question of the next section.</li>
            <li>You can shuffle between sections and questions anytime during the examination as per your convenience only during the time stipulated.</li>
            <li>Candidate can view the corresponding section summary as part of the legend that appears in every section above the question palette.</li>
          </ol>

          <p className={styles.warningText}>
            Please note all questions will appear in your default language. This language can be changed for a particular question later on.
          </p>
        </div>

        <div className={styles.confirmationContainer}>
          <input 
            type="checkbox" 
            id="confirmation" 
            className={styles.checkbox}
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />
          <label htmlFor="confirmation" className={styles.confirmationText}>
            I have read and understood the instructions. All computer hardware allotted to me are in proper working condition. I declare that I am not in possession of / not wearing / not carrying any prohibited gadget like mobile phone, bluetooth devices etc. / any prohibited material with me into the Examination Hall. I agree that in case of not adhering to the instructions, I shall be liable to be debarred from this Test and/or to disciplinary action, which may include ban from future Tests / Examinations
          </label>
        </div>

        <div className={styles.actionContainer}>
          <button 
            className={styles.proceedBtn}
            onClick={handleProceed}
            disabled={!agreed}
          >
            PROCEED
          </button>
        </div>
      </main>

      {/* Warning Modal */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalTitle}>Warning!</div>
            <div className={styles.modalText}>Please accept terms and conditions before proceeding.</div>
            <button 
              className={styles.modalBtn}
              onClick={() => setShowModal(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
