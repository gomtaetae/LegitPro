const express = require('express');
const multer = require('multer');
const fs = require('fs');

let storage = multer.diskStorage({ // 파일이 저장될 스토리지경로와 저장될 파일명 지정
  destination: (req, file, callback)=>{ // 경로설정
    callback(null, "uploads/"); // 루트경로.uploads를 경로로 지정하겠다
  },
  filename: (req, file, callback)=>{   //파일이름설정 : 현재시_원래이름 으로 하였음
    callback(null, `${Date.now()}_${file.originalname}`);
  }
})
const upload = multer({storage : storage}).single("file"); // 지정된 storage로 upload함수 생성

module.exports = function (io) {
  const router = express.Router();
  //파일 로컬 저장부분
  router.post('/uploadfiles',(req, res)=>{
    upload(req, res, (error)=>{
      if(error) return res.json({success : false, error}); //에러처리
      let {filename, path, mimetype} = res.req.file;
      let url = `http://${process.env.IP_ADDRESS}:9000/${path}`;
      
      return res.json({success : true, url, mimetype, filename});
    })
  })
  return router
} 


