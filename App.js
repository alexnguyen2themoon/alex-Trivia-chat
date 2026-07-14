import React, { useState, useCallback, useEffect, useRef } from "react";
import { GiftedChat } from "react-native-gifted-chat";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { View, Text } from "react-native";

const CHATBOT_USER_OBJ = {
  _id: 2,
  name: "React Native Chatbot",
  avatar: "https://loremflickr.com/140/140",
};

const cohortData = {
  design: {
    teaching: ["cole", "rachel", "jon"],
    scholars: [
      "abigail",
      "cassandra",
      "christopher",
      "ezra",
      "geronimo",
      "katelyn",
      "kenner",
      "lionell",
      "lohana",
      "matthew",
      "jaelin",
      "rafael",
      "sam",
      "isa",
      "vita",
    ],
  },
  storytelling: {
    teaching: ["sterling", "giovanna", "jacob"],
    scholars: [
      "daniel",
      "vivian",
      "diana",
      "lezette",
      "hadassah",
      "christopher",
      "nicholas",
      "ben",
      "jasmine",
      "desimond",
      "alexandra",
      "darius",
      "devin",
      "joshua",
    ],
  },
  lens: {
    teaching: ["jiashi", "ben", "francesca"],
    scholars: [
      "ajax",
      "anthony",
      "carlos",
      "connor",
      "devin",
      "emily",
      "hannah",
      "nghi",
      "niekelle",
      "tayo",
      "reece",
      "shawn",
      "steven",
      "vahan",
    ],
  },
  engineering: {
    teaching: ["alexis", "edward", "ricardo"],
    scholars: [
      "abigail",
      "alexander",
      "alex",
      "kritika",
      "shawn",
      "viola",
      "keziah",
      "ryan",
      "sabrina",
      "vaughn",
      "jade",
      "jackie",
      "jae",
      "jair",
      "melissa",
    ],
  },
};

const cohortOptions = Object.keys(cohortData);

export default function App() {
  const [messages, setMessages] = useState([]);
  const [gameState, setGameState] = useState(-1);
  const [selectedCohort, setSelectedCohort] = useState("");
  const [score, setScore] = useState(0);
  const [guessedNames, setGuessedNames] = useState([]);
  const [timeLeft, setTimeLeft] = useState(120);
  const timerRef = useRef(null);

  const addNewMessage = (newMessages) => {
    setMessages((previousMessages) => GiftedChat.append(previousMessages, newMessages));
  };

  const addBotMessage = (text) => {
    addNewMessage([
      {
        _id: Math.round(Math.random() * 1000000),
        text,
        createdAt: new Date(),
        user: CHATBOT_USER_OBJ,
      },
    ]);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const getCohortNames = (cohortName) => {
    const cohort = cohortData[cohortName];
    if (!cohort) return [];
    return [...cohort.teaching, ...cohort.scholars].map((name) => name.trim().toLowerCase());
  };

  const getCohortNameCount = (cohortName) => getCohortNames(cohortName).length;

  const getFinalFeedback = (currentScore, totalNames) => {
    if (currentScore === 18 && totalNames === 18) {
      return "Good job! You're a superstar and know everyone's names!";
    }

    if (currentScore >= 10 && currentScore <= 17) {
      return "Amazing! You're almost there. Try getting to know everyone better!";
    }

    return "You'll do better next time! Try speaking to everyone and collaborate with someone you haven't yet.";
  };

  const finishRound = (finalScore, totalNames, reason = "time") => {
    clearInterval(timerRef.current);
    setGameState(-1);

    const feedback = getFinalFeedback(finalScore, totalNames);
    const headline = reason === "complete" ? "🎉 Round complete!" : "⏰ Time's up!";

    addBotMessage(
      `${headline} You scored ${finalScore} out of ${totalNames} names for ${selectedCohort}. ${feedback} Say a cohort name to play again.`
    );
  };

  const startTimer = () => {
    clearInterval(timerRef.current);
    setTimeLeft(120);

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

  useEffect(() => {
    if (messages.length < 1) {
      addBotMessage(
        "Welcome! Choose a cohort: design, lens, engineering, or storytelling. You have 2 minutes to list as many names as you can, including the teaching team."
      );
    }

    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (timeLeft === 0 && gameState === 0) {
      const totalNames = getCohortNameCount(selectedCohort);
      finishRound(score, totalNames, "time");
    }
  }, [timeLeft, gameState, score, selectedCohort]);

  const respondToUser = (userMessages) => {
    const userText = userMessages[0].text.trim().toLowerCase();

    if (gameState === -1) {
      if (cohortOptions.includes(userText)) {
        setMessages([]);
        setSelectedCohort(userText);
        setScore(0);
        setGuessedNames([]);
        setGameState(0);
        startTimer();
        addBotMessage(
          `Let's go! You chose ${userText}. List as many names as you can from ${userText}, including the teaching team. Type names one by one or separate them with commas. You have 2 minutes!`
        );
      } else if (userText === "yes" || userText === "start") {
        addBotMessage("Choose a cohort: design, lens, engineering, or storytelling.");
      } else {
        addBotMessage("Choose a cohort to begin: design, lens, engineering, or storytelling.");
      }
      return;
    }

    if (gameState === 0) {
      if (timeLeft <= 0) return;

      const cohortNames = getCohortNames(selectedCohort);
      const guessedWords = userText
        .split(/[^a-z]+/)
        .filter(Boolean);
      const newMatches = guessedWords.filter(
        (word) => cohortNames.includes(word) && !guessedNames.includes(word)
      );

      if (newMatches.length > 0) {
        const updatedGuessedNames = [...new Set([...guessedNames, ...newMatches])];
        setGuessedNames(updatedGuessedNames);
        const newScore = updatedGuessedNames.length;
        setScore(newScore);

        if (newScore >= cohortNames.length) {
          finishRound(newScore, cohortNames.length, "complete");
          return;
        }

        const displayNames = newMatches
          .map((name) => name.charAt(0).toUpperCase() + name.slice(1))
          .join(", ");
        addBotMessage(
          `✅ Nice! You found ${displayNames}. Current score: ${newScore}/${cohortNames.length}.`
        );
      } else {
        addBotMessage(`⚠️ No new names matched ${selectedCohort}. Keep going!`);
      }
    }
  };

  const onSend = useCallback((newMessages = []) => {
    addNewMessage(newMessages);
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        {gameState === 0 && (
          <View
            style={{
              padding: 15,
              backgroundColor: "#f0f0f0",
              alignItems: "center",
              borderBottomWidth: 1,
              borderColor: "#ddd",
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 4 }}>
              Cohort: {selectedCohort.charAt(0).toUpperCase() + selectedCohort.slice(1)}
            </Text>
            <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 4 }}>
              Score: {score}/{getCohortNameCount(selectedCohort)}
            </Text>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: timeLeft <= 15 ? "red" : "black",
              }}
            >
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