import React from 'react';
import styles from '../kiosk/kiosk.module.css';
import { useNavigate } from 'react-router-dom';

function Kiosk() {
  const navigate = useNavigate();

  const handleSelection = (option) => {
    navigate('/selection', { state: { option } });
  };

  return (
    <div>
      {/* Logo */}
      <div
        className={styles.logo}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <img
          src="/mcdonalds-logo-png-free-11658872846yvcfcod0y9.png"
          alt="Logo"
        />
      </div>

      {/* Question */}
      <div className={styles.question}>Where will you enjoy McDonald's?</div>

      {/* Options */}
      <div className={styles.options}>
        <div className={styles.option} onClick={() => handleSelection('Here')}>
          <img src="/images.jpeg" alt="Here" />
          <span>Here</span>
        </div>
        <div className={styles.option} onClick={() => handleSelection('To Go')}>
          <img src="/u8or-hero.webp" alt="To Go" />
          <span>To Go</span>
        </div>
      </div>

      {/* Footer */}
      <div className={styles.footer} style={{ display: 'flex', padding: '10px', paddingTop: '30px' }}>
        <div className={styles.footerLeft}>
          <button className={styles.btn}>Start Over</button>
          <button className={styles.btn}>Accessibility</button>
        </div>
      </div>
    </div>
  );
}

export default Kiosk;
