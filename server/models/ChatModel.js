const mongoose = require("mongoose");

const chatSchema = mongoose.Schema({
  roomId: { 
    type: mongoose.Schema.Types.ObjectId, ref: 'Room' 
  },
  index: { // 메시지본문 (데이터 경로가 될 수도 있음, 무한스크롤로 활용할 수 있을 것 같기도 함)
    type: Number, 
    required: true 
  }, 
  text: { // 메시지본문 (데이터 경로가 될 수도 있음)
    type: String, 
    required: true 
  }, 
  type : { // text / image / video
    type: String, 
    required: true
  },
  userName: { // 전송자 이름
    type: String, 
    required: true 
  }, 
  avatar: { // 유저이미지
    type: String, 
    required: true 
  }, 
  filename : {type: String}
}, {timestamps: true});// 전송시간으로 정렬??

const ChatModel = mongoose.model("Chat", chatSchema); // (모델의 이름, 스키마)
module.exports = { ChatModel };
