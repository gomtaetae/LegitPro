import React from 'react';
import styles from'./ScheduleModal.module.css';
import { useRef } from 'react';

const ScheduleModal = ({children}) => {
  let modal = useRef();
  function Open() { modal.current.classList.remove(styles.hidden) }
  function Close() { modal.current.classList.add(styles.hidden) }

  return (
    <>
    {/* 버튼에 onClick={Open} 달기 */}
      <div className={styles.button} onClick={Open}>{children[0]}</div>
      <section ref={modal} className={`${styles.modal} ${styles.hidden}`} >
        <section  className={styles.overlay} onClick={Close}></section>
        <section className={styles.content}>
          <header className={styles.content__header}> {children[1]} </header>
          <i className={`fas fa-times ${styles.closeicon}`} onClick={Close}></i>
          <article className={styles.content__body}> {children[2]} </article>
        </section>
      </section>
    </>
  );
};

export default ScheduleModal;

