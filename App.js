import React, { useState, useCallback, useEffect } from "react";
import { GiftedChat } from "react-native-gifted-chat";
import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';

const CHATBOT_USER_OBJ = {
  _id: 2,
  name: "React Native Chatbot",
  avatar: "https://loremflickr.com/140/140",
};

//My questions

const trivia_questions_alex = [
  {
    question: "What's my favorite color?\n 1) Purple\n2)B) Green\n3) Blue",
    answer: "3"
  },
  {
    question: "What language can I speak?\n1) Japanese\n2) Vietnamese\n 3) Spanish",
    answer: "2"
  },
  {
    question: "What's my favorite food?\n1) Pho Noodles\n2)2) Birria Taco\n 3) Chicken Katsu",
    answer: "1"
  }
];

export default function App() {
  const [messages, setMessages] = useState([]);
  const [gameState, setGateState] = useState(-1); //Google says useState should be -1 bc it's the lobby / welcome screen (waiting for "Yes").



  useEffect(() => {
    if (messages.length < 1) {
      // Add a "starting message" when chat UI first loads
      addBotMessage(
        "Hello, welcome to simple trivia! Say 'Yes' when you're ready to play!",
      );
    }
  }, []);

  const addNewMessage = (newMessages) => {
    setMessages((previousMessages) => {
      console.log("PREVIOUS MESSAGES:", previousMessages);
      console.log("NEW MESSAGE:", newMessages);
      return GiftedChat.append(previousMessages, newMessages);
    });
  };

  const addBotMessage = (text) => {
    addNewMessage([
      {
        _id: Math.round(Math.random() * 1000000),
        text: text,
        createdAt: new Date(),
        user: CHATBOT_USER_OBJ,
      },
    ]);
  };

    const addRemindMessage = (text) => {
    addNewMessage([
      {
        _id: Math.round(Math.random() * 1000000),
        text: text,
        createdAt: new Date(),
        user: CHATBOT_USER_OBJ,
      },
    ]);
  };


  const respondToUser = (userMessages) => {
    console.log("Recent user msg:", userMessages[0].text);
      if (userMessages == "Yes"){
        addBotMessage("I am da response!");
      } else {
        addRemindMessage("Please say \'Yes\'");
      }  
  };

  const onSend = useCallback((messages = []) => {
    addNewMessage(messages);
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{flex: 1}}>
        <GiftedChat
          messages={messages}
          onSend={(messages) => {
            onSend(messages);
            // Wait a sec before responding
            setTimeout(() => respondToUser(messages), 1000);
          }}
          user={{
            _id: 1,
            name: "Chilla",
          }}
          renderUsernameOnMessage={true}
        />
      </SafeAreaView> 
    </SafeAreaProvider>
  );
}

// Workaround to hide an unnessary warning about defaultProps
const error = console.error;
console.error = (...args) => {
  if (/defaultProps/.test(args[0])) return;
  error(...args);
};