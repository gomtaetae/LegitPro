import React, { useState } from 'react';
// import { useDispatch } from 'react-redux';
// import { registerUser } from '../../_actions/user_action';
import { Button, Form, Grid, Header, Segment } from 'semantic-ui-react'

const UserModify = () => {
  // const dispatch = useDispatch();

  const [ Email, setEmail ] = useState("");
  const [ Password, setPassword ] = useState("");
  const [ Name, setName ] = useState("");
  const [ Confirm, setConfirm ] = useState("");

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

  function onSubmitHandler(event) {
    event.preventDefault();

  }
  return (
    <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign='middle'>
    <Grid.Column style={{ maxWidth: 450 }}>
      <Header as='h2' color='teal' textAlign='center'>
        회원정보 수정
      </Header>
      <Form size='large' onSubmit={onSubmitHandler}>
        <Segment stacked>
          <Form.Input fluid icon='user' iconPosition='left' placeholder='E-mail address' value={Email} onChange={onEmailHandler}/>
          <Form.Input fluid icon='user' iconPosition='left' placeholder='Name' value={Name} onChange={onNameHandler}/>
          <Form.Input fluid icon='lock' iconPosition='left' placeholder='Password' type='password' value={Password} onChange={onPasswordHandler}/>
          <Form.Input fluid icon='lock' iconPosition='left' placeholder='Confirm Password' type='password' value={Confirm} onChange={onConfirmHandler}/>

          <Button color='teal' fluid size='large'>
            확인
          </Button>
        </Segment>
      </Form>
    </Grid.Column>
    </Grid>
  );
};

export default UserModify;