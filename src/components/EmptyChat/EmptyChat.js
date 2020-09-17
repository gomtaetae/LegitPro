import React from 'react';
import styles from './EmptyChat.module.css'
import {CreateNS} from "../modals";

const EmptyChat = ({Socket}) => {
  return (
    <div id={styles.emptychat}>
      <h1>It's empty now</h1>
      <CreateNS Socket={Socket}></CreateNS>
    </div>
  );
};

export default EmptyChat;