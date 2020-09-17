import React, { useState } from 'react';
import { Button, Modal, Input } from 'semantic-ui-react'
import { message } from "antd";
import {useSelector} from 'react-redux';

const CreateDM = ({children}) => {
  let {_id} = useSelector(state=>state.user.userData) // 본인의 아이디
  let {nsSocket, currentNs, roomList} = useSelector(state=>state.chatInfo)
  let memberList = currentNs.nsMember // 이 네임스페이스의 멤버리스트
  let MemberArray = list(memberList, _id) // 나를 뺀 멤버배열

  const [Open, setOpen] = useState(false);
  const [Size, setSize] = useState();
  const [Email, setEmail] = useState("");

  function show(size) {
    setSize(()=>size);
    setOpen(true);
  }
  function close() { setOpen(false) }

  function handleEmail(e) { setEmail(e.target.value) }

  function createDM(e){
    e.preventDefault();
    let invitedMembers = MemberArray.find(member=> (member.email ===Email) )
    if (invitedMembers !== undefined) {
      let invitedId = invitedMembers._id
      let member = [_id, invitedId].sort(); //둘을 이어붙인게 방이름이 될 것 (다른ns에서 중복여부는 특정 ns인 경우만 찾아올거라 괜찮음)
      let sameroom = roomList.find((room)=>{
        return room.roomTitle === (member[0]+member[1])
      })
      sameroom===undefined // DM방이 존재여부 (없을때)
        ? nsSocket.emit("NewDM", {invitedId, NS_id : currentNs._id, nsTitle : currentNs.nsTitle}) // DM방이 존재하지 않으면
        : message.error("이미 방이 존재합니다") // DM방이 존재하면      
    }else{ // 이메일이 일치하는 멤버가 없으면
      message.error("이메일을 바르게 입력했는지 확인하세요");
    }
    setOpen(false);
  }
  return (
    <>
      <span onClick={() => { show('small') }} style={{cursor : 'pointer'}}>{children}</span>
      {/* <Button onClick={() => { show('small') }}>Create DM</Button> */}
      <Modal size={Size} open={Open} onClose={close} centered={true}>
        <Modal.Header>DM 생성</Modal.Header>
        <Modal.Content>
          멤버목록<br/>
          {Email}<hr/>
          <form onSubmit={createDM}>
          {createList(MemberArray)}<br/>
            <Input focus value={Email} onChange={handleEmail} placeholder="초대할 유저의 E-mail" />
          </form>
        </Modal.Content>
        <Modal.Actions>
          <Button negative onClick={close}>닫기</Button>
          <Button
            positive
            icon='checkmark'
            labelPosition='right'
            content='생성'
            onClick={createDM}
          />
        </Modal.Actions>
      </Modal>
    </>
  );
};
export default React.memo(CreateDM);

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

function list(memberList, _id) {
  let memberExceptMe = memberList.filter(member=>  (_id !== member._id) )
  return memberExceptMe
}