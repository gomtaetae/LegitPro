import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import { Popup } from 'semantic-ui-react'
import 'moment/locale/ko'
import moment from 'moment'
import {SidebarSchedule, NewSchedule} from '../sidebars'
import styles from './Schedule.module.css'
import "./react-big-calendar.css"
import {useSelector, useDispatch} from 'react-redux';
import {inputCurrentSchedule} from '../../_actions/chat_action'
const localizer = momentLocalizer(moment)
moment.locale('ko')

function Schedule() {
  let { userData } = useSelector(state => state.user)
  let { currentNs, currentSchedule, nsSocket } = useSelector(state => state.chatInfo)
  let {_id, event} = currentSchedule
  const dispatch =useDispatch();
  const [Events, setEvents] = useState([]);
  const [currentEvent, setCurrentEvent] = useState();
  const [IsNewEvent, setIsNewEvent] = useState(false);
  const [Start, setStart] = useState();
  const [End, setEnd] = useState();
  const [dayLayoutAlgorithm] = useState("no-overlap");

  useEffect(() => {
    nsSocket.emit('joinSchedule', {_id});
    let events= event.map(ele=>{
      let { _id, start, end, desc, title, owner } = ele;
      return { _id, title, desc, owner, start: new Date(start), end: new Date(end) };
    })
    setEvents(events);
    return(()=>{
      nsSocket.emit('leaveSchedule',{_id});
    })
  }, [_id, event, nsSocket]);

  useEffect(()=>{
    nsSocket.on('updateSchedule', (events)=>{ // 추가 변경
      let newEvents = events.map(ele=>{
        let { _id, start, end, desc, title, owner } = ele;
        return { _id, title, desc, owner, start: new Date(start), end: new Date(end) };
      })
      setEvents(newEvents)
    })

    nsSocket.on('deleteSchedule', (events)=>{ // 삭제
      let newEvents = events.map(ele=>{
        let { _id, start, end, desc, title, owner } = ele;
        return { _id, title, desc, owner, start: new Date(start), end: new Date(end) };
      })
      setEvents(newEvents)
    }) 
  }, [nsSocket])

  function newEvent({start, end}) {
    setStart(start)
    setEnd(end)
    setCurrentEvent("")
    setIsNewEvent(true)
  }

  function removeEvent(e, event) {
    e.stopPropagation();
    const result = window.confirm("일정을 취소합니다.");
    result && nsSocket.emit('removeEvent', event, _id);
  }

  function Event({ event }) {
    return (
        <div className={styles.event} title="">
          <Popup
            content={<><br/>{event.owner.email}<hr/>{event.desc}</>}
            key={event.owner._id}
            header={<><img className={styles.image} src={event.owner.image} alt="아바타" />&ensp;<strong>By {event.owner.name}</strong></>}
            trigger={<span>{event.title} </span>}
          />
          {userData._id===event.owner._id && <i className={`fas fa-times ${styles.removebutton}`} onClick={(e)=>{removeEvent(e, event)}} title=""></i>}
        </div>
    );
  }

  function Close() {
    dispatch(inputCurrentSchedule(""))
  }
  function modifyEvent(event) {
    setIsNewEvent(false)
    setCurrentEvent(event)
  }

  return (
    <>
      <section id={styles.header}>
        <div id={styles.title}>
          {(currentSchedule.room===undefined) ? currentNs.nsTitle : currentSchedule.room.roomTitle }
        </div>
        <svg width="2em" height="2em" className={`bi bi-x ${styles.closeicon}`} onClick={Close} viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M11.854 4.146a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708-.708l7-7a.5.5 0 0 1 .708 0z"/>
          <path fillRule="evenodd" d="M4.146 4.146a.5.5 0 0 0 0 .708l7 7a.5.5 0 0 0 .708-.708l-7-7a.5.5 0 0 0-.708 0z"/>
        </svg>
      </section>
      <section id={styles.body}>
        <div id={styles.calendar}>
        <Calendar
          style={{ height: "95%", width: "99%"}}
          popup={true} //+ _x_ more"링크를 클릭하면 잘린 이벤트를 오버레이에 표시합니다.
          selectable={true} //필수 ** 날짜와 범위를 선택할수 있게 만들어줌
          onSelectEvent={(e)=>{modifyEvent(e)}}
          localizer={localizer} //moment 모듈을 이용한 로컬화
          events={Events} //이벤트 나오게 하는거
          allDayAccessor="allday"
          startAccessor="start"
          endAccessor="end"
          defaultView={Views.MONTH} //디폴트 뷰
          scrollToTime={new Date()} //**스크롤 시작 위치를 정해줌(안해줘도 될듯)
          defaultDate={moment().toDate()} //디폴트 날짜
          onSelectSlot={newEvent} //**날짜 선택시 콜백이 발생한다 -> 위에서 만들어준 handleSelect가 실행
          dayLayoutAlgorithm={dayLayoutAlgorithm} //레이아웃 배열의 알고리즘
          // onDragStart={console.log} // 드래그 시작할 떄 => 클릭시
          components={{
            event: Event, //여기서 호버줘야함
            agenda: {
              event: EventAgenda,
            },
          }}
        />
        </div>
        {currentEvent && 
          <SidebarSchedule
            userId={userData._id}
            ScheduleId={_id} 
            nsSocket={nsSocket} 
            currentEvent={currentEvent} 
            setCurrentEvent={setCurrentEvent}
          />
        }
        {IsNewEvent && 
          <NewSchedule
            userId={userData._id}
            ScheduleId={_id}
            Start={Start}
            End={End}
            nsSocket={nsSocket}
            setIsNewEvent={setIsNewEvent}
          />
        }
      </section>
    </>
  );
}

export default Schedule;

//Agenda에서 이벤트 주는거
function EventAgenda({ event }) {
  return (
    <>
      <span style={{ color: "black", fontWeight:600, fontSize:'20px' }}>{event.title}</span><hr/>
      <div style={{ padding : '5px'}}>{event.desc}</div>
    </>
  );
}
