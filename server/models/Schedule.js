const mongoose = require('mongoose');

// //start랑 end number일수도 있음
const scheduleSchema = mongoose.Schema({
  namespace : {
    type: mongoose.Schema.Types.ObjectId
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref : 'Room' 
  },
  event: [{ 
    type: mongoose.Schema.Types.ObjectId, ref: 'Event' 
  }],
});
            //아틀라스나 db 들거가는 모델이름 아틀라스 들어가면 
            //복수형이라서 calendars라는 스키마가 새로 생김
const Schedule = mongoose.model('Schedule', scheduleSchema)

module.exports = { Schedule }

