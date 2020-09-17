import React from 'react';
import styles from './SidebarRoom.module.css';
import {InviteRoom, LeaveRoom} from "../../modals";
import ChatMember from '../../Chat/ChatMember/ChatMember'
import { useSelector } from 'react-redux';

const SidebarRoom = ({Close, Members}) => {
  let {currentRoom} = useSelector(state => state.chatInfo)
// member, _id,  namespace, nsEndpoint 도 있음
let {isDM } = currentRoom; //roomindex를 버릴경우 여기서 에러남
  return (
      <>
      <section id={styles.header}>
        <div>Details</div>
        <svg width="2em" height="2em" viewBox="0 0 16 16" className={`bi bi-x ${styles.closeicon}`} onClick={Close} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M11.854 4.146a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708-.708l7-7a.5.5 0 0 1 .708 0z"/>
          <path fillRule="evenodd" d="M4.146 4.146a.5.5 0 0 0 0 .708l7 7a.5.5 0 0 0 .708-.708l-7-7a.5.5 0 0 0-.708 0z"/>
        </svg>
      </section>
      <section id={styles.body}>
        <ChatMember Members={Members}/>
      {isDM ||<InviteRoom></InviteRoom>}
        <LeaveRoom></LeaveRoom>
      </section>
    </>
  );
};

export default SidebarRoom;