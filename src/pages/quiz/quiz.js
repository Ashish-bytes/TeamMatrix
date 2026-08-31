import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

import "./quiz.css";
import Header from "../../components/header/header";
import Loader from "../../components/loader/loader";

import { CircleCheck, CircleX } from "lucide-react";

/* =========================
   QUESTION
   ========================= */

const Question = ({ questionData, num, style }) => {
  const [attempted, setAttempted] = useState(false);

  return (
    <div className="question" style={style}>
      <h3>
        <span style={{ marginRight: "1ch" }}>
          {num}.
        </span>

        {questionData.question}
      </h3>

      <div className="flexbox options">
        {questionData.options.map((option, index) => {
          const isCorrect =
            index === questionData.answerIndex;

          return (
            <div
              className="option"
              key={index}
            >
              <input
                type="radio"
                name={"ques" + num}
                id={
                  "ques" +
                  num +
                  "index" +
                  index
                }
                className={
                  (isCorrect
                    ? "correct"
                    : "wrong") +
                  " " +
                  (attempted
                    ? "attempted"
                    : "")
                }
                onClick={(e) => {
                  if (attempted) {
                    e.preventDefault();
                    return;
                  }

                  if (
                    window.numAttmpt ===
                    window.numQues - 1
                  ) {
                    window.timeTaken =
                      new Date().getTime() -
                      window.startTime;
                  }

                  if (isCorrect) {
                    window.numCorrect++;
                  }

                  window.numAttmpt++;

                  setAttempted(true);
                }}
              />

              <label
                htmlFor={
                  "ques" +
                  num +
                  "index" +
                  index
                }
              >
                {option}
              </label>

              {isCorrect ? (
                <CircleCheck
                  className="optionIcon"
                  size={35}
                  strokeWidth={1}
                  color="#00FFE0"
                />
              ) : (
                <CircleX
                  className="optionIcon"
                  size={35}
                  strokeWidth={1}
                  color="#FF3D00"
                />
              )}
            </div>
          );
        })}

        <div
          className="reason"
          style={{
            display: attempted
              ? "block"
              : "none",
          }}
        >
          {questionData.reason}
        </div>
      </div>
    </div>
  );
};

/* =========================
   LEARNING ACTIVITY
   ========================= */

const recordLearningActivity = () => {
  try {
    const activity =
      JSON.parse(
        localStorage.getItem(
          "learningActivity"
        )
      ) || [];

    const today =
      new Date()
        .toISOString()
        .split("T")[0];

    if (!activity.includes(today)) {
      activity.push(today);
    }

    localStorage.setItem(
      "learningActivity",
      JSON.stringify(activity)
    );
  } catch (error) {
    console.error(
      "Could not save learning activity:",
      error
    );
  }
};

/* =========================
   QUIZ PAGE
   ========================= */

const QuizPage = () => {
  const [searchParams] =
    useSearchParams();

  const [subtopic, setSubtopic] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [topic, setTopic] =
    useState("");

  const [questions, setQuestions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const navigate =
    useNavigate();

  const course =
    searchParams.get("topic");

  const weekNum =
    searchParams.get("week");

  const subtopicNum =
    searchParams.get("subtopic");

  /* =========================
     VALIDATE URL
     ========================= */

  useEffect(() => {
    if (
      !course ||
      !weekNum ||
      !subtopicNum
    ) {
      navigate("/");
    }
  }, [
    course,
    weekNum,
    subtopicNum,
    navigate,
  ]);

  /* =========================
     LOAD ROADMAP DATA
     ========================= */

  useEffect(() => {
    if (
      !course ||
      !weekNum ||
      !subtopicNum
    ) {
      return;
    }

    const topics =
      JSON.parse(
        localStorage.getItem(
          "topics"
        )
      ) || {};

    const roadmaps =
      JSON.parse(
        localStorage.getItem(
          "roadmaps"
        )
      ) || {};

    if (
      !Object.keys(
        roadmaps
      ).includes(course) ||
      !Object.keys(
        topics
      ).includes(course)
    ) {
      navigate("/");
      return;
    }

    const roadmap =
      roadmaps[course];

    const weeks =
      Object.keys(
        roadmap
      );

    const week =
      weeks[Number(weekNum) - 1];

    if (!week) {
      navigate("/");
      return;
    }

    const selectedSubtopic =
      roadmap[week]?.subtopics?.[
        Number(subtopicNum) - 1
      ];

    if (!selectedSubtopic) {
      navigate("/");
      return;
    }

    setTopic(
      roadmap[week].topic
    );

    setSubtopic(
      selectedSubtopic.subtopic
    );

    setDescription(
      selectedSubtopic.description
    );
  }, [
    course,
    weekNum,
    subtopicNum,
    navigate,
  ]);

  /* =========================
     LOAD / GENERATE QUIZ
     ========================= */

  useEffect(() => {
    if (
      !course ||
      !topic ||
      !subtopic ||
      !description ||
      !weekNum ||
      !subtopicNum
    ) {
      return;
    }

    const quizzes =
      JSON.parse(
        localStorage.getItem(
          "quizzes"
        )
      ) || {};

    const existingQuestions =
      quizzes?.[course]?.[
        weekNum
      ]?.[subtopicNum];

    if (
      existingQuestions &&
      existingQuestions.length > 0
    ) {
      setQuestions(
        existingQuestions
      );

      window.numQues =
        existingQuestions.length;

      window.startTime =
        new Date().getTime();

      window.numAttmpt = 0;
      window.numCorrect = 0;
      window.timeTaken = null;

      setLoading(false);

      return;
    }

    /* =========================
       FETCH QUIZ FROM BACKEND
       ========================= */

    axios.defaults.baseURL =
      "https://teammatrix-backend.onrender.com";

    axios({
      method: "POST",
      url: "/api/quiz",
      withCredentials: false,
      headers: {
        "Content-Type":
          "application/json",
      },
      data: {
        course,
        topic,
        subtopic,
        description,
      },
    })
      .then((res) => {
        const generatedQuestions =
          res.data?.questions || [];

        setQuestions(
          generatedQuestions
        );

        quizzes[course] =
          quizzes[course] || {};

        quizzes[course][weekNum] =
          quizzes[course][weekNum] || {};

        quizzes[course][weekNum][
          subtopicNum
        ] = generatedQuestions;

        localStorage.setItem(
          "quizzes",
          JSON.stringify(quizzes)
        );

        window.numQues =
          generatedQuestions.length;

        window.startTime =
          new Date().getTime();

        window.numAttmpt = 0;
        window.numCorrect = 0;
        window.timeTaken = null;

        setLoading(false);
      })
      .catch((error) => {
        console.error(
          "Quiz generation failed:",
          error
        );

        setLoading(false);

        alert(
          "An error occurred while fetching the quiz. Please try again later."
        );
      });
  }, [
    course,
    topic,
    subtopic,
    description,
    weekNum,
    subtopicNum,
  ]);

  /* =========================
     SUBMIT QUIZ
     ========================= */

  const SubmitButton = () => {
    const handleSubmit = () => {
      if (
        !window.numQues ||
        window.numQues <= 0
      ) {
        alert(
          "No quiz questions are available."
        );
        return;
      }

      if (
        window.numAttmpt <
        window.numQues
      ) {
        alert(
          "Please answer all questions before submitting."
        );
        return;
      }

      if (!window.timeTaken) {
        window.timeTaken =
          new Date().getTime() -
          window.startTime;
      }

      const quizStats =
        JSON.parse(
          localStorage.getItem(
            "quizStats"
          )
        ) || {};

      quizStats[course] =
        quizStats[course] || {};

      quizStats[course][weekNum] =
        quizStats[course][weekNum] ||
        {};

      quizStats[course][weekNum][
        subtopicNum
      ] = {
        numCorrect:
          window.numCorrect,

        numQues:
          window.numQues,

        timeTaken:
          window.timeTaken,
      };

      /* =========================
         HARDNESS INDEX
         ========================= */

      let hardnessIndex =
        parseFloat(
          localStorage.getItem(
            "hardnessIndex"
          )
        ) || 1;

      hardnessIndex =
        hardnessIndex +
        (
          (window.numQues -
            window.numCorrect) /
          (window.numQues * 2)
        ) *
          (
            window.timeTaken /
            (
              5 *
              60 *
              1000 *
              window.numQues
            )
          );

      localStorage.setItem(
        "hardnessIndex",
        hardnessIndex.toString()
      );

      /* =========================
         SAVE QUIZ STATS
         ========================= */

      localStorage.setItem(
        "quizStats",
        JSON.stringify(
          quizStats
        )
      );

      /* =========================
         SAVE LEARNING ACTIVITY
         ========================= */

      recordLearningActivity();

      /* =========================
         RETURN TO ROADMAP
         ========================= */

      navigate(
        "/roadmap?topic=" +
          encodeURIComponent(
            course
          )
      );
    };

    return (
      <div className="submit">
        <button
          className="SubmitButton"
          onClick={handleSubmit}
        >
          Submit
        </button>
      </div>
    );
  };

  /* =========================
     RENDER
     ========================= */

  return (
    <div className="quiz_wrapper">
      <Header />

      <Loader
        style={{
          display: loading
            ? "block"
            : "none",
        }}
      >
        Generating Personalized
        Questions for You ...
      </Loader>

      <div className="content">
        <h1>{subtopic}</h1>

        <h3
          style={{
            opacity: "0.61",
            fontWeight: "300",
            marginBottom: "2em",
          }}
        >
          {description}
        </h3>

        {questions.map(
          (question, index) => (
            <Question
              key={index}
              questionData={
                question
              }
              num={index + 1}
            />
          )
        )}

        {questions.length > 0 && (
          <SubmitButton />
        )}
      </div>
    </div>
  );
};

export default QuizPage;