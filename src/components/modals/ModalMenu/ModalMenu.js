import React from 'react';
import styles from './ModalMenu.module.css';
import { useRef } from 'react';
import {InviteNS, LeaveNS, SettingNS, CreateNS} from "../";
const ModalMenu = ({isAdmin, nsTitle, username, Socket}) => {
  let modal = useRef();
  let overlay = useRef();
  

  function Open() {
    console.log(modal.current.classList);
    modal.current.classList.remove(styles.hidden) // 클래스리스트에서 특정 클래스네임제거
  }
  function Close() {
    console.log(modal.current.classList.value);
    modal.current.classList.add(styles.hidden)
  }

  return (
    <>
      <div id={styles.header_button} onClick={Open}>
        <span id={styles.header_teamname}>{nsTitle}</span>
        <span id={styles.header_username}># {username}</span>
      </div>
      <div ref={modal} className={`${styles.modal} ${styles.hidden}`} >
        <div ref={overlay} className={styles.overlay} onClick={Close}></div>
        <div className={styles.content} >
          <p>Namespace Settings</p>
          <InviteNS Close={Close}></InviteNS>
          <LeaveNS Close={Close}></LeaveNS>
          <CreateNS Socket={Socket}></CreateNS>
          {isAdmin && <SettingNS Close={Close}></SettingNS> } 
          {/* <hr/> */}
        </div>
      </div>
      
    </>
  );
};

export default ModalMenu;