const express = require('express');
// const redis = require('redis');
const nsSettings = require('./Sockets/Sockets')
const { NsModel } = require('../models/NsModel');
const { RoomModel } = require("../models/RoomModel");
const { User } = require("../models/User");
const { Schedule } = require("../models/Schedule");

module.exports = function (io) {
  const router = express.Router();
  let nsTitleList;
  //Ns, Room 세팅        
  io.on("connection", (socket) => {
    let {handshake : {query : {_id}}} = socket // 유저 DB의 _id : 여기서 받은 _id로 db를 검색해 소켓id를 저장
    User.findOneAndUpdate({_id}, {socket : socket.id}, {new : true}).exec() // 접속시 유저의 socket id를 db에 저장
      .then((doc)=>{
        return NsModel.find({nsMember : _id})  //접속시 nsList전송
          .populate('nsMember', 'email name socket image').select('nsTitle nsMember admin').exec()
      })
      .then((nsArray) => {
        socket.emit("nsList", nsArray);
        nsArray.forEach((ns)=>{
          io.of(`/${ns.nsTitle}`).emit('updatecurrentNs', ns)
        })
        //본인이 속한 NS의 모두에게 currentNS업데이트를 해주어야한다
      })
      .catch((err)=>{
        console.log(err);
      })

    socket.on('disconnect', ()=>{//접속해제시 socket을 파기
      User.findOneAndUpdate({_id}, {socket : ""}, {new : true}).exec() // 접속 종료시 socket id를 db에서 
        .then((doc)=>{
          return NsModel.find({nsMember : _id})
            .populate('nsMember', 'email name socket image').select('nsTitle nsMember admin').exec()
        })
        .then((doc)=>{
          doc.forEach((ns)=>{
            io.of(`/${ns.nsTitle}`).emit('updatecurrentNs', ns)
          })
        })
    })

    socket.on('clickNs', (data)=>{
      //클릭한 ns목록과 그에 맞는 방을 전송
      let {nsTitle, NS_id}= data
      NsModel.findOne({nsTitle}).populate('nsMember', 'email name socket image').select('nsTitle nsMember admin')
      .exec()
      .then((doc)=>{
        //본인한테 맞는 방을 가져왔다
        RoomModel.find({namespace : NS_id, member : _id})
        .populate('member', "name")
        .select("-history -createdAt -updatedAt -__v")
        .exec()
        .then((rooms) => {
          //여기서 스케쥴러를 불러와야한다
          Schedule.find({namespace : NS_id})
          .populate('room', "roomTitle")
          .select('-namespace -__v -event')
          .exec((err, schedules)=>{
            socket.emit('currentNs', {doc, rooms, schedules})
          })
        })
        .catch((err)=>{ console.log(err) })
      })
      .catch((err)=>{ console.log(err) })
    })
    

    socket.on("NewNs", (data) => { //새 ns요청이 왔을 시 생성 후 새 리스트 전송, 각종 ns.on 켜주기
      let {nsTitle}= data
      let result= nsTitleList.find( element=>(element ===nsTitle) );
      let newNs = new NsModel({ admin : _id, nsMember : [_id], nsTitle});
      
      newNs.save()
      .then((ns) => { // 새 NS를 DB에 추가
        console.log(ns);
        
        NsModel.find({nsMember : _id}).select('nsTitle admin')
        .exec((err, nsArray) => {
          if(err) console.log(err);
          socket.emit("nsList", nsArray);
        });
        let schedule = new Schedule({namespace: ns._id})
        schedule.save()
        .then((scdl)=>{
          console.log(scdl);
        })
        .catch((err)=>{
          console.log(err);
        })


        if(!result) { //만약 서버에서 생성한 ns의 on이 켜져있다면 if문은 실행되지 않는다
          let NS_io = io.of(`/${nsTitle}`) //새 네임스페이스와 방에 on 추가
          NS_io.on('connection', (nsSocket) => { //여기에서 DB요청을 하고 추가해야 실시간 데이터를 받아올 수 있다
            nsSettings(io, NS_io, nsSocket);
          });
        }
      })
      .catch((err)=>{
        socket.emit('errorMsg', `네임스페이스가 이미 존재합니다 : ${err}`) // if (err || ns===undefined)
      })
    });

  });
  //애초에 서버가 켜지는 시점이므로 각 유저 접속시마다 켜면 안된다. 따라서 서버켜질 때 조회가 맞고, 추가되는 Ns는 추가로 켜주는게 맞는 것 같다
  NsModel.find({}) // 최소한의 정보로 ns 소켓서버만 켜주고 안에서는 연결시 다시 ns를 받아와야 맞는거 아닌가?
  .select('nsTitle')
  .exec((err, docs) => {
    nsTitleList = docs.map((element)=>element.nsTitle) 

    docs.forEach((ns) => { 
      let NS_io = io.of(`/${ns.nsTitle}`)
      NS_io.on('connection', (nsSocket) => {
        nsSettings(io, NS_io, nsSocket)
      });
    });
  })
  return router
} 
