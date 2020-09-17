import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {auth} from '../_actions/user_action'

export default (SpecificComponent, option, adminRoute = null) =>{
//option종류
//null : 아무나출입가능
//true : 로그인 유저만 출입가능
//false : 비로그인 유저만 출입가능
  function AuthenticationCheck(props) {
    const dispatch = useDispatch();
    useEffect(()=>{     
      dispatch(auth()).then(response=>{
        //로그인 안한상태
        if (!response.payload.isAuth) {
          if (option) {
            props.history.replace("/login");
          }
        } else if (response.payload.isAuth && !response.payload.isVerified) {
          props.history.replace("/invalid"); 

        } else {
        //로그인 한 상태
          if (adminRoute && !response.payload.isAdmin) {
            props.history.replace("/");
          } else {
            if (option === false) props.history.replace("/");
          }
        }
      })
    }, [dispatch, props.history]);

    return (
      <SpecificComponent {...props}/>
    )
  }
  return AuthenticationCheck
}