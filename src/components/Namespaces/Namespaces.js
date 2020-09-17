import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client'
import { message } from "antd";
import Rooms from '../Rooms/Rooms'
import Chat from '../Chat/Chat'
import EmptyChat from '../EmptyChat/EmptyChat'
import {SidebarRoom} from '../sidebars'
import Schedule from '../Schedule/Schedule'

import './Namespaces.css';
import {useSelector, useDispatch} from 'react-redux';
import {inputNsList, inputCurrentNs, inputRoomList, inputCurrentRoom, inputScheduleList, inputCurrentSchedule} from '../../_actions/chat_action'
let Socket=""
const Namespaces = (props) => {
  let {nsList, roomList, currentRoom, currentSchedule} = useSelector(state=>state.chatInfo); // state.루트리듀서에 지정한 이름
  let {_id} = useSelector(state=>state.user.userData); //유저아이디
  const dispatch =useDispatch();
  const [Title, setTitle] = useState(); //네임스페이스 이름
  let RightArrow = useRef();
  let List = useRef();
  let Aside = useRef();

  function showList() {
    List.current.style.display = 'block'
    RightArrow.current.style.display = "none"
  }
  function hideList() {
    List.current.style.display = 'none'
    RightArrow.current.style.display = "block"
  }
  useEffect(()=>{
    Socket = io(`http://${process.env.REACT_APP_IP_ADDRESS}:9000`, { query :  {_id} } );
  }, [_id])
  useEffect(()=>{
    return ()=>{
      Socket.emit('a', {})
      // let nsTitleList = nsList.map((ns)=>{
      //   return ns.nsTitle
      // })
    }
  }, [])

  useEffect(()=>{
    Socket.on("nsList", (nsArray)=>{ //접속시 리스트 로드
      dispatch(inputNsList(nsArray));  // 변하는 정보가 없어지면 리덕스에서 삭제
      (nsArray.length !==0) && Socket.emit('clickNs', {nsTitle : nsArray[0].nsTitle, NS_id : nsArray[0]._id});
    })//완성⭐

    Socket.on('currentNs', ({doc, rooms, schedules})=>{ // 아래의 handleNsList에서 보낸 clicktNs이벤트를 보내면 서버에서 clickedNs 이벤트를 보낸다
      dispatch(inputCurrentNs(doc)); // 전체방로드는 클릭시 Rooms.js에서 해주므로 신경쓰지 않는다
      dispatch(inputScheduleList(schedules));
      dispatch(inputRoomList(rooms)); // dispatch(inputCurrentRoom("")); // 여기서currentRoom을 비우면 no-op과 history문제때문에 서버가 터진다
    })

    Socket.on('errorMsg', (msg)=>{ message.error(msg); }) // 에러출력

  }, [dispatch]);                
  
  function getnsList(){
    let list = nsList.map((element,index)=>{
      let {nsTitle} = element;
      return (
        <li key={index}>
          <div className="namespace_icon" title={nsTitle} onClick={()=>{handleNsList(element)}}>{nsTitle.toUpperCase()[0]}</div>
        </li>
      )
    })
    return list
  }

  function handleNsList(element){ // 2. 만약에 클릭시 정보를 받아온다고 했을때, 여기서 각 ns에 대한 emit이나 post요청을 해야한다
    let {nsTitle} = element;
    if(Title !== nsTitle) {
      // dispatch(inputCurrentNs("")); // 여기서 currentNs와 currentRoom을 비우면 클릭시 바로 방과 방목록항목이 사라진다
      dispatch(inputCurrentRoom(""));
      dispatch(inputCurrentSchedule(""));
      setTitle(nsTitle);
      Socket.emit('clickNs', {nsTitle, NS_id : element._id}); // 현재NS 갱신을 위한 요청
      console.log(`[${nsTitle}] NS에 입장했습니다`);
    }
    // console.log(`[${Title}] / [${title}]`);
  }
  // function handleAside() {
  //   setIsSidebarLoad((bool)=>!bool)
  // }  
  function handleAside() {
    Aside.current.style.display==='grid'
      ? Aside.current.style.display = 'none' 
      : Aside.current.style.display = 'grid'
  }

  function Close() {
    Aside.current.style.display = 'none' 
  }

  return (
    <div id='bpp'>
      <header>
        <nav></nav> {/* 네비게이션은 헤더안에? */}
      </header>
      <div id="container">
        <section id='namespace'>
          <ul>
            <ArrowIcon RightArrow={RightArrow} showList={showList}></ArrowIcon>
            {nsList && getnsList() /* 네임스페이스 데이터가 있어야 nsList를 가져온다 (당연함) */}
          </ul>
        </section>
        
        { roomList && <section ref={List} id='list'><Rooms hideList={hideList} Socket={Socket}></Rooms></section> } {/* 엔드포인트 설정되면 방 컴포넌트 로드 */}
        
        {currentSchedule &&<section id='schedule'><Schedule></Schedule></section>}
        
        { currentRoom && <section id='chat'><Chat handleAside={handleAside} ></Chat></section>} {/* 방이름이 설정되면 채팅 컴포넌트 로드 */}
        {nsList.length ===0 && <EmptyChat Socket={Socket}></EmptyChat>}
        <aside ref={Aside}>
          {currentRoom && <SidebarRoom Close={Close} Members={currentRoom.member}></SidebarRoom>}
        </aside>
      </div>
    </div>
  );
};
export default Namespaces;


const ArrowIcon = ({RightArrow, showList}) => {
  return (
    <svg ref={RightArrow} onClick={showList} width="2em" height="2em" viewBox="0 0 16 16" className="bi bi-arrow-bar-right sidebar_iconright" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M10.146 4.646a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L12.793 8l-2.647-2.646a.5.5 0 0 1 0-.708z"/>
    <path fillRule="evenodd" d="M6 8a.5.5 0 0 1 .5-.5H13a.5.5 0 0 1 0 1H6.5A.5.5 0 0 1 6 8zm-2.5 6a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 1 0v11a.5.5 0 0 1-.5.5z"/>
  </svg>
  );
};
