import React, { useState } from "react";
import { message } from "antd";
import { Button, Modal } from 'semantic-ui-react'
import { useSelector } from 'react-redux';
import styles from './InviteRoom.module.css';
const InviteRoom = () => {
  //필요한 것 : Ns멤버목록(멤버선택을 위해), NsSocket(emit을 위해)
  let {currentNs, currentRoom, nsSocket} = useSelector(state=>state.chatInfo) // nsSocket 도 있음
  const [Open, setOpen] = useState(false);
  const [Size, setSize] = useState();
  const [Email, setEmail] = useState("");
  let MemberArray = list(currentNs.nsMember, currentRoom.member) // 방멤버가 아닌배열 (초대목록) (정상) image, _id, email, name

  function show(size) {
    setSize(()=>size);
    setOpen(true);
  }

  function close() { setOpen(false) }

  function invite(e){
    e.preventDefault();
    //이메일을 알아야한다 (Email state)
    let invitedMembers = MemberArray.find(member=> (member.email===Email) )
    if (invitedMembers !== undefined) {
      //네임스페이스 식별자도 보내야함
      nsSocket.emit('inviteToRoom', {_id : invitedMembers._id, NS_id : currentNs._id, nsTitle : currentNs.nsTitle, roomId : currentRoom._id})
    }else {
      message.error("이미 초대된 유저이거나 일치하는 유저가 없습니다");
    }
    setOpen(false);
  }

  function handleEmail(e) {
    setEmail(e.target.value)
  }

  return (
    <>
      <div className={styles.button} onClick={() => { show("small") }}>Invite Room</div>
      
      <Modal size={Size} open={Open} onClose={close} centered={true}>
        <Modal.Header>방 초대</Modal.Header>
        <Modal.Content>
          멤버목록<br/>
          {Email}<hr/>
          <form onSubmit={invite}>
            {createList(MemberArray)}<br/>
            <input type="text" value={Email} onChange={handleEmail} placeholder="초대할 유저의 E-mail 주소"/>
          </form>
        </Modal.Content>
        <Modal.Actions>
          <Button negative onClick={close}>닫기</Button>
          <Button
            positive
            icon="checkmark"
            labelPosition="right"
            content="초대"
            onClick={invite}
          />
        </Modal.Actions>
      </Modal>
    </>
  );
};
export default React.memo(InviteRoom);

function list(memberList, roomMember) {
  let memberToShow = memberList.filter((member)=>{ // ns멤버 중 방멤버가 아닌자를 리턴해준다 (ns멤버 - 방멤버)
    let result = roomMember.find(ele=> (ele._id ===member._id) ) // true이면 중복이므로 걸러야 한다. 따라서 return !result가 맞다
    return !result
  })
  return memberToShow
}

function createList(MemberArray) {
  let result = MemberArray.map(
    (element, index)=>{
      let {name, email, image} = element //  _id도 있음
      return (
        <div key={index}>
          <p style={{ color: "black" }}><img src={image} alt={image} style={{width : '50px', height : '50px', padding : '5px'}}></img>&ensp;{`${name} (${email})`}</p>
        </div>
      )
    }
  )
  return result
}