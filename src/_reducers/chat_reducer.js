import {SOCKET, NS_LIST, CURRENT_NS, ROOM_LIST, CURRENT_ROOM, SCHEDULE_LIST, CURRENT_SCHEDULE } from '../_actions/types'

let initialState= {
  nsList : []
}


export default function (state=initialState, action) {
  switch (action.type) {
    case SOCKET:
      return {...state, nsSocket : action.payload }

    case NS_LIST:
      return {...state, nsList : action.payload}
    case CURRENT_NS:
      return {...state, currentNs : action.payload}

    case ROOM_LIST:
      return {...state, roomList : action.payload}      
    case CURRENT_ROOM:
      return {...state, currentRoom : action.payload}

    case SCHEDULE_LIST:
      return {...state, scheduleList : action.payload}      
    case CURRENT_SCHEDULE:
      return {...state, currentSchedule : action.payload}

    default: 
      return state;
  }
}

// const initialState = {
//   nsSocket : "",
//   RoomName : "",
//   nsData: "",
//   nsMember : "",
//   nsIndex : ""
// }