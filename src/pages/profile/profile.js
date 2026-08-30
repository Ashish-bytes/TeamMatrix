import { useEffect, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import "./profile.css";
import Header from "../../components/header/header";

import {
  ArrowRight,
  Plus,
  BookOpen,
  Target,
  Bot,
  TrendingUp,
  Flame,
  Clock3,
  Brain,
  Play,
  Trophy,
} from "lucide-react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

/* =========================
   HELPERS
   ========================= */

const safeParse = (key, fallback = {}) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.error(`Could not read localStorage key: ${key}`, error);
    return fallback;
  }
};

const getQuizScore = (quiz) => {
  if (!quiz || !quiz.numQues) return null;

  return Math.round((quiz.numCorrect / quiz.numQues) * 100);
};

const getCourseStats = (roadmap, courseQuizStats = {}) => {
  let totalSubtopics = 0;
  let completedSubtopics = 0;
  let totalQuizScore = 0;
  let quizCount = 0;
  let totalStudyTime = 0;

  if (!roadmap || typeof roadmap !== "object") {
    return {
      totalSubtopics: 0,
      completedSubtopics: 0,
      progress: 0,
      averageScore: 0,
      totalStudyTime: 0,
    };
  }

  const sortedWeeks = Object.keys(roadmap).sort(
    (a, b) => parseInt(a.split(" ")[1]) - parseInt(b.split(" ")[1])
  );

  sortedWeeks.forEach((week, weekIndex) => {
    const subtopics = roadmap[week]?.subtopics || [];

    subtopics.forEach((subtopic, subtopicIndex) => {
      totalSubtopics++;

      const quiz =
        courseQuizStats?.[weekIndex + 1]?.[subtopicIndex + 1];

      if (quiz) {
        completedSubtopics++;

        const score = getQuizScore(quiz);

        if (score !== null) {
          totalQuizScore += score;
          quizCount++;
        }

        if (quiz.timeTaken) {
          totalStudyTime += quiz.timeTaken;
        }
      }
    });
  });

  return {
    totalSubtopics,
    completedSubtopics,
    progress:
      totalSubtopics > 0
        ? Math.round((completedSubtopics / totalSubtopics) * 100)
        : 0,
    averageScore:
      quizCount > 0 ? Math.round(totalQuizScore / quizCount) : 0,
    totalStudyTime,
  };
};

/* =========================
   ALL DASHBOARD STATS
   ========================= */

const calculateDashboardStats = (topics, roadmaps, quizStats) => {
  const courses = Object.keys(topics);

  let totalSubtopics = 0;
  let completedSubtopics = 0;
  let totalQuizScore = 0;
  let quizCount = 0;
  let totalStudyTime = 0;

  const courseStats = {};

  courses.forEach((course) => {
    const stats = getCourseStats(
      roadmaps[course],
      quizStats[course]
    );

    courseStats[course] = stats;

    totalSubtopics += stats.totalSubtopics;
    completedSubtopics += stats.completedSubtopics;

    if (stats.averageScore > 0) {
      const courseQuizCount = Object.values(
        quizStats[course] || {}
      ).reduce((count, weekData) => {
        return (
          count +
          Object.values(weekData || {}).filter(
            (quiz) => quiz && quiz.numQues
          ).length
        );
      }, 0);

      totalQuizScore += stats.averageScore * courseQuizCount;
      quizCount += courseQuizCount;
    }

    totalStudyTime += stats.totalStudyTime;
  });

  return {
    courseStats,
    totalSubtopics,
    completedSubtopics,
    overallProgress:
      totalSubtopics > 0
        ? Math.round((completedSubtopics / totalSubtopics) * 100)
        : 0,
    averageQuizScore:
      quizCount > 0
        ? Math.round(totalQuizScore / quizCount)
        : 0,
    totalStudyTime,
  };
};

/* =========================
   CONTINUE LEARNING
   ========================= */

const findNextLearningItem = (topics, roadmaps, quizStats) => {
  const courses = Object.keys(topics);

  for (const course of courses) {
    const roadmap = roadmaps[course];
    const courseQuizStats = quizStats[course] || {};

    if (!roadmap) continue;

    const sortedWeeks = Object.keys(roadmap).sort(
      (a, b) => parseInt(a.split(" ")[1]) - parseInt(b.split(" ")[1])
    );

    for (let weekIndex = 0; weekIndex < sortedWeeks.length; weekIndex++) {
      const week = sortedWeeks[weekIndex];
      const subtopics = roadmap[week]?.subtopics || [];

      for (
        let subtopicIndex = 0;
        subtopicIndex < subtopics.length;
        subtopicIndex++
      ) {
        const quiz =
          courseQuizStats?.[weekIndex + 1]?.[subtopicIndex + 1];

        if (!quiz) {
          return {
            course,
            week: weekIndex + 1,
            subtopic: subtopicIndex + 1,
            title: subtopics[subtopicIndex]?.subtopic || "Next Topic",
            description:
              subtopics[subtopicIndex]?.description ||
              "Continue your personalized learning path.",
            progress: getCourseStats(
              roadmap,
              courseQuizStats
            ).progress,
          };
        }
      }
    }
  }

  return null;
};

/* =========================
   STREAK
   ========================= */

const calculateStreak = () => {
  const activity = safeParse("learningActivity", []);

  if (!Array.isArray(activity) || activity.length === 0) {
    return 0;
  }

  const uniqueDates = [
    ...new Set(
      activity
        .map((date) => {
          if (!date) return null;

          const parsed = new Date(date);

          if (Number.isNaN(parsed.getTime())) {
            return null;
          }

          return parsed.toISOString().split("T")[0];
        })
        .filter(Boolean)
    ),
  ].sort((a, b) => new Date(b) - new Date(a));

  if (uniqueDates.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const latestDate = new Date(uniqueDates[0]);
  latestDate.setHours(0, 0, 0, 0);

  const daysSinceLatest =
    Math.round(
      (today.getTime() - latestDate.getTime()) /
        (1000 * 60 * 60 * 24)
    );

  if (daysSinceLatest > 1) {
    return 0;
  }

  let streak = 1;

  for (let i = 1; i < uniqueDates.length; i++) {
    const current = new Date(uniqueDates[i - 1]);
    const previous = new Date(uniqueDates[i]);

    current.setHours(0, 0, 0, 0);
    previous.setHours(0, 0, 0, 0);

    const difference =
      Math.round(
        (current.getTime() - previous.getTime()) /
          (1000 * 60 * 60 * 24)
      );

    if (difference === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};

/* =========================
   START LEARNING BUTTON
   ========================= */

const TopicButton = ({ children }) => {
  const navigate = useNavigate();

  return (
    <button
      className="SubmitButton"
      onClick={() => navigate("/topic")}
    >
      {children}
    </button>
  );
};

/* =========================
   DASHBOARD
   ========================= */

const ProfilePage = () => {
  const [dashboard, setDashboard] = useState({
    topics: {},
    roadmaps: {},
    quizStats: {},
  });

  const [stats, setStats] = useState({
    courseStats: {},
    totalSubtopics: 0,
    completedSubtopics: 0,
    overallProgress: 0,
    averageQuizScore: 0,
    totalStudyTime: 0,
  });

  const [continueLearning, setContinueLearning] = useState(null);
  const [streak, setStreak] = useState(0);

  const [percentCompletedData, setPercentCompletedData] =
    useState(null);

  const navigate = useNavigate();

  /* =========================
     LOAD DASHBOARD DATA
     ========================= */

  useEffect(() => {
    const topics = safeParse("topics", {});
    const roadmaps = safeParse("roadmaps", {});
    const quizStats = safeParse("quizStats", {});

    setDashboard({
      topics,
      roadmaps,
      quizStats,
    });

    const calculatedStats = calculateDashboardStats(
      topics,
      roadmaps,
      quizStats
    );

    setStats(calculatedStats);

    setContinueLearning(
      findNextLearningItem(
        topics,
        roadmaps,
        quizStats
      )
    );

    setStreak(calculateStreak());
  }, []);

  /* =========================
     CHART
     ========================= */

  useEffect(() => {
    const labels = Object.keys(stats.courseStats);

    if (labels.length === 0) {
      setPercentCompletedData(null);
      return;
    }

    const data = labels.map(
      (course) =>
        stats.courseStats[course]?.progress || 0
    );

    setPercentCompletedData({
      labels,
      datasets: [
        {
          label: "% Completed",
          data,
          backgroundColor: "#ff6b4a",
          borderRadius: 8,
          borderWidth: 0,
        },
      ],
    });
  }, [stats]);

  const topics = dashboard.topics;

  const courseCount = Object.keys(topics).length;

  const studyHours = (
    stats.totalStudyTime /
    (1000 * 60 * 60)
  ).toFixed(1);

  /* =========================
     CONTINUE HANDLER
     ========================= */

  const handleContinueLearning = () => {
    if (!continueLearning) {
      navigate("/topic");
      return;
    }

    navigate(
      `/quiz?topic=${encodeURIComponent(
        continueLearning.course
      )}&week=${continueLearning.week}&subtopic=${continueLearning.subtopic}`
    );
  };

  return (
    <div className="profile_wrapper">
      <Header />

      <main className="dashboard">

        {/* =========================
            HERO
        ========================= */}

        <section className="hero">

          <div className="hero_content">

            <span className="eyebrow">
              TEAM MATRIX • LEARNING HUB
            </span>

            <h1>
              Welcome to{" "}
              <span>Team Matrix.</span>
            </h1>

            <p>
              Your intelligent learning workspace for
              discovering skills, building knowledge,
              and learning at your own pace.
            </p>

            <TopicButton>
              <Plus size={22} />
              Start Learning
            </TopicButton>

          </div>

          <div className="hero_visual">

            <div className="learning_illustration">

              <div className="book_stack">

                <BookOpen
                  size={100}
                  strokeWidth={1}
                />

              </div>

              <div className="floating_icon icon_one">
                <Target size={28} />
              </div>

              <div className="floating_icon icon_two">
                <TrendingUp size={28} />
              </div>

            </div>

          </div>

        </section>

        {/* =========================
            STAT CARDS
        ========================= */}

        <section className="stat_grid">

          <div className="stat_card orange">

            <div className="stat_icon">
              <BookOpen size={30} />
            </div>

            <div className="stat_content">

              <span>ACTIVE COURSES</span>

              <strong>{courseCount}</strong>

              <small>
                Personalized learning paths
              </small>

            </div>

          </div>

          <div className="stat_card gold">

            <div className="stat_icon">
              <Target size={30} />
            </div>

            <div className="stat_content">

              <span>OVERALL PROGRESS</span>

              <strong>
                {stats.overallProgress}%
              </strong>

              <small>
                {stats.completedSubtopics} of{" "}
                {stats.totalSubtopics} topics
              </small>

            </div>

          </div>

          <div className="stat_card teal">

            <div className="stat_icon">
              <Brain size={30} />
            </div>

            <div className="stat_content">

              <span>AVERAGE QUIZ SCORE</span>

              <strong>
                {stats.averageQuizScore > 0
                  ? `${stats.averageQuizScore}%`
                  : "--"}
              </strong>

              <small>
                Based on completed quizzes
              </small>

            </div>

          </div>

          <div className="stat_card purple">

            <div className="stat_icon">
              <Flame size={30} />
            </div>

            <div className="stat_content">

              <span>LEARNING STREAK</span>

              <strong>{streak} days</strong>

              <small>
                Keep building your consistency
              </small>

            </div>

          </div>

        </section>

        {/* =========================
            CONTINUE LEARNING
        ========================= */}

        <section className="continue_section">

          <div className="section_header">

            <div>

              <span className="eyebrow">
                TEAM MATRIX • NEXT STEP
              </span>

              <h2>Continue Learning</h2>

            </div>

          </div>

          {continueLearning ? (

            <div className="continue_card">

              <div className="continue_icon">
                <Play size={28} />
              </div>

              <div className="continue_content">

                <span className="continue_label">
                  PICK UP WHERE YOU LEFT OFF
                </span>

                <h3>
                  {continueLearning.course}
                </h3>

                <h4>
                  {continueLearning.title}
                </h4>

                <p>
                  {continueLearning.description}
                </p>

                <div className="continue_progress">

                  <div className="continue_progress_header">
                    <span>Course progress</span>
                    <strong>
                      {continueLearning.progress}%
                    </strong>
                  </div>

                  <div className="progress_track">
                    <div
                      className="progress_fill"
                      style={{
                        width: `${continueLearning.progress}%`,
                      }}
                    />
                  </div>

                </div>

              </div>

              <button
                className="continue_button"
                onClick={handleContinueLearning}
              >
                Continue
                <ArrowRight size={19} />
              </button>

            </div>

          ) : (

            <div className="continue_card empty_continue">

              <div className="continue_icon">
                <Trophy size={28} />
              </div>

              <div className="continue_content">

                <span className="continue_label">
                  YOU'RE ALL CAUGHT UP
                </span>

                <h3>
                  Start a new learning path
                </h3>

                <p>
                  Explore a new topic and let
                  Team Matrix build your next
                  personalized roadmap.
                </p>

              </div>

              <button
                className="continue_button"
                onClick={() => navigate("/topic")}
              >
                Explore
                <ArrowRight size={19} />
              </button>

            </div>

          )}

        </section>

        {/* =========================
            LOWER DASHBOARD
        ========================= */}

        <section className="dashboard_grid">

          {/* =========================
              LEARNING PATHS
          ========================= */}

          <div className="learning_paths">

            <div className="section_header">

              <div>

                <span className="eyebrow">
                  TEAM MATRIX • LEARNING HUB
                </span>

                <h2>
                  Active Learning Paths
                </h2>

              </div>

              <span className="path_badge">
                {courseCount} active path
                {courseCount !== 1 ? "s" : ""}
              </span>

            </div>

            <div className="course_list">

              {courseCount > 0 ? (

                Object.keys(topics).map(
                  (course, i) => {

                    const courseProgress =
                      stats.courseStats[course]
                        ?.progress || 0;

                    const completed =
                      stats.courseStats[course]
                        ?.completedSubtopics || 0;

                    const total =
                      stats.courseStats[course]
                        ?.totalSubtopics || 0;

                    return (
                      <NavLink
                        key={course}
                        className="course_link"
                        to={
                          "/roadmap?topic=" +
                          encodeURIComponent(course)
                        }
                      >

                        <div
                          className="course_row"
                          style={{
                            "--course-color":
                              i % 3 === 0
                                ? "#ff6b4a"
                                : i % 3 === 1
                                ? "#ffc857"
                                : "#4ed1b1",
                          }}
                        >

                          <div className="course_number">
                            {String(i + 1).padStart(2, "0")}
                          </div>

                          <div className="course_info">

                            <h3>{course}</h3>

                            <div className="course_meta">

                              <span>
                                {topics[course]?.time ||
                                  "Custom path"}
                              </span>

                              <span>
                                {topics[course]
                                  ?.knowledge_level ||
                                  "Personalized"}
                              </span>

                              <span>
                                {completed}/{total} topics
                              </span>

                            </div>

                            <div className="mini_progress">

                              <div
                                className="mini_progress_fill"
                                style={{
                                  width:
                                    `${courseProgress}%`,
                                }}
                              />

                            </div>

                            <div className="course_progress_text">
                              <span>
                                Progress
                              </span>

                              <strong>
                                {courseProgress}%
                              </strong>
                            </div>

                          </div>

                          <div className="course_arrow">

                            <ArrowRight size={26} />

                          </div>

                        </div>

                      </NavLink>
                    );
                  }
                )

              ) : (

                <div className="empty_courses">

                  <BookOpen size={40} />

                  <h3>
                    No learning paths yet
                  </h3>

                  <p>
                    Explore topics and build
                    your first skill.
                  </p>

                  <TopicButton>
                    <Plus size={20} />
                    Start Learning
                  </TopicButton>

                </div>

              )}

              <button
                className="add_path"
                onClick={() =>
                  window.location.href = "/topic"
                }
              >

                <Plus size={26} />

                <span>
                  Explore more topics and
                  build a new skill
                </span>

                <strong>
                  Start Learning →
                </strong>

              </button>

            </div>

          </div>

          {/* =========================
              PROGRESS
          ========================= */}

          <div className="progress_panel">

            <div className="section_header">

              <div>

                <span className="eyebrow">
                  TEAM MATRIX • INSIGHTS
                </span>

                <h2>
                  Learning Progress
                </h2>

              </div>

            </div>

            <div className="chart_box">

              {percentCompletedData ? (

                <Bar
                  data={percentCompletedData}
                  options={{
                    maintainAspectRatio: false,
                    indexAxis: "y",

                    plugins: {
                      legend: {
                        display: false,
                      },

                      tooltip: {
                        callbacks: {
                          label: (context) =>
                            `${context.raw}% complete`,
                        },
                      },
                    },

                    scales: {

                      x: {
                        beginAtZero: true,
                        max: 100,

                        ticks: {
                          color: "#9c928b",

                          callback: (value) =>
                            value + "%",
                        },

                        grid: {
                          color:
                            "rgba(255,255,255,0.07)",
                        },
                      },

                      y: {

                        ticks: {
                          color: "#fff7ed",
                        },

                        grid: {
                          display: false,
                        },
                      },
                    },
                  }}
                />

              ) : (

                <div className="no_progress">

                  <TrendingUp
                    size={45}
                    strokeWidth={1.5}
                  />

                  <p>
                    Start learning to see
                    your progress here.
                  </p>

                </div>

              )}

            </div>

            <div className="insight_grid">

              <div className="insight_card">

                <Clock3 size={21} />

                <div>

                  <strong>
                    {studyHours}h
                  </strong>

                  <span>
                    Quiz time
                  </span>

                </div>

              </div>

              <div className="insight_card">

                <Target size={21} />

                <div>

                  <strong>
                    {stats.completedSubtopics}
                  </strong>

                  <span>
                    Topics completed
                  </span>

                </div>

              </div>

            </div>

            <div className="progress_message">

              <div>
                <TrendingUp size={25} />
              </div>

              <div>

                <strong>
                  Keep going!
                </strong>

                <p>
                  Consistency today,
                  mastery tomorrow.
                </p>

              </div>

            </div>

          </div>

        </section>

      </main>
    </div>
  );
};

export default ProfilePage;