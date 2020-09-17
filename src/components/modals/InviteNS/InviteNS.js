import React, { useState } from 'react';
import { Button, Modal, Input} from 'semantic-ui-react'
import { message } from "antd";
import { useSelector } from 'react-redux';

const InviteNS = ({Close}) => {
  let {currentNs, nsSocket} = useSelector(state=>state.chatInfo)
  let {nsMember, _id} = currentNs // nsId
  const [Open, setOpen] = useState(false);
  const [Size, setSize] = useState();
  const [Email, setEmail] = useState("");
  const [hidden, setHidden] = useState(true);

  function show(size) {
    setSize(()=>size);
    setOpen(true);
    Close()
  }

  function close() {
    setOpen(false);
    setEmail("");
    setHidden(true);
  }

  function chkEmail() {
    let isEmail = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;
    return isEmail.test(Email) ? true : false
  }

  function invite(e){
    e.preventDefault();
    let iv = chkEmail();
    let invitedMember = nsMember.find((ele)=>{ // _id, socket만 있으면 됨
      return ele.email ===Email
    })

    invitedMember ? message.error("이미 초대된 멤버입니다") : nsSocket.emit("inviteToNs", {email : Email, _id});

    setOpen(false);
    setEmail("");
  }

  function handleEmail(event) {
    setEmail(event.target.value)
  }

  return (
    <>
      <div onClick={() => { show('tiny') }}>Invite</div>
      <Modal size={Size} open={Open} onClose={close} centered={true}>
        <Modal.Header >네임스페이스 초대</Modal.Header>
        <Modal.Content>
          &emsp;초대할 유저의 E-mail 주소를 입력하세요<hr/>
          <form onSubmit={invite}>
          &emsp;<Input focus value={Email} onChange={handleEmail} placeholder="초대할 유저의 E-mail" />
          </form>
        </Modal.Content>
        <Modal.Actions>
          <Button negative onClick={close}>닫기</Button>
          <Button
            positive
            icon='checkmark'
            labelPosition='right'
            content='생성'
            onClick={invite}
          />
        </Modal.Actions>
      </Modal>
    </>
  );
};

export default InviteNS;