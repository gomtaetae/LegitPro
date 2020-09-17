const { NsModel } = require('../../models/NsModel');
const { RoomModel } = require("../../models/RoomModel");
const { User } = require("../../models/User");
const { Event } = require("../../models/Event");
const { Schedule } = require("../../models/Schedule");

function nsSettings(io, NS_io, nsSocket) {
  nsSocket.on('clickRoom', (_id)=>{
    console.log("클릭한 방 id : "+_id);
    //여기서 db접근해서 data로 방 상세정보 찾아오고 추후 history도 합쳐준다?(이건생각해보기)
    RoomModel.findOne({_id})
    .populate('member', "email name image")
    .select("-history -createdAt -updatedAt -__v")
    .exec((err, room) => {
      nsSocket.emit('currentRoomLoad', room)
    });
  })

  nsSocket.on('clickSchedule', (_id)=>{
    console.log(`스케쥴러 id : ${_id}`);
    Schedule.findOne({_id})
    .populate('room')
    .populate({
      path : 'event',
      populate : { path: 'owner' , select: 'name email image' }
    })
    .exec()
    .then((doc)=>{
      nsSocket.emit('currentScheduleLoad', doc)
    })
    .catch((err)=>{
      console.log(err);
    })
  })

  nsSocket.on('joinSchedule', ({_id})=>{
    nsSocket.join(_id);
  })
  //일단 전부 재조회로 바꾸기 + create와 handle분리하기
  nsSocket.on('createEvent', (event, _id)=>{ // _id는 스케쥴러 겸 emit할 roomId
    let { title, end, start, desc, owner} = event;
    let newEvent = new Event({scheduler : _id, title, end, start, desc, owner})
    newEvent.save()
    .then((doc)=>{
      Schedule.findOneAndUpdate({_id}, {$push : {event : doc._id}}, {new : true})
      .exec()
      .then(()=>{
        return Event.find({scheduler : _id})
        .populate('owner', 'name image email')
        .exec()
      })
      .then((doc)=>{
        NS_io.to(_id).emit('updateSchedule', doc)
      })
      .catch((err)=>{
        console.log("에러 : "+err);
      })
    })
  })

  nsSocket.on('handleEvent', (event, _id)=>{ // _id는 스케쥴러 겸 emit할 roomId
    Event.findOneAndUpdate({_id : event._id}, event, { new : true })
    .populate('owner', 'name email image')
    .exec()
    .then((doc)=>{
      return Event.find({scheduler : _id})
      .populate('owner', 'name email image')
      .exec()
    })
    .then((doc)=>{
      NS_io.to(_id).emit('updateSchedule', doc)
    })
    .catch((err)=>{
      console.log(err);
    })
  })

  nsSocket.on('removeEvent', (event, _id)=>{
    Event.findOneAndDelete({scheduler : _id, _id : event._id})
    .exec()
    .then((doc)=>{
      return Event.find({scheduler : _id})
      .populate('owner', 'name email image')
      .exec()
    })
    .then((res)=>{
      NS_io.to(_id).emit('deleteSchedule', res)
    })
    .catch((err)=>{
      console.log("에러 : "+err);
    })
    
  })

  nsSocket.on('leaveSchedule', ({_id})=>{
    nsSocket.leave(_id);
  })

  nsSocket.on("NewRoom", (data)=>{
    createRoomInNs(NS_io, nsSocket, data)
  })

  nsSocket.on('joinRoom', (NS_id, roomToJoin) => {
    joinRoomInNs(nsSocket,  NS_id, roomToJoin)
  });

  nsSocket.on('leaveRoom', ({_id})=>{
    nsSocket.leave(_id);
  });
  //방을 떠나면
  nsSocket.on('quitRoom', (data) => {
    quitRoom(NS_io, nsSocket, data)
  })
  
  nsSocket.on("inviteToNs", (data)=>{
    inviteNS(io, NS_io, nsSocket, data);
  });
  
  //NS를 떠나면
  nsSocket.on('leaveNS', (data) => {
    leaveNS(NS_io, nsSocket, data)
  })

  nsSocket.on("NewDM", (data)=>{
    createDM(NS_io, nsSocket, data)
  })

  nsSocket.on('inviteToRoom', (data)=>{
    inviteRoom(NS_io, nsSocket, data);
  })

  nsSocket.on('newMessageToServer', (data) => {//방에서 메시지를 받아서 '그 방으로' 메시지 보내기
  if(data.type === "deleted") {
    deleteMessage(NS_io, nsSocket, data)
  }else if(data.type === "text/modified") {
    modifyMessage(NS_io, nsSocket, data)
  }else{
    sendMessageToClients(NS_io, nsSocket, data)
  }
  })
}

function modifyMessage(NS_io, nsSocket, data) {
  let {text, type, time, userId, filename, roomId } = data
  console.log(data);
  RoomModel.findOneAndUpdate(
    { _id : roomId, "history.time" : time },  
    { $set: { "history.$.type": type, "history.$.text": text } }, 
    { new: true }
  )
  .exec()
  .then((doc) => {
    delete data.roomId;
    console.log(data);
    NS_io.to(roomId).emit("messageToClients", data);
  })
  .catch((err)=>{
    nsSocket.emit('errorMsg', `오류가 발생했습니다 : ${err}`);
  })
}

function deleteMessage(NS_io, nsSocket, data) {
  let {text, type, time, userId, filename, roomId } = data
  console.log(data);
  RoomModel.findOneAndUpdate({ _id : roomId, "history.time" : time },  { $set: { "history.$.type": type } }, { new: true })
  .exec()
  .then((doc) => {
    delete data.roomId;
    console.log(data);
    NS_io.to(roomId).emit("messageToClients", data);
  })
  .catch((err)=>{
    nsSocket.emit('errorMsg', `오류가 발생했습니다 : ${err}`);
  })
}

function leaveNS(NS_io, nsSocket, data) {
  let {userId, _id, roomsIdArray} = data
  // id로 방들을 find한 뒤, 모두 업데이트를 해야 그 방들을 보내줄 수 있을거같다.
  RoomModel.updateMany({namespace : _id, member : userId}, {$pull : {member : userId}}) //정상적으로 방을 퇴장한다
  .exec()
  .then((doc)=>{
    console.log(`발견된 갯수 : ${doc.n}, 수정된 갯수 : ${doc.nModified}`);
    return RoomModel.find({_id : { $in : roomsIdArray }}).populate('member', "email name image")
    .select("-history -createdAt -updatedAt -__v").exec()
  })    
  .then((roomsArray)=>{
    roomsArray.forEach(room => {
      NS_io.to(room._id).emit('currentRoomLoad', room)
    });

    return NsModel.findOneAndUpdate({_id}, {$pull : {nsMember : userId}}, {new : true})
    .populate('nsMember', 'email name socket image')
    .select('nsTitle nsMember admin').exec()
  })
  .then((ns)=>{
    NS_io.emit('updatecurrentNs', ns) // ns전체에 멤버가 바뀐것을 보내준다 (되는 것 확인)
    //ns멤버바뀐건 그렇다치고, 저 멤버가 들어가있는 방은 어캐해?

    return NsModel.find({nsMember : userId}).select('nsTitle').exec() // 새로운 nsList검색
  })
  .then((nsList)=>{ // nsList를 제대로 못받아온다
    
    nsSocket.emit('currentNsClose', [...nsList]); //새로운 NS리스트
  })
  .catch((err)=>{
    console.log(err); 
  })
}

//내가 나가는게 먼저로 순서를 변경하고 테스트
function quitRoom(NS_io, nsSocket, data) {
  let {userId, _id, roomId} = data // _id는 ns의 _id
  nsSocket.leave(roomId); //여기
  RoomModel.findOneAndUpdate({_id : roomId}, {$pull : {member : userId}}, {new : true})
  .populate('member', "email name image")
  .select("-history -createdAt -updatedAt -__v")
  .exec()
  .then((room)=>{
    RoomModel.find({namespace : _id}) //네임스페이스 아이디 어떻게찾더라
    .populate('member', "email name image").select("-history -createdAt -updatedAt -__v")
    .exec()
    .then((rooms)=>{
      nsSocket.emit('currentRoomClose', rooms); // 나갔으니까 채팅방 닫아주고 목록에서 없애기
    })
    .catch((err)=>{
      nsSocket.emit('errorMsg', `에러가 발생했습니다 : ${err}`);
    })

    return room
  })
  .then((room)=>{
      NS_io.to(roomId).emit('currentRoomLoad', room); // 이거 잘못됐음 : 더이상 방멤버가 아닌데 왜 방을 받아오는가?
  })
  .catch((err)=>{
    nsSocket.emit('errorMsg', `에러가 발생했습니다 : ${err}`);
  })
}

// joinRoomInNs는 내부에서 updateUsersInRoom을 호출한다 (이건 그냥 참여이므로 수정할 것 없어보임)
function joinRoomInNs(nsSocket,  NS_id, roomToJoin) {
    nsSocket.join(roomToJoin);
    RoomModel.findOne({namespace : NS_id, _id : roomToJoin})
    .select('history -_id')
    .exec((err, doc)=>{ //history를 방채팅에 적용
      if(err) console.error(err);
      nsSocket.emit('historyCatchUp', doc.history);
    })
}

//방을 만들때 방유저목록에 생성한 유저를 추가
function createRoomInNs(NS_io, nsSocket, data) {
  //공개방일 경우 모든 멤버를 방에 추가. (따라서 nsMember를받아와야함? 모름)
  let {roomTitle, isPrivate, Ns_id} = data; // _id와 ids가 data안에있음 조건부로
  let member;
  data.isPrivate ? (member = [data._id]) : (member = data.ids) // 비밀방 ? 비밀방일때 : 공개방일때
  let room = new RoomModel({roomTitle, isPrivate, namespace : Ns_id, member});
  //방이름이 중복되지 않으면 save하기? 혹은 조건부저장방법찾아보기
  // find-save-find?? 극혐
  RoomModel.countDocuments({roomTitle, namespace : Ns_id}).exec()
  .then((count)=>{
    if(!count) return room.save()
    nsSocket.emit('errorMsg', `중복된 방 이름이 존재합니다`);
  })
  .then(()=>{
    return RoomModel.find({namespace : Ns_id}) // 모든방을 추가하면 안되고, 조건에 맞는방만 보내주어야 한다 (멤버에게는??)
      .populate('member', "email name image").select("-history -createdAt -updatedAt -__v").exec();
  })
  .then((rooms) => {
    (data.isPrivate) ? nsSocket.emit('nsRoomLoad', rooms) : NS_io.emit('nsRoomLoad', rooms) // 비밀방 ? 나한테만 / NS멤버 전부에게
  })
  .catch((err)=>{
    nsSocket.emit('errorMsg', `오류가 발생했습니다 : ${err}`);
  })
}

function inviteNS(io, NS_io, nsSocket, data) {
  let {email, _id} = data //nsId
  //(이건 진짜로 라우터로 먼저 유저 찾고나서 그다음 socket.emit 해도 될거같은데..)
  User.findOne({email}).select('email name socket').exec()
  .then((doc)=>{ //공개방 유저목록에 초대받은 유저 추가
    RoomModel.updateMany({ namespace: _id, isPrivate:false }, { $addToSet : { member : doc._id} }) 
    .exec()
    return doc
  })
  .then((doc)=>{//네임스페이스의 유저목록에 신규유저 추가하고 접속중인 ns유저들에게 새 목록을 보내준다
    NsModel.findOneAndUpdate({_id}, {$addToSet : {nsMember : doc._id}}, {new : true} )
    .populate('nsMember', 'email name socket image').select('nsTitle nsMember admin')
    .exec((err, ns)=>{
      NS_io.emit('updatecurrentNs', ns); //정상임 (얘는 네임스페이스목록만 업데이트 해줘야 하므로 루트io는 안됨)

      NsModel.find({nsMember : doc._id}).select('nsTitle').exec((err, nsArray)=>{
        if(doc.socket) io.to(doc.socket).emit("nsList", nsArray);
      });
    })
  })
  .catch((err)=>{
    nsSocket.emit('errorMsg', `오류가 발생했습니다 : ${err}`);
  })
}

//상대와 나에게만 추가하면된다 (상대에겐 아직 추가안함, 이것도 data해서 나중에 여기서 sort해서 내id와 상대id 구분해서 상대에게도 emit보내주어야함)
function createDM(NS_io, nsSocket, data) { // dm방 생성임
  let {invitedId, NS_id, nsTitle} = data; // 상대의 _id(초대받은사람)
  let {handshake : {query : {_id}}}= nsSocket // 만든 사람의 _id(본인)
  let member= [invitedId, _id].sort() // sort한 멤버목록
  //여기서도 nsSocket에 내 유저_id가 있으므로 상대member꺼만 가져와서 sort해주어서 배열을 만들어주면 된다
  let room = new RoomModel({roomTitle : (member[0]+member[1]) ,namespace: NS_id, member, isDM : true});
  room.save()
  .then(()=>{
    RoomModel.find({namespace : NS_id, member : _id}) //내아이디로 방검색해서 뿌려줌
    .populate('member', "email name image socket").select("-history -createdAt -updatedAt -__v")
    .exec((err, res)=>{
      nsSocket.emit('nsRoomLoad', res);
    });
    
    return RoomModel.find({namespace : NS_id, member : invitedId}) //상대아이디로 방검색해서 프로미스전달
    .populate('member', "email name image socket").select("-history -createdAt -updatedAt -__v")
    .exec();
  })
  .then((doc)=>{ // 상대아이디 방검색 결과를 뿌려줌
    User.findOne({_id : invitedId})
    .exec((err, user)=>{
      console.log(`네임스페이스의 엔드포인트 : /${nsTitle}#${user.socket}`);
      NS_io.to(`/${nsTitle}#${user.socket}`).emit('nsRoomLoad', doc) // 된다
    })
  })
  .catch((err)=>{
    console.log(" DM생성에러 : "+ err);
  })
}

function inviteRoom(NS_io, nsSocket, data) {
  let {nsTitle, NS_id, _id, roomId} = data // 유저id
  RoomModel.findOneAndUpdate({_id : roomId}, { $addToSet : {member : _id}}, { new : true})
  .populate('member', "email name image")
  .select('-history -__v -createdAt -updatedAt').exec()
  .then((data)=>{
    NS_io.to(roomId).emit('currentRoomLoad', data) // 나말고도 비밀방에 사람이 있을 수 있으므로, nsio toroom current가되어야한다
  })
  .then(()=>{
    return User.findOne({_id}).select('socket').exec()
  })
  .then((doc)=>{
    if(doc.socket){    
      RoomModel.find({namespace : NS_id, member : _id}) // 엔드포인트가없잖아
      .populate('member', "email name image")
      .select("-history -createdAt -updatedAt -__v")
      .exec((err, rooms) => {

        NS_io.to(`/${nsTitle}#${doc.socket}`).emit('nsRoomLoad', rooms) // 된다
      });
    }
  })
  .catch((err)=>{
    nsSocket.emit('errorMsg', `오류가 발생했습니다 : ${err}`);
  })
}

function sendMessageToClients(NS_io, nsSocket, data) {    
  let {NS_id, roomId, text, type, userId, filename } = data
  const fullMsg = { //메시지 객체
    text, type, userId, filename,
    time: Date.now(),
  };
  RoomModel.findOneAndUpdate({ namespace : NS_id, _id: roomId },  { $push: { history: fullMsg } }, { new: true })
  .exec()
  .then((doc) => {
    if(doc!==null){
      console.log(doc.history[doc.history.length-1]);
      NS_io.to(roomId).emit("messageToClients", fullMsg); //방이름을 to에 넣어서 전송. 이때 io인 thisNs로 전송
    }else{
      nsSocket.emit('errorMsg', `메시지 전송에 실패했습니다 : ${userId} : ${text}`);
    }
  })
  .catch((err)=>{
    nsSocket.emit('errorMsg', `오류가 발생했습니다 : ${err}`);
  })
}

module.exports = nsSettings