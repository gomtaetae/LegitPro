import React from 'react';
import styles from './ChatMember.module.css';
const ChatMember = ({Members}) => {

  function memberList() {
    let list = Members.map((member)=>{
      return (
        <li className={styles.li} key={member._id}>
          <img className={styles.profile} src={member.image} alt="프로필"/>
          &nbsp;<span>{member.name}&nbsp;({member.email})</span>
        </li>
      )
    })
    return list
  }
  return (
    <div id={styles.container}>
      <header id={styles.header}>Member</header>
      <hr className={styles.hr}/>
      <ul className={styles.ul}>
        {memberList()}
      </ul>
    </div>
  );
};

export default ChatMember;