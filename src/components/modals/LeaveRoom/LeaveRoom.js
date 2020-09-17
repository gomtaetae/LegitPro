import React, { useState } from 'react';
import { Button, Modal } from 'semantic-ui-react'
import { useSelector } from 'react-redux';
import styles from './LeaveRoom.module.css';
const LeaveRoom = () => {
  let {userData} = useSelector(state=>state.user)
  let { currentNs, currentRoom, nsSocket } = useSelector(state => state.chatInfo)
  let userId = userData._id
  let {_id} = currentNs
  const [Open, setOpen] = useState(false);
  const [Size, setSize] = useState();

  function show(size) {
    setSize(()=>size);
    setOpen(true);
  }

  function close() { setOpen(false) }

  function leave() {
    nsSocket.emit('quitRoom', {userId, _id, roomId : currentRoom._id});
    setOpen(false);
  }

  return (
    <>
      <div className={styles.button} onClick={() => { show('tiny') }}>Leave Room</div>
      <Modal size={Size} open={Open} onClose={close} centered={true}>
        <Modal.Header>방에서 나가시겠습니까?</Modal.Header>
          {/* <Modal.Content>
            <br/>
          </Modal.Content> */}
          <Modal.Actions>
            <Button negative onClick={close}>취소</Button>
            <Button
              positive
              icon='checkmark'
              labelPosition='right'
              content='나가기'
              onClick={leave}
            />
          </Modal.Actions>
        </Modal>
    </>
  );
};

export default LeaveRoom;