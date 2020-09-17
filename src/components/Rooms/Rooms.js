import React, { useEffect, useState } from 'react';
import io from 'socket.io-client'
import { message } from "antd";
import { Icon } from 'semantic-ui-react'
import {CreateRoom, CreateDM, ModalMenu } from "../modals";
import {useDispatch, useSelector} from 'react-redux';
import {inputSocket, inputNsList, inputRoomList, inputCurrentNs, inputCurrentRoom, inputScheduleList, inputCurrentSchedule} from '../../_actions/chat_action'
import styles from './Rooms.module.css';
let nsSocket = ''

const Rooms = ({hideList, Socket}) => {
  let {_id, name} = useSelector(state=>state.user.userData)
  let {currentNs, roomList, scheduleList} = useSelector(state=>state.chatInfo)
  let { nsTitle, admin } = currentNs // nsId
  // console.log(currentNs["nsTitle"]);
  const [isAdmin, setIsAdmin] = useState(false)
  const dispatch =useDispatch();
  
  useEffect(()=>{ // 네임스페이스를 클릭할 때 마다 실행되어야 한다
    setIsAdmin((_id===admin) ? true : false)
    
    if (nsSocket)  nsSocket.close(); 
    if (`/${nsTitle}`!==nsSocket.nsp) {
      nsSocket = io(`http://${process.env.REACT_APP_IP_ADDRESS}:9000/${nsTitle}`, { query :  {_id} });
      dispatch(inputSocket(nsSocket));
    }

    nsSocket.on("nsRoomLoad", (rooms) => { // 클릭시나, 초대, 누군가 퇴장하고 나서 (전체룸로드)
      console.log("nsRoomLoad 실행");
      let myRooms = rooms.filter((room)=>{
        return room.member.find(mem=> (mem._id ===_id))
      })
      dispatch(inputRoomList(myRooms));
    });
    
    nsSocket.on('updatecurrentNs', (ns)=>{ // 누군가 NS에 초대되면 모두에게 멤버 업데이트
      console.log(ns); // null뜸
      dispatch(inputCurrentNs(ns));
    })

    nsSocket.on('currentRoomLoad', (room)=>{ // 남을 초대하면 나는 비밀방을 보고있으므로 나에게 현재방갱신해줌
      console.log('currentRoomLoad 실행됨');
      dispatch(inputCurrentRoom(room)) // 방클릭시 리턴도 여기로 해준다
    })

    nsSocket.on('currentScheduleLoad', (schedules)=>{
      console.log('currentScheduleLoad 실행됨');
      dispatch(inputCurrentSchedule(schedules)) 
    })

    nsSocket.on('currentRoomClose', (rooms)=>{ // 남을 초대하면 나는 비밀방을 보고있으므로 나에게 현재방갱신해줌
      console.log('currentRoomClose 실행됨');
      let myRooms = rooms.filter((room)=>{
        return room.member.find(mem=> (mem._id ===_id))
      })
      dispatch(inputRoomList(myRooms));
      dispatch(inputCurrentRoom("")) // 방클릭시 리턴도 여기로 해준다
    })

    nsSocket.on('currentNsClose', (nsArray)=>{ 
      console.log('currentNsClose 실행됨');
      dispatch(inputCurrentRoom(""));
      dispatch(inputCurrentSchedule(""));
      dispatch(inputRoomList(""));
      dispatch(inputScheduleList(""));
      dispatch(inputCurrentNs(""));
      dispatch(inputNsList(nsArray));
    })

    nsSocket.on('errorMsg', (msg)=>{
      message.error(msg);
    })
    return ()=>{ console.log(`[${nsTitle}] NS에서 나갔습니다`); }// 왜 나가지도 않았는데 실행되는가?? 함수안에서 사용하지 않았기 때문이다
  }, [nsTitle, _id, admin, dispatch])

  function getroomList() {
    let tmproom = roomList.filter((room)=> (room.isDM === undefined) )
    const newList= tmproom.map((room, index) => {
      let isPrivateLogo = (room.isPrivate ? "lock" : "globe")
      return (
        <li key={index} onClick={()=>{handleList(room)}}>
          <Icon name={isPrivateLogo}></Icon> {room.roomTitle}
        </li> 
      )
    });
    return newList
  }

  function getdmList() {
    let tmproom = roomList.filter((room)=> room.isDM === true ) // 내가 참여한 모든 DM방 목록
    const newList= tmproom.map((room, index) => { // 내가 포함된 dm방 전체데이터를 map한다
      let tmp = room.member.find(ele=>ele._id !==_id)
      let dataOfOpponent = currentNs.nsMember.find((ele)=>ele._id ===tmp._id)
      return (
      <li key={index} onClick={()=>{handleList(room)}}>
        {/* Icon대신 dataOfOpponent.socket.length가 0이면 비접속, 아니면 접속으로 */}
        {/* <Icon name='user'></Icon> */}
        {dataOfOpponent.socket.length===0 ? <i className={`far fa-circle ${styles.disconnect}`}></i>:<i className={`fas fa-circle ${styles.connect}`}></i>}
        &ensp;{dataOfOpponent ? dataOfOpponent.name : "나간상대"} 
      </li>)
    });
      return newList
  }

  function getScheduleList() {
    let newList = scheduleList.map((scheduler, index)=>{
      if(!scheduler.room) return (<li key={index} onClick={()=>{handleSchedule(scheduler)}}> <Icon name='calendar'></Icon> {nsTitle} </li>)
      else return (<li key={index} onClick={()=>{handleSchedule(scheduler)}}> <Icon name='calendar'></Icon> {scheduler.room.roomTitle} </li>)
    })
    return newList
  }

  function handleSchedule(scheduler) {
    console.log(scheduler);
    nsSocket.emit('clickSchedule', scheduler._id);
  }

  function handleList(room) {
    // console.log(room); // _id , member, roomTitle, namespace(_id)
    nsSocket.emit('clickRoom', room._id);
    // dispatch(inputCurrentRoom(room))
  }
  return (
    <>
      <section id={styles.header}>
        <ModalMenu isAdmin={isAdmin} nsTitle={nsTitle} username={name} Socket={Socket}></ModalMenu>
        {/* { roomList && <ModalMenu isAdmin={isAdmin} nsTitle={nsTitle} username={name}></ModalMenu> } */}
        <ArrowIcon hideList={hideList}></ArrowIcon>
      </section>
      <section id={styles.body}>
        <Schedule isAdmin={isAdmin} getScheduleList={getScheduleList}></Schedule>
        <Channel getroomList={getroomList}></Channel>
        <DM getdmList={getdmList}></DM>
      </section>
    </>
  );
};
export default Rooms;

const Schedule = ({isAdmin, getScheduleList}) => {
  return (
    <section id={styles.body_schedule}>
    <div className={styles.body_listname}>
      <strong>Schedule {isAdmin}</strong><i className='fas fa-plus'/>
    </div>
    <ul>
      {getScheduleList()}
    </ul>
  </section>
  );
};

const Channel = ({getroomList}) => {
  return (
    <section id={styles.body_channel}>
    <div className={styles.body_listname}>
      <strong>Channels</strong><CreateRoom><i className='fas fa-plus'/></CreateRoom>
    </div>
    <ul>
      {getroomList()}{/* 방데이터가 있을 때 Rooms컴포넌트를 로드하므로 괜찮음 */}
    </ul>
  </section>
  );
};

const DM = ({getdmList}) => {
  return (
    <section id={styles.body_directmessage}>
    <div className={styles.body_listname}>
      <strong>Direct Messages</strong><CreateDM><i className='fas fa-plus'/></CreateDM>
    </div>
    <ul>
      {getdmList()}{/* 마찬가지로 방데이터가 있을 때 Rooms컴포넌트를 로드하므로 괜찮음 */}
      {/*  currentNs가 있을때만 열리게하고싶은데 조건걸면 ns초대할때 터짐 */}
    </ul>
  </section>
  );
};

const ArrowIcon = ({hideList}) => {
  return (
    <svg onClick={hideList} width="2em" height="2em" viewBox="0 0 16 16" className={`bi bi-arrow-bar-left ${styles.sidebar_iconleft}`} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" d="M5.854 4.646a.5.5 0 0 0-.708 0l-3 3a.5.5 0 0 0 0 .708l3 3a.5.5 0 0 0 .708-.708L3.207 8l2.647-2.646a.5.5 0 0 0 0-.708z" />
      <path fillRule="evenodd" d="M10 8a.5.5 0 0 0-.5-.5H3a.5.5 0 0 0 0 1h6.5A.5.5 0 0 0 10 8zm2.5 6a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 1 0v11a.5.5 0 0 1-.5.5z" />
    </svg>
  );
};


