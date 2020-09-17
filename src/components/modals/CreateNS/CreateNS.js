import React, { useState } from 'react';
import { Button, Modal } from 'semantic-ui-react'
import { useSelector } from 'react-redux';

const CreateNS = ({Socket}) => {
  let {_id} = useSelector(state=>state.user.userData)  //유저아이디

  const [Open, setOpen] = useState(false);
  const [Size, setSize] = useState();
  const [nsTitle, setNsTitle] = useState("");

  function show(size) {
    setSize(()=>size);
    setOpen(true);
  }

  function close() {
    setOpen(false);
  }

  function createNs(e){
    e.preventDefault();
    //axios요청으로 뺄 수 있나?
    Socket.emit("NewNs", {nsTitle, _id});
    setOpen(false);
    setNsTitle("");
  }

  function handleNstitle(event) {
    setNsTitle(event.target.value)
  }

  return (
    <>
      <div onClick={() => { show('small') }}>Create NS</div>
        <Modal size={Size} open={Open} onClose={close} centered={true}>
          <Modal.Header >네임스페이스 생성</Modal.Header>
          <Modal.Content>
            네임스페이스 이름 입력 (공백불가) <hr/>
            <form onSubmit={createNs}>
              <input type="text" value={nsTitle} onChange={handleNstitle} placeholder="네임스페이스 이름 입력"/>
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