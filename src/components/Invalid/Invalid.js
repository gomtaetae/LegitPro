import React, { useEffect } from "react";
import axios from "axios";
import { Button,Grid, Header} from 'semantic-ui-react'
import {useSelector} from 'react-redux'
function Invalid(props) {
  let {userData}= useSelector((state)=>state.user)
  useEffect(() => {
    axios.get("api/users/auth").then((response) => {
      if (response.data.isVerified) props.history.replace("/");
    });
  }, [props.history]);
  const onClickHandler = () => {
    axios.get("api/users/logout").then((response) => {
      console.log("response.data : ", response.data);
      if (response.data.success) {
        alert("로그아웃에 성공했습니다.");
        props.history.replace("/");
      } else {
        alert("로그아웃 하는데 실패 했습니다.");
      }
    });
  };
  const onResendEmail = () => {
    axios.get("/api/users/resend").then((response) => {
      (response.data.success) ? alert("이메일을 보냈습니다.") : alert("이메일 보내는데 실패 했습니다.");
    });
  };
  return (
    <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign='middle'>
  <Grid.Column style={{ maxWidth: 450 }}>
  <Header as='h2' color='blue' textAlign='center'>
        이메일 인증 페이지
      </Header>
      <p>
    안녕하세요, {userData && <span>{userData.name}</span>}님!<br/>
  가입시 입력한 {userData && <span>{userData.email}</span>}로 메일이 전송되었습니다. <br/>
      메일을 확인해주세요 
      </p>
      <br/>
      <Button color='blue' fluid size='medium' onClick={onResendEmail}>
            이메일 다시 전송하기
          </Button>
          <br/>
          <Button color='blue' fluid size='medium' onClick={onClickHandler}>
            로그아웃
          </Button>
  </Grid.Column>
    </Grid>
  );
}
export default Invalid;
