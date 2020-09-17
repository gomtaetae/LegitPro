import React, { useEffect } from "react";
import axios from 'axios'

function Valid(props) {

  useEffect(() => {
    axios.get(`/api/users/getValidation`)
    .then(response => {
      console.log(response.data)
      if(response.data.success){
        alert("인증이 완료되었습니다.")
        props.history.replace("/")
      } else {
        alert("비정상적인 경로입니다.")
        props.history.replace("/")
      }
    })
  },[props.history]);

  return (
    <div>      
    <p>confirmation</p><br/>
    </div>
  )
}

export default Valid
