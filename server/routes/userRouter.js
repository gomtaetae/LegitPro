const express = require('express');
const router = express.Router();
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const { User } = require('../models/User');
const { auth } = require('../middleware/auth');

//여기는 유저
router.post('/register', (req, res) => {
  console.log(req.body);
  const user = new User(req.body);
  user.save((err, userInfo) => {
    if (err) { return res.json({ success: false, err }) }
    return res.status(200).json({
      success: true, userInfo}) // ??
  });
})

router.post("/login", (req, res) => {
  User.findOne({ email: req.body.email }, function (err, user) {
    if (!user) return res.json({ loginSuccess: false, message: "이메일에 해당하는 유저가 없습니다" });
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch) return res.json({ loginSuccess: false, message: "비밀번호가 일치하지 않습니다" });
      user.generateToken((err, user) => {
        let {_id, name, image, role, email, token} = user
        res.cookie("x_auth", token).status(200)
          .json({ loginSuccess: true, _id, name, image, role, email })
      });
    });
    if (!user.isVerified) {
      if (err) res.json({ success: false, err });
      else {sendingEmail(user); }
    }
  })
  .catch((err)=>{
    return res.status(400).send(err);
  })
});

router.get('/auth', auth, (req, res) => {
  let {_id, role, email, name, image, password, isVerified, isSns} = req.user
  res.status(200).json({
    _id, email, name, image, password, isVerified, isSns,
    isAdmin: role === 0 ? false : true,
    isAuth: true
  })
})
//로그아웃
router.get('/logout', auth, (req, res)=>{
  //유저를 찾아왔을테니 업데이트 해주어야 한다
  User.findOneAndUpdate({_id : req.user._id}, {token : ""}, (err, user)=>{
    if(err) return res.json({success : false, err})
    return res.status(200).send({success : true})
  })
})

router.get("/getValidation", auth, (req, res) => {
  User.findByIdAndUpdate( { _id: req.user._id }, { isVerified: true },
    (err, user) => {
      if (err) return res.json({ success: false, err });
      return res.status(200).send({ success: true });
    }
  );
});

router.get("/resend", auth, (req, res) => {
  User.findOne({ email: req.user.email }, (err, user) => {
    sendingEmail(user);
    return res.status(200).send({ success: true });
  })
  .catch((err)=>{
    res.json({ success: false, err });
  })
});

router.post("/modify", auth, (req, res)=>{
  let {user, body} = req
  let {password, image, name} = body
  User.findOne({ _id: user.id }, (err, user) => {
    if (err) return res.json({ success: false, err });
    User.updateOne( {_id: user._id}, { $set: { password, image, name } }, (err,userInfo)=>{
      if(err) return res.json({success: false, err})
      return res.status(200).send({ success:true, user : userInfo })
      }
    )
  })
})

module.exports =router

function sendingEmail(user) {
  const Verifiedtoken = jwt.sign(user._id.toHexString(), "registerToken");
  const url2 = `http://localhost:3000/valid/${Verifiedtoken}`;
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: "bitbitlegit@gmail.com",  pass: "!bit9000" },
  });
  const mailOptions = {
    from: "bitbitlegit@gmail.com", to: user.email, subject: "안녕하세요, 이메일 인증을 해주세요.",
    html: `Please, confirm your email by clicking the following link: <a href=${url2}>${url2}</a>`,
  };
  transporter.sendMail(mailOptions, function (error, info) {});
}