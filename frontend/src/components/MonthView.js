import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axios";

function MonthView() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axiosInstance.get("/api/tasks");
        console.log("API Response:", response.data);
        setTasks(response.data.tasks || []);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();
  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const renderDays = () => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="day empty"></div>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day
      );
      const dayTasks = tasks.filter(
        (task) => new Date(task.dueDate).toDateString() === date.toDateString()
      );
      days.push(
        <div key={day} className="day">
          <div>{day}</div>
          {dayTasks.map((task) => (
            <div key={task._id}>
              <p>{task.title}</p>
            </div>
          ))}
        </div>
      );
    }
    return days;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="month-view">
      <h2>
        {currentMonth.toLocaleString("default", { month: "long" })}{" "}
        {currentMonth.getFullYear()}
      </h2>
      <div className="calendar">{renderDays()}</div>
    </div>
  );
}

export default MonthView;
