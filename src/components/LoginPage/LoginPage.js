import React, { useState } from 'react';
import styles from './LoginPage.module.css';
import { Button, Form, Grid, Header, Message, Segment } from 'semantic-ui-react'
import { useDispatch } from "react-redux"
import {loginUser} from '../../_actions/user_action'
import { Link } from 'react-router-dom';
//소셜로그인 추가
import  GoogleLogin  from 'react-google-login';
import  KaKaoLogin  from 'react-kakao-login';
import styled from 'styled-components'

const LoginPage = (props) => {
  const dispatch = useDispatch();

  const [ Email, setEmail ] = useState("");
  const [ Password, setPassword ] = useState("");
  const [ chkEmail, setChkEmail ] = useState(true);

  function onEmailHandler(event) {
    setEmail(event.target.value)
  }
  function onPasswordHandler(event) {
    setPassword(event.target.value)
  }
  function onSubmitHandler(event) {
    event.preventDefault();
    let body = {
      email : Email,
      password : Password
    }
    dispatch(loginUser(body))
    .then(response=>{
      if(response.payload.loginSuccess){
        props.history.push('/')
      }else{
        if(!response.payload.check){
          setChkEmail(false);
        }
      }
    }) 
  }

  //SNS 회원가입 여부 확인
  function chkSignUp(body){
    dispatch(loginUser(body))
      .then(response => {
        if(response.payload.loginSuccess){
          props.history.push('/')
        } else {
          alert('회원정보를 찾을 수 없습니다.')
        }
      })
  }

  //구글 로그인
  const responseGoogle = (res) => {
    let body={
      email:res.profileObj.email,
      password: res.profileObj.googleId
    }

    chkSignUp(body);
    }

  //카카오톡 로그인
  const responseKaKao = (res) => {
    let pw = res.profile.id
    pw = String(pw);

    let body={
      email:res.profile.kakao_account.email,
      password: pw,
    }
    console.log(body);
    chkSignUp(body);
  }


  //실패시
  const responseFail = (err) => {
    console.error(err);
  }

  return (
    <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign='middle'>
    <Grid.Column style={{ maxWidth: 450 }}>
      <Header as='h2' color='blue' textAlign='center'>
        Log-in to your account
      </Header>
      <Form size='large' onSubmit={onSubmitHandler}>
        <Segment stacked>
          <Form.Input fluid icon='user' iconPosition='left' placeholder='E-mail address' value={Email} onChange={onEmailHandler}/>
          <Form.Input
            fluid
            icon='lock'
            iconPosition='left'
            placeholder='Password'
            type='password'
            value={Password} 
            onChange={onPasswordHandler}
          />
          {!chkEmail && <span className={styles.check_hidden}>이메일 또는 비밀번호를 확인해주세요</span>}
          
          <Button color='blue' fluid size='large'>
            Login
          </Button>
        </Segment>
      </Form>
      <Message>
        계정이 없나요? <Link to='/register'>Sign Up</Link>
      </Message>
      <GoogleBtn
          clientId={'297011327835-5bmnie06q1t9abcmp2sbv1a5oomfsk6g.apps.googleusercontent.com'}
          buttonText={<>&ensp;Google Login</>}
          onSuccess={responseGoogle}
          onFailure={responseFail}
      />
      &emsp;
      <KaKaoBtn
        //styled component 통해 style을 입혀 줄 예정 
        jsKey={'2c0529d015c5bd510bb0a3586f896493'}
        //카카오에서 할당받은 jsKey를 입력
        //buttonText='카카오 로그인'
        //로그인 버튼의 text를 입력
        onSuccess={responseKaKao}
        //성공했을때 불러올 함수로서 fetch해서 localStorage에 저장할 함수를 여기로 저장 
        getProfile={true}
      >
        <img src="/kakao_login2.png" alt="이미지"></img>
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


export default LoginPage;