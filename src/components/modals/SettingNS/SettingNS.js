import React, { useState } from 'react';
import { Button, Modal } from 'semantic-ui-react'

const SettingNS = ({Close}) => {
  const [Open, setOpen] = useState(false);
  const [Size, setSize] = useState();

  function show(size) {
    setSize(size);
    setOpen(true);
    Close()
  }
  function close() { setOpen(false); }

  function submitSetttings() {
    console.log(`세팅!`);
    setOpen(false);
  }

  return (<>
      {/* <Icon name='setting' onClick={()=>{ show('small') }}></Icon> */}
      <div onClick={() => { show('small') }}>Settings</div>
      <Modal size={Size} open={Open} onClose={close} centered={true}>
        <Modal.Header>NS 설정</Modal.Header>
        <Modal.Content>
          설정임<hr/>
        </Modal.Content>
        <Modal.Actions>
          <Button negative onClick={close}>닫기</Button>
          <Button
            positive
            icon='checkmark'
            labelPosition='right'
            content='생성'
            onClick={submitSetttings}
          />
        </Modal.Actions>
      </Modal>
  </>);
};

export default SettingNS;