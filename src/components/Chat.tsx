import React from 'react';
import { v4 as uuidv4 } from 'uuid';

import user from '../assets/Avatar.svg';
import bot from '../assets/bot.svg';

import InputBlock from './InputBlock';

import styles from '../styles/Chat.module.scss';


interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: number;
}

interface DisplayedBotMessages {
  [messageId: string]: string | boolean;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [inputText, setInputText] = React.useState('');
  const [botType, setBotType] = React.useState(false);

  const [isDisplayingBotMessages, setIsDisplayingBotMessages] = React.useState<DisplayedBotMessages>({});

  const [isInitialGreetingSent, setIsInitialGreetingSent] = React.useState(false);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // Отправляем приветственное сообщение только один раз при монтировании компонента
    if (!isInitialGreetingSent) {
      const initialMessage: Message = {
        id: uuidv4(),
        text: "Hello! I’m BotHub, AI-based bot designed to answer all your questions.",
        isBot: true,
        timestamp: Date.now(),
      };
      setMessages([initialMessage]);
      setIsInitialGreetingSent(true);
    }
  }, []);

  React.useEffect(() => {
    // Прокручиваем к последнему сообщению при его добавлении
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const displayBotMessage = async (messageId: string, message: string) => {
    setIsDisplayingBotMessages(prevState => ({ ...prevState, [messageId]: true }));
    let displayedMessage = '';
    for (let i = 0; i < message.length; i++) {

      const char = message[i];
      displayedMessage += char;
      setIsDisplayingBotMessages(prevState => ({ ...prevState, [messageId]: displayedMessage }));
      await new Promise(resolve => setTimeout(resolve, 50)); // Adjust the delay as needed
    }

    setIsDisplayingBotMessages(prevState => ({ ...prevState, [messageId]: false }));
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: uuidv4(),
      text: inputText,
      isBot: false,
      timestamp: Date.now(),
    };

    setMessages([...messages, newMessage]);
    setInputText('');
    setBotType(true);

    try {
      const response = await fetch('https://185.46.8.130/api/v1/chat/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputText }),
      });

      if (!response.body) {
        console.error('Response body is not readable');
        return;
      }

      let isBotResponseDone = false;
      let currentMessage = '';
      let botMessage = '';
      const reader = response.body.getReader();

      while (!isBotResponseDone) {
        const { value, done } = await reader.read();

        if (done) {
          break;
        }

        const decodedChunk = new TextDecoder().decode(value);

        for (const char of decodedChunk) {
          if (char === '{') {
            currentMessage = '{';
          } else if (char === '}') {
            currentMessage += '}';
            const messageObj = JSON.parse(currentMessage);

            if (messageObj.status === 'content') {
              botMessage += messageObj.value;
            } else if (messageObj.status === 'done') {
              isBotResponseDone = true;
              if (botMessage) {
                const message: Message = {
                  id: uuidv4(),
                  text: botMessage,
                  isBot: true,
                  timestamp: Date.now(),
                };
                setMessages(prevMessages => [...prevMessages, message]);
                await displayBotMessage(message.id, botMessage); // Display the entire bot message at once after delay
                botMessage = '';
              }
            }

            currentMessage = '';
          } else {
            currentMessage += char;
          }
        }


      }
      setBotType(false);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <>
      <div className={styles['chat-container']}>
        <div className={styles['message-list']}>
          {messages.map((message, index) => (
            <div key={message.id} ref={index === messages.length - 1 ? messagesEndRef : null} className={`${styles.message} ${message.isBot ? styles.bot : styles.user}`}>
              <div className={styles['message-content']}>
                {message.isBot && isDisplayingBotMessages[message.id] ? (isDisplayingBotMessages[message.id] as boolean) : message.text}
                <div className={styles.timestamp}>{new Date(message.timestamp).toLocaleTimeString()}</div>
              </div>
              <img src={message.isBot ? bot : user} alt="User or Bot" className={styles.avatar} />
            </div>
          ))}
        </div>
      </div>

      <InputBlock inputText={inputText} setInputText={setInputText} sendMessage={sendMessage} botType={botType} />
    </>
  );
};

export default Chat;
