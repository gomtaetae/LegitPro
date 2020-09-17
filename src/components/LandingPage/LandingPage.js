import React, { useState } from 'react';
import Namespaces from '../Namespaces/Namespaces'
import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import { Dimmer, Loader} from 'semantic-ui-react'

const LandingPage = (props) => {
  let {userData}= useSelector((state)=>state.user)
  const [isStoreLoaded, setStoreLoad] = useState(false);

  useEffect(()=>{
    if(userData) setStoreLoad(true);
  }, [userData])
  return (
    <>
      {isStoreLoaded 
        ? <Namespaces {...props}></Namespaces>
        : <Dimmer active> <Loader /> </Dimmer>
      }
    </>
  );
};

export default LandingPage