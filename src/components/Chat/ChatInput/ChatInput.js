import React, { useState, useRef } from 'react';
import {Editor, EditorState, RichUtils, getDefaultKeyBinding} from 'draft-js';
import { convertToHTML } from 'draft-convert';
import 'draft-js/dist/Draft.css';
import './Draft.css';
import styles from "./ChatInput.module.css"
import { useSelector } from 'react-redux';

let currentEditorState;
function ChatInput({roomId, scrollBottom}) {
  let {userData} = useSelector(state=>state.user) 
  let {currentNs, nsSocket} = useSelector(state=>state.chatInfo)
  const [editorState, setEditorState] = useState(EditorState.createEmpty()
  );
  let editor = useRef();
  function focus() { editor.current.focus() }
  function onChange (e) {
    currentEditorState = e
    setEditorState(e)
  }

  function _onBlockClick(style) {
    onChange(RichUtils.toggleBlockType(editorState, style));
    setTimeout(() => { focus() }, 20);
  }
  function _onInlineClick(style) {
    onChange(RichUtils.toggleInlineStyle(editorState, style));
    setTimeout(() => { focus() }, 20);
  }
  
  function handleKeyCommand(command, editorState) {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      onChange(newState);
      return 'handled';
    }
    return 'not-handled';
  }

  function keyBindingFn(e) {//tab키는 9 엔터는 13
    if (e.ctrlKey && e.keyCode === 13) {
      return 'split-block' 
    }
    if (e.keyCode === 13) {
      Send()
      return
    }
    return getDefaultKeyBinding(e);
  }

  function Send() {
    let text = convertToHTML(currentEditorState.getCurrentContent())
    if(text!=="<p></p>") {
      let {_id} = userData
      nsSocket.emit("newMessageToServer", { NS_id : currentNs._id, roomId ,text, type : "text", userId: _id, filename : ""});
      setEditorState(EditorState.createEmpty())
    }
    setTimeout(()=>{scrollBottom()}, 50);
    setTimeout(()=>{focus()}, 100);
  }


  return (
    <>
    <div className={styles.editor_wrapper}>
      <Editor 
        editorState={editorState} 
        onChange={(e)=>{onChange(e)}}
        handleKeyCommand={handleKeyCommand}
        ref={editor}
        keyBindingFn={keyBindingFn}
      />
    </div>
    <div className={styles.editor_control}>
      <div className={styles.button_wrapper}>
        <div className={styles.button} onClick={()=>{_onInlineClick('BOLD')}}>B</div>
        <div className={styles.button} onClick={()=>{_onInlineClick('ITALIC')}}>I</div>
        <div className={styles.button} onClick={()=>{_onInlineClick('UNDERLINE')}}>U</div>
        <div className={styles.button} onClick={()=>{_onBlockClick('unordered-list-item')}}>UL</div>
        <div className={styles.button} onClick={()=>{_onBlockClick('ordered-list-item')}}>OL</div>
      </div>
      <i className={`${styles.submit} fas fa-paper-plane`} onClick={Send}></i>
    </div>
    </>
  );
}
export default ChatInput;

// function onTab(e) {
//   e.preventDefault();
//   const maxDepth = 4;
//   onChange(RichUtils.onTab(e, editorState, maxDepth));
// }

// {/* <button onClick={()=>{_onBlockClick('header-one')}}>H1</button>
// <button onClick={()=>{_onBlockClick('header-two')}}>H2</button>
// <button onClick={()=>{_onBlockClick('header-three')}}>H3</button>
// <button onClick={()=>{_onBlockClick('header-four')}}>H4</button>
// <button onClick={()=>{_onBlockClick('header-five')}}>H5</button>
// <button onClick={()=>{_onBlockClick('header-six')}}>H6</button>
// <button onClick={()=>{_onBlockClick('blockquote')}}>Blockquote</button> */}