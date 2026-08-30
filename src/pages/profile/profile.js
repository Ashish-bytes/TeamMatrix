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
   STATS
   ========================= */

const getStats = (roadmaps, quizStats) => {
  const stats = {
    progress: {},
  };

  for (let topic in quizStats) {
    let total = 0;
    let completed = 0;

    if (!roadmaps[topic]) continue;

    Object.keys(roadmaps[topic]).forEach((week, i) => {
      roadmaps[topic][week].subtopics.forEach(
        (subtopic, j) => {
          const time = parseInt(
            subtopic.time.replace(/^\D+/g, "")
          );

          total += time;

          if (
            quizStats[topic] &&
            quizStats[topic][i + 1] &&
            quizStats[topic][i + 1][j + 1]
          ) {
            completed += time;
          }
        }
      );
    });

    stats.progress[topic] = {
      total,
      completed,
    };
  }

  return stats;
};


/* =========================
   START LEARNING
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
   PROFILE PAGE
   ========================= */

const ProfilePage = () => {

  const topics =
    JSON.parse(localStorage.getItem("topics")) || {};

  const [stats, setStats] = useState({});

  const [percentCompletedData, setPercentCompletedData] =
    useState({});


  useEffect(() => {
    const roadmaps =
      JSON.parse(localStorage.getItem("roadmaps")) || {};

    const quizStats =
      JSON.parse(localStorage.getItem("quizStats")) || {};

    setStats(
      getStats(
        roadmaps,
        quizStats
      )
    );
  }, []);


  /* =========================
     PROGRESS DATA
     ========================= */

  useEffect(() => {

    const progress = stats.progress || {};

    const labels = Object.keys(progress);

    const data = Object.values(progress).map(
      (item) => {
        if (!item.total) return 0;

        return Math.round(
          (item.completed * 100) /
          item.total
        );
      }
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


  const courseCount =
    Object.keys(topics).length;


  const hardnessIndex = (
    parseFloat(
      localStorage.getItem("hardnessIndex")
    ) || 1
  ).toFixed(3);


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
              Your intelligent learning workspace
              for discovering skills, building
              knowledge, and learning at your own pace.
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

              <span>
                LEARNING PATHS
              </span>

              <strong>
                {courseCount}
              </strong>

              <small>
                Active paths
              </small>

            </div>

          </div>


          <div className="stat_card gold">

            <div className="stat_icon">
              <Target size={30} />
            </div>

            <div className="stat_content">

              <span>
                ADAPTIVE LEVEL
              </span>

              <strong>
                {hardnessIndex}
              </strong>

              <small>
                Personalized difficulty
              </small>

            </div>

          </div>


          <div className="stat_card teal">

            <div className="stat_icon">
              <Bot size={30} />
            </div>

            <div className="stat_content">

              <span>
                AI LEARNING
              </span>

              <strong>
                Personalized
              </strong>

              <small>
                Smart learning for you
              </small>

            </div>

          </div>


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
                  (course, i) => (

                    <NavLink
                      key={course}
                      className="course_link"
                      to={
                        "/roadmap?topic=" +
                        encodeURI(course)
                      }
                    >

                      <div
                        className="course_row"
                        style={{
                          "--course-color":
                            i % 2 === 0
                              ? "#ff6b4a"
                              : "#ffc857",
                        }}
                      >

                        <div className="course_number">
                          0{i + 1}
                        </div>


                        <div className="course_info">

                          <h3>
                            {course}
                          </h3>

                          <div className="course_meta">

                            <span>
                              {topics[course].time}
                            </span>

                            <span>
                              {topics[course].knowledge_level}
                            </span>

                          </div>


                          <div className="mini_progress">

                            <div
                              className="mini_progress_fill"
                              style={{
                                width: "32%",
                              }}
                            />

                          </div>

                        </div>


                        <div className="course_arrow">

                          <ArrowRight
                            size={26}
                          />

                        </div>

                      </div>

                    </NavLink>

                  )
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


              {/* ADD NEW PATH */}

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

              {Object.keys(
                percentCompletedData
              ).length > 0 ? (

                <Bar
                  data={
                    percentCompletedData
                  }

                  options={{
                    maintainAspectRatio: false,

                    indexAxis: "y",

                    plugins: {
                      legend: {
                        display: false,
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
                  <BarChart3Fallback />
                  <p>
                    Start learning to see
                    your progress here.
                  </p>
                </div>

              )}

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


/* Small fallback icon */

const BarChart3Fallback = () => (
  <TrendingUp
    size={45}
    strokeWidth={1.5}
  />
);


export default ProfilePage;