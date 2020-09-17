const mongoose = require("mongoose");

const roomSchema = mongoose.Schema({
  roomTitle : { type: String },
  isPrivate :{ type: Boolean }, //비밀방 공개방 여부
  isDM : { type: Boolean },
  history: [// 채팅내용
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      type : {type: String, required: true}, // text / image / video
      text: { type: String, required: true }, // 메시지본문
      time: { type: Date, required: true }, // 전송시간 (정렬할 때 쓰일 수도 있을 것)
      filename : {type: String}
    },
  ],
  namespace: { 
    type: mongoose.Schema.Types.ObjectId, ref: 'Namespace'
  },
  member : [
    { 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User' 
    }
  ]
}, {timestamps: true});

const RoomModel = mongoose.model("Room", roomSchema); // (모델의 이름, 스키마)
module.exports = { RoomModel };
