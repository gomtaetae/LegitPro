const {User} = require('../models/User');

let auth = (req, res, next)=>{
  let token = req.cookies.x_auth; // x_auth라는 이름으로 저장한 쿠키를 가져옴 (=token)
  User.findByToken(token, (err, user)=>{
    //유저가 있으면 인증 OK, 없으면 인증 NO
    if(err) throw err;
    if(!user) return res.json({isAuth : false, error : true, isVerified : false});
    //유저가 있는 경우
    req.token = token; // req에 넣어주므로 인해서 req로 바로 사용하기 편해지기 때문이다
    req.user = user;
    next(); // 다 작성하고 나서 다시 요청으로 보내주기 위해 호출
  });
}
module.exports = {auth}