const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const saltRounds = 10;

const userSchema = mongoose.Schema({
  name: {// 이름
    type: String,
    maxlength: 50,
    required : true
  },
  email: {// 유일값으로 설정
    type: String,
    trim: true, // 앞뒤공백제거
    unique: 1, // 유일값
    required : true
  },
  password: {
    type: String,
    minLength: 5,
    required : true
  },
  role: {// 관리자와 일반사용자 구분을 위해
    type: Number, //0이면 일반, 관리자면 1  구분
    default: 0, // 따로 정하지 않으면 role을 0을 준다
    required : true
  },
  image: {// 프로필이미지
    type : String, 
    required : true,
    default : "/default_profile.png"
  },
  socket : { 
    type: String 
  },
  token: {// 토큰
    type: String,
  },
  tokenExp: {// 토큰 유효시간
    type: Number,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isSns: {
    type: Boolean,
    default: false,
  },

}, {timestamps: true});

userSchema.pre('save', function (next) {
  let user = this;
  if (user.isModified("password")) {
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) return next(err);
      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) return next(err);
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
})
//새로 추가된 것
userSchema.pre("updateOne", function (next) {
  let user = this;
  if (user._update.$set.password) {
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) return next(err);
      bcrypt.hash(user._update.$set.password, salt, function (err, hash) {
        if (err) return next(err);
        user._update.$set.password = hash;
        console.log(hash);
        next();
      });
    });             
  } else if(user._update.$set.image){ //이미지를 바꿀떄
    next();
  }
});





userSchema.methods.comparePassword = function (plainPassword, callback) {
  bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
    if (err) return callback(err)
    callback(null, isMatch);
  });
};

userSchema.methods.generateToken = function (callback) {
  let user = this; 
  let token = jwt.sign(user._id.toHexString(), "secretToken");
  user.token = token;
  user.save(function (err, user) {
    if (err) return callback(err);
    callback(null, user);
  });
};

//객체생성 안하고 쓸거라서 statics로 생성
userSchema.statics.findByToken = function (token, callback) {
  let user = this;
  //토큰을 복호화한다.
  jwt.verify(token, "secretToken", function (err, decoded) {//복호화 메소드
    //유저아이디로 유저를 찾고, 클라이언트에서 가져온 토큰을 비교
    user.findOne({ "_id": decoded, token }, (err, user) => {
      if (err) return callback(err);
      callback(null, user)
    })
  })
}

const User = mongoose.model('User', userSchema) // (모델의 이름, 스키마)
module.exports = { User }