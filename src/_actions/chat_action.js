import {SOCKET,  CURRENT_ROOM, ROOM_LIST, NS_LIST, CURRENT_NS, SCHEDULE_LIST, CURRENT_SCHEDULE} from './types'
//소켓
export function inputSocket(nsSocket) {
  return {
    type : SOCKET,
    payload : nsSocket
  }
}
//NS관련
export function inputNsList(nsList) {
  return {
    type : NS_LIST,
    payload : nsList
  }
}
export function inputCurrentNs(currentNs) {
  return {
    type : CURRENT_NS,
    payload : currentNs
  }
}
//방관련
export function inputRoomList(roomList) {
  return {
    type : ROOM_LIST,
    payload : roomList
  }
}
export function inputCurrentRoom(currentRoom) {
  return {
    type : CURRENT_ROOM,
    payload : currentRoom
  }
}
//캘린더 관련
export function inputScheduleList(scheduleList) {
  return {
    type : SCHEDULE_LIST,
    payload : scheduleList
  }
}
export function inputCurrentSchedule(currentSchedule) {
  return {
    type : CURRENT_SCHEDULE,
    payload : currentSchedule
  }
}
