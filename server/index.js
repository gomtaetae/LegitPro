const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const dotenv =require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
})
.then(() => { console.log("DB connected") })
.catch((err) => { console.log(err) })

//application/x-www-form-urlencoded 타입 데이터를 분석해서 가져올 수 있게 해준다.
app.use(bodyParser.urlencoded({ extended: true }));
//application/json 타입 데이터를 분석해 가져올 수 있게 해준다.
app.use(express.json({ extended: true })); // app.use(bodyParser.json());
//쿠키파서 사용설정
app.use(cookieParser());

const userRouter = require('./routes/userRouter');
const chatRouter = require('./routes/chatRouter');
const chatSocket = require('./routes/chatSocket');

const port = 9000
server.listen(port, ()=>{
  console.log('Backserver is running...');
  console.log(`Front is http://${process.env.IP_ADDRESS}:3000`);
})

app.use('/uploads', express.static('uploads'));
app.use('/api/users',userRouter);
app.use('/api/chat',chatRouter(io));
app.use('/api/chatSocket', chatSocket(io)); // 소켓처리 담당