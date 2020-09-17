import React, { useState } from 'react';
import { Button, Modal, Input, Checkbox } from 'semantic-ui-react'
import {useSelector} from 'react-redux';
import styles from './CreateRoom.module.css';

const CreateRoom = ({children}) => {
  let {_id} = useSelector(state=>state.user.userData) //유저아이디
  let {nsSocket, currentNs} = useSelector(state=>state.chatInfo)
  const [Open, setOpen] = useState(false);
  const [Size, setSize] = useState();
  const [roomTitle, setRoomTitle] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [hidden, setHidden] = useState(true);
  
  function show(size) {
    setSize(size);
    setOpen(true);
  }
  function close() { 
    setOpen(false); 
    setRoomTitle("");
    setHidden(true);
  }
  function handlePrivate(e) {
    setIsPrivate(value=>!value)
  }
  function handleRoomTitle(event) {
    setRoomTitle(event.target.value)
  }

  //방이름 정규표현식
  function chkRoom(){
    let isNS = /^[가-힣a-zA-Z0-9]([_]?[가-힣a-zA-Z0-9]){2,20}$/;
    return isNS.test(roomTitle) ? true : false;
  }

  function createRoom(e){
    e.preventDefault();
    //여기서 받아온 데이터로 REST요청을 보내서 방을 생성할 것 (중복검사도 해야됨)
    //+ 네임스페이스 이름을 알아야 조회해서 push하고 업데이트 할 것
    //isPrivate여부에 따라서 data를 다르게 emit할 것?
    /*
    if(isPrivate){
      nsSocket.emit("NewRoom", {roomTitle, isPrivate, _id, Ns_id : currentNs._id})
    }else{
      let ids = currentNs.nsMember.map(person=>person._id)
      nsSocket.emit("NewRoom", {roomTitle, isPrivate, ids, Ns_id : currentNs._id})
    }
    */
    //setOpen(false);
    setRoomTitle("");

    let room = chkRoom();
    if(room){
      if(isPrivate){
        nsSocket.emit("NewRoom", {roomTitle, isPrivate, _id, Ns_id : currentNs._id})
      }else{
        let ids = currentNs.nsMember.map(person=>person._id)
        nsSocket.emit("NewRoom", {roomTitle, isPrivate, ids, Ns_id : currentNs._id})
      }
      setOpen(false)
      setHidden(true)
    } else {
      setOpen(true)
      setRoomTitle(roomTitle)
      setHidden(false)
    }
  }

  return (
    <>
      <span onClick={() => { show('tiny') }} style={{cursor : 'pointer'}}>{children}</span>
        <Modal size={Size} open={Open} onClose={close} centered={true}>
          <Modal.Header>방 생성</Modal.Header>
          <Modal.Content>
          &emsp;생성할 방의 이름을 적으세요<hr/>
            <form onSubmit={createRoom}>
              &emsp;<Input focus value={roomTitle} onChange={handleRoomTitle} placeholder="방 이름" error={!hidden}/>
              &emsp;<Checkbox label='비밀방' checked={isPrivate} onClick={handlePrivate} toggle/>
              <br />&emsp;
              {!hidden && <span className={styles.check_hidden}>_를 제외한 특수문자는 사용하실 수 없습니다.(2~20글자)</span>}
            </form>
          </Modal.Content>
          <Modal.Actions>
            <Button negative onClick={close}>닫기</Button>
            <Button
              positive
              icon='checkmark'
              labelPosition='right'
              content='생성'
              onClick={createRoom}
            />
          </Modal.Actions>
        </Modal>
    </>
  );
};

export default CreateRoom;