import React, { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import styles from'./CreateDM.module.css';
import { Button } from 'semantic-ui-react'
import { message } from "antd";

const CreateDM = () => {
  let {_id} = useSelector(state=>state.user.userData) // 본인의 아이디
  let {nsSocket, currentNs, roomList} = useSelector(state=>state.chatInfo)
  let memberList = currentNs.nsMember // 이 네임스페이스의 멤버리스트
  let MemberArray = list(memberList, _id) // 나를 뺀 멤버배열
  const [Email, setEmail] = useState("");
  let modal = useRef();
  function Open() { modal.current.classList.remove(styles.hidden) }
  function Close() { modal.current.classList.add(styles.hidden) }

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
    Close();
  }

  return (
    <>
      <div onClick={Open}>오픈</div>
      <section ref={modal} className={`${styles.modal} ${styles.hidden}`} >
        <section  className={styles.overlay} onClick={Close}></section>
        <section className={styles.content}>
          <header className={styles.content__header}>DM 생성</header>
          <CloseIcon Close={Close}></CloseIcon>
          <article className={styles.content__body}>
            <h4>유저목록</h4>
              {createList(MemberArray)}<br/>
          </article>
          <footer className={styles.content__footer}> 
          <form onSubmit={createDM}>
              <input className={styles.content__input} type="text" value={Email} onChange={handleEmail} placeholder="초대할 유저의 E-mail 주소"/>
              &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;
              &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;
              <Button
              positive
              icon='checkmark'
              labelPosition='right'
              content='생성'
              onClick={createDM}
            />
          </form>         
          </footer>
        </section>
      </section>
    </>
  );
};

export default React.memo(CreateDM);


const CloseIcon = ({Close}) => {
  return (
    <svg width="2em" height="2em" viewBox="0 0 16 16" className={`bi bi-x ${styles.closeicon}`} onClick={Close} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" d="M11.854 4.146a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708-.708l7-7a.5.5 0 0 1 .708 0z"/>
      <path fillRule="evenodd" d="M4.146 4.146a.5.5 0 0 0 0 .708l7 7a.5.5 0 0 0 .708-.708l-7-7a.5.5 0 0 0-.708 0z"/>
    </svg>
  );
};

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