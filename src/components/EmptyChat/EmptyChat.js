import React from 'react';
import styles from './EmptyChat.module.css'
import {CreateNS} from "../modals";
import styled from "styled-components";

const EmptyChat = ({Socket}) => {
  return (
    <div id={styles.emptychat}>
      <h1>Welcome!</h1>
      <div className={styles.header}>
        <img className={styles.one} src="ex2.png"/>&emsp;<CreateNS Socket={Socket}></CreateNS>
      </div>
      <div className={styles.body}>
        <h3>저희의 채팅과 스케줄 기능을 이용하기 위해서는 먼저 NameSpace를 생성해야합니다.</h3>
        <h3>1. CreateNS버튼을 눌러서 NameSpace를 생성해줍니다.</h3>
        <h3>2. 아이디를 클릭 후 invite로 다른 유저를 초대할 수 있습니다.</h3>
        <h3>3. NameSpace를 생성후 <img src="ex1.png" />버튼으로 채팅방을 생성할 수 있습니다.</h3>
        <h3>4. 채팅방 생성 후 채팅방을 이용할 수 있습니다.</h3>
        <h3>5. Schedule에서는 NameSpace 멤버와 같이 Schedule을 공유 할 수 있습니다.</h3>
        <img src="ex3.png"></img>
      </div>
    </div>
  );
};

export default EmptyChat;

