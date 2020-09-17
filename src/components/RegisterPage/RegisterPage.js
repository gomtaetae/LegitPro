import React, { useState } from 'react';
import { useDispatch } from "react-redux"
import { registerUser, loginUser } from '../../_actions/user_action'
import { Button, Form, Grid, Header, Segment } from 'semantic-ui-react'
import styles from './RegisterPage.module.css';

//소셜회원가입
import GoogleLogin from "react-google-login";
import KaKaoLogin from "react-kakao-login";
import styled from "styled-components";

const RegisterPage = (props) => {
  const dispatch = useDispatch();

  const [ Email, setEmail ] = useState("");
  const [ Password, setPassword ] = useState("");
  const [ Name, setName ] = useState("");
  const [ Confirm, setConfirm ] = useState("");

  //hidden input마다 분리
  const [ HdEmail, setHdEmail ] = useState(true);
  const [ okEmail, setOkEmail ] = useState(true);
  const [ HdName, setHdName ] = useState(true);
  const [ HdPwd, setHdPwd ] = useState(true);
  const [ HdMatch, setHdMatch ] = useState(true);


  function onEmailHandler(event) {
    setEmail(event.target.value)
  }
  function onNameHandler(event) {
    setName(event.target.value)
  }
  function onPasswordHandler(event) {
    setPassword(event.target.value)
  }
  function onConfirmHandler(event) {
    setConfirm(event.target.value)
  }

  //유효성검사
  function chkEmail(){
    let isEmail = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;
    return isEmail.test(Email) ? true : false
  }
  function chkName() {
    let isName = /^[가-힣a-zA-Z0-9]{2,15}$/;
    return isName.test(Name) ? true : false;
  };
  function chkPwd() {
    let isPwd = /^.*(?=.{6,20})(?=.*[0-9])(?=.*[a-zA-Z]).*$/;
    return !isPwd.test(Password) ? false : true;
  };
  function matchPwd() {
    return (Password === Confirm) ? true : false
  }

  function onSubmitHandler(event) {
    event.preventDefault();
    let body = {email : Email, name : Name, password : Password }
    
    //hidden 조건
    let email = chkEmail()
    let name = chkName() 
    let pwd = chkPwd()
    let confirmation = matchPwd()

    if (!email || !name || !pwd || !confirmation) {
      if (email) setHdEmail(true)
      else setHdEmail(false)
      
      if (name) setHdName(true)
      else setHdName(false)

      if (pwd) setHdPwd(true)
      else setHdPwd(false)
      
      if (confirmation) setHdMatch(true)
      else setHdMatch(false)
      
      return;
    }

    dispatch(registerUser(body))
    .then(response=>{
      //payload는 이미 {success: boolean}을 가리키므로 Success라고 하면안됨
      if(response.payload.success){
        dispatch(loginUser(body)).then((response) => {
          if (response.payload.loginSuccess) {
            props.history.replace("/invalid");
          } 
        });
      } else if(!response.payload.success){
        setOkEmail(false);
        setHdPwd(true);
        setHdMatch(true);
      }
    })
  }

  //Sns 로그인
  function SnsChk(body) {
    dispatch(registerUser(body)).then((response) => {
      console.log(response.payload);
      if (response.payload.success) {
        dispatch(loginUser(body)).then((response) => {
          alert("회원가입 성공");
          props.history.push("/login");
          console.log("임마", body);
        });
      } else {
        alert("이미 가입된 회원입니다");
        props.history.push("/");
      }
    });
  }

  //구글회원가입
  const responseGoogle = (res) => {
    let body = {
      email: res.profileObj.email,
      name: res.profileObj.name,
      password: res.profileObj.googleId,
      image: res.profileObj.imageUrl,
      isVerified: true,
      isSns: true
    };
    console.log("바디", res);
    SnsChk(body);
  };
  //카카오톡 회원가입
  const responseKaKao = (res) => {
    //카카오톡은 id가 Number여서 String으로 변환해줘야 로그인시 오류가 안남
    let pw = res.profile.id;
    pw = String(pw);
    console.log(pw);
    let body = {
      email: res.profile.kakao_account.email,
      name: res.profile.properties.nickname,
      password: pw,
      image: res.profile.properties.profile_image,
      isVerified: true,
      isSns: true
    };
    console.log("바디", body);
    SnsChk(body);
  };

  //소셜회원가입 실패시 에러로그
  const responseFail = (err) => {
    console.error(err);
  };

  return (
<Grid textAlign='center' style={{ height: '100vh' }} verticalAlign='middle'>
  <Grid.Column style={{ maxWidth: 450 }}>
    <Header as='h2' color='blue' textAlign='center'>
      Sign-in
    </Header>
    <Form size='large' onSubmit={onSubmitHandler}>
      <Segment stacked>
        <Form.Input fluid icon='user' iconPosition='left' placeholder='E-mail address' value={Email} onChange={onEmailHandler}/>
        {!HdEmail && <span className={styles.check_hidden}>이메일 형식이 유효하지 않습니다.</span>}
        {!okEmail && <span className={styles.check_hidden}>이미 사용중인 아이디입니다.</span>}
        <Form.Input fluid icon='user' iconPosition='left' placeholder='Name' value={Name} onChange={onNameHandler}/>
        {!HdName && <span className={styles.check_hidden}>이름은 한글,영문 대소문자 2~15자리만 사용 가능합니다.</span>}
        <Form.Input fluid icon='lock' iconPosition='left' placeholder='Password' type='password' value={Password} onChange={onPasswordHandler}/>
        {!HdPwd && <span className={styles.check_hidden}>비밀번호는 영문,숫자를 혼합하여 6~12자 이내로 입력해주세요</span>}
        <Form.Input fluid icon='lock' iconPosition='left' placeholder='Confirm Password' type='password' value={Confirm} onChange={onConfirmHandler}/>
        {!HdMatch && <span className={styles.check_hidden}>비밀번호가 일치하지 않습니다.</span>}
        <Button color='blue' fluid size='large'>
          Sign In
        </Button>
      </Segment>
    </Form>
    <br/>
    <GoogleBtn
          clientId={'297011327835-5bmnie06q1t9abcmp2sbv1a5oomfsk6g.apps.googleusercontent.com'}
          buttonText={<>&ensp;Google Sing In</>}
          onSuccess={responseGoogle}
          onFailure={responseFail}
      />
      &emsp;
      <KaKaoBtn
        //styled component 통해 style을 입혀 줄 예정 
        jsKey={'2c0529d015c5bd510bb0a3586f896493'}
        //카카오에서 할당받은 jsKey를 입력
        onSuccess={responseKaKao}
        //성공했을때 불러올 함수로서 fetch해서 localStorage에 저장할 함수를 여기로 저장 
        getProfile={true}
      >
        <img src="/kakao_sign.png" alt="이미지"></img>
      </KaKaoBtn>

    </Grid.Column>
    </Grid>
  );
};

const GoogleBtn = styled(GoogleLogin)`
  width: 185px;
  height: 49px;
  border: 1px solid transparent;
  border-color : grey;
`;

const KaKaoBtn = styled(KaKaoLogin)`
  padding: 0;
  line-height: 44px;
  color: #783c00;
  background-color: #FEE500;
  border: 1px solid transparent;
  border-radius: 3px;
  font-size: 14px;
  font-weight: bold;
  text-align: center;
  cursor: pointer;
  box-shadow: 0 2px 2px 0 rgba(180, 180, 180);
  position: relative;
  top: -3.5px;
`;

export default RegisterPage;