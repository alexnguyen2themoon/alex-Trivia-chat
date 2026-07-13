import React, { useState, useCallback, useEffect, useRef } from "react";
import { GiftedChat } from "react-native-gifted-chat";
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text } from 'react-native'; // Added View and Text for the timer display

const CHATBOT_USER_OBJ = {
  _id: 2,
  name: "React Native Chatbot",
  avatar: "https://loremflickr.com/140/140",
};

const triviaQuestionAlex = [
  {
    design: {
      teaching: "cole, rachel, jon",
      scholars: "abigail, cassandra, christopher, ezra, geronimo, katelyn, kenner, lionell, lohana, matthew, jaelin, rafael, sam, isa, vita"
    },
    storytelling: {
      teaching: "sterling, giovanna, jacob",
      scholars: "daniel, vivian, diana, lezette, hadassah, christopher, nicholas, ben, jasmine, desimond, alexandra, darius, devin, joshua, daniel"
    },
    lens: {
      teaching: "jiashi, ben, francesca",
      scholars: "ajax, anthony, carlos, connor, devin, emily, hannah, nghi, niekelle, tayo, reece, shawn, steven, vahan"
    },
    engineering: {
      teaching: "alexis, edward, ricardo",
      scholars: "abigail, alexander, alex, kritika, shawn, viola, keziah, ryan, sabrina, vaughn, jade, jackie, jae, jair, melissa"
    }
  }
];

const gameSteps = [
  { track: "storytelling", role: "teaching", prompt: "Name a TEACHING member in Storytelling!" },
  { track: "storytelling", role: "scholars", prompt: "Name a SCHOLAR in Storytelling!" },
  { track: "lens", role: "teaching", prompt: "Name a TEACHING member in Lens!" },
  { track: "lens", role: "scholars", prompt: "Name a SCHOLAR in Lens!" },
  { track: "engineering", role: "teaching", prompt: "Name a TEACHING member in Engineering!" },
  { track: "engineering", role: "scholars", prompt: "Name a SCHOLAR in Engineering!" },
];

export default function App() {
  const [messages, setMessages] = useState([]);
  const [gameState, setGameState] = useState(-1); 
  
  // Timer States
  const [timeLeft, setTimeLeft] = useState(120); // 120 seconds = 2 minutes
  const timerRef = useRef(null); // Keeps track of our active interval reference

  useEffect(() => {
    if (messages.length < 1) {
      addBotMessage("Hello, welcome to simple trivia! Say 'Yes' when you're ready to play! You will have 2 minutes.");
    }
    // Clean up timer when component unmounts
    return () => clearInterval(timerRef.current);
  }, []);

  // Listen to timer countdown changes
  useEffect(() => {
    if (timeLeft === 0 && gameState !== -1) {
      // Time is up! 
      clearInterval(timerRef.current);
      setGameState(-1);
      addBotMessage("⏰ Time's up! You couldn't finish in 2 minutes. Game Over! ❌\n\nSay 'Yes' to try again.");
    }
  }, [timeLeft, gameState]);

  const startTimer = () => {
    // Clear any lingering timer just in case
    clearInterval(timerRef.current); 
    setTimeLeft(120); // Reset clock to 2 minutes
    
    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  const addNewMessage = (newMessages) => {
    setMessages((previousMessages) => GiftedChat.append(previousMessages, newMessages));
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

  const respondToUser = (userMessages) => {
    const userText = userMessages[0].text.trim().toLowerCase(); 

    // LOBBY STATE
    if (gameState === -1) {
      if (userText === "yes") {
        setGameState(0);
        setMessages([]); 
        startTimer(); // <-- Start the clock right here!
        addBotMessage("Let's begin!\n\nQuestion 1: " + gameSteps[0].prompt);
      } else {
        addBotMessage("Please say 'Yes' when you are ready to play!");
      }
      return;
    }

    // GAMEPLAY STATE
    if (gameState >= 0 && gameState < gameSteps.length) {
      // If time ran out before the timeout delay finished execution, don't allow processing answers
      if (timeLeft <= 0) return;

      const currentStep = gameSteps[gameState];
      const rawString = triviaQuestionAlex[0][currentStep.track][currentStep.role];
      const validAnswers = rawString.split(",").map(name => name.trim().toLowerCase());

      if (validAnswers.includes(userText)) {
        const nextState = gameState + 1;
        
        if (nextState < gameSteps.length) {
          setGameState(nextState);
          addBotMessage(`🎉 Correct! ${userMessages[0].text} is on the team.\n\nQuestion ${nextState + 1}: ${gameSteps[nextState].prompt}`);
        } else {
          // Finished the final question!
          clearInterval(timerRef.current); // <-- Stop the clock, they won!
          setGameState(-1); 
          addBotMessage(`🏆 Amazing job! You beat the clock with ${formatTime(timeLeft)} left! You win!\n\nSay 'Yes' if you want to play again.`);
        }
      } else {
        addBotMessage(`❌ Not quite! "${userMessages[0].text}" doesn't seem to be in that group. Try another name!`);
      }
    }
  };

  const onSend = useCallback((newMessages = []) => {
    addNewMessage(newMessages);
  }, []);

  // Helper function to render seconds into a pretty MM:SS layout
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        
        {/* Render the header bar with the active timer if the game is running */}
        {gameState !== -1 && (
          <View style={{ padding: 15, backgroundColor: '#f0f0f0', alignItems: 'center', borderBottomWidth: 1, borderColor: '#ddd' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: timeLeft <= 15 ? 'red' : 'black' }}>
              ⏱️ Time Remaining: {formatTime(timeLeft)}
            </Text>
          </View>
        )}

        <GiftedChat
          messages={messages}
          onSend={(newMessages) => {
            onSend(newMessages);
            setTimeout(() => respondToUser(newMessages), 1000);
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

const error = console.error;
console.error = (...args) => {
  if (/defaultProps/.test(args[0])) return;
  error(...args);
};