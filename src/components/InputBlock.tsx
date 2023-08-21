import React from 'react'
import sendBtn from '../assets/sendBtn.svg'
import styles from '../styles/InputBlock.module.scss';


interface InputBlockProps {
  inputText: string;
  setInputText: React.Dispatch<React.SetStateAction<string>>;
  sendMessage: () => void;
  botType: boolean;
}

const InputBlock: React.FC<InputBlockProps> = ({ inputText, setInputText, sendMessage, botType }) => {
  return (
    <div className={styles['input-form']}>
      <input
        type="text"
        placeholder="Type a message..."
        value={inputText}
        onChange={e => setInputText(e.target.value)}
        className={styles['input-field']}
      />

      <button disabled={botType ? true : false} className={botType ? styles['disabled'] : styles['send-button']} onClick={sendMessage}>
        <img src={sendBtn} alt="sendBtn" />
      </button>
    </div >
  )
}

export default InputBlock