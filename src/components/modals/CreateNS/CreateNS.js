import React, { useState } from 'react';
import { Button, Input, Modal } from 'semantic-ui-react'
import { useSelector } from 'react-redux';
import styles from './CreateNS.module.css';

const CreateNS = ({Socket}) => {
  let {_id} = useSelector(state=>state.user.userData)  //유저아이디

  const [Open, setOpen] = useState(false);
  const [Size, setSize] = useState();
  const [nsTitle, setNsTitle] = useState("");
  const [hidden, setHidden] = useState(true);

  function show(size) {
    setSize(()=>size);
    setOpen(true);
  }

  function close() {
    setOpen(false);
    setNsTitle("");
    setHidden(true);
  }
  
  //NS 정규표현식
  function chkNS(){
    let isNS = /^[가-힣a-zA-Z0-9]([_]?[가-힣a-zA-Z0-9]){2,20}$/;
    return isNS.test(nsTitle) ? true : false;
  }
  
  function createNs(e){
    e.preventDefault();
    //axios요청으로 뺄 수 있나?
    setNsTitle("");
    
    let ns = chkNS()
    if(ns) {
      Socket.emit("NewNs", {nsTitle, _id});
      setOpen(false);
      setHidden(true)
    }
    else {
      setOpen(true);
      setNsTitle(nsTitle);
      setHidden(false)
    }
  }

  function handleNstitle(event) {
    setNsTitle(event.target.value)
  }

  return (
    <>
      <div onClick={() => { show('tiny') }} className={styles.button}>Create NS</div>
        <Modal size={Size} open={Open} onClose={close} centered={true}>
          <Modal.Header >네임스페이스 생성</Modal.Header>
          <Modal.Content>
            &emsp;생성할 네임스페이스 이름을 입력하세요 <hr/>
            <form onSubmit={createNs}>
            &emsp;<Input focus value={nsTitle} onChange={handleNstitle} placeholder="네임스페이스 입력" error={!hidden}/>
            <br/>&emsp;{!hidden && <span className={styles.check_hidden}>_를 제외한 특수문자는 사용하실 수 없습니다.(2~20글자)</span>}
            </form>
            
          </Modal.Content>
          
          <Modal.Actions>
            <Button negative onClick={close}>닫기</Button>
            <Button
              positive
              icon='checkmark'
              labelPosition='right'
              content='생성'
              onClick={createNs}
            />
          </Modal.Actions>
        </Modal>
    </>
  );
};

export default CreateNS;