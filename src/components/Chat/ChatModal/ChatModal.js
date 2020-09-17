import React from 'react';
import styles from'./ChatModal.module.css';
import { useSelector } from 'react-redux';

const ChatModal = ({message, Modify, Delete}) => {
  let { _id } = useSelector(state => state.user.userData)
  let {userId} = message
  return (
    <div className={styles.content_wrapper}>
      <section className={styles.content}>
        <i className={`far fa-laugh ${styles.content__body}` }></i>
        {userId === _id && <i className={`fas fa-edit ${styles.content__body}`} onClick={Modify}></i>}
        {userId === _id && <i className={`fas fa-trash-alt ${styles.content__body}`} onClick={Delete}></i>}
        <i className={`fas fa-ellipsis-h ${styles.content__body}`} ></i>
      </section>
    </div>
  );
};
export default ChatModal;
