import {combineReducers} from "redux";
import user from "./user_reducer"
import chatInfo from "./chat_reducer"

const rootReducer = combineReducers({
  user,
  chatInfo, 
})

export default rootReducer;