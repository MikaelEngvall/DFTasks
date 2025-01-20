import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
  });
  const [newTask, setNewTask] = useState({
    title: "",
    instructions: "",
    assignees: [],
    dueDate: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const [usersResponse, tasksResponse] = await Promise.all([
        axios.get("/api/users/all", config),
        axios.get("/api/tasks", config),
      ]);

      setUsers(usersResponse.data);
      setTasks(tasksResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post("/api/users/register", newUser, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewUser({ name: "", email: "", password: "", role: "employee" });
      fetchData();
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post("/api/tasks", newTask, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewTask({
        title: "",
        instructions: "",
        assignees: [],
        dueDate: "",
      });
      fetchData();
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* Skapa ny användare */}
      <div className="mb-8 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-4">Skapa ny användare</h2>
        <form onSubmit={handleCreateUser} className="space-y-4">
          <input
            type="text"
            placeholder="Namn"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            className="w-full p-2 border rounded"
          />
          <input
            type="email"
            placeholder="Email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            className="w-full p-2 border rounded"
          />
          <input
            type="password"
            placeholder="Lösenord"
            value={newUser.password}
            onChange={(e) =>
              setNewUser({ ...newUser, password: e.target.value })
            }
            className="w-full p-2 border rounded"
          />
          <select
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            className="w-full p-2 border rounded"
          >
            <option value="employee">Anställd</option>
            <option value="admin">Admin</option>
          </select>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Skapa användare
          </button>
        </form>
      </div>

      {/* Skapa ny uppgift */}
      <div className="mb-8 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-4">Skapa ny uppgift</h2>
        <form onSubmit={handleCreateTask} className="space-y-4">
          <input
            type="text"
            placeholder="Titel"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            className="w-full p-2 border rounded"
          />
          <textarea
            placeholder="Instruktioner"
            value={newTask.instructions}
            onChange={(e) =>
              setNewTask({ ...newTask, instructions: e.target.value })
            }
            className="w-full p-2 border rounded"
          />
          <select
            multiple
            value={newTask.assignees}
            onChange={(e) =>
              setNewTask({
                ...newTask,
                assignees: Array.from(
                  e.target.selectedOptions,
                  (option) => option.value
                ),
              })
            }
            className="w-full p-2 border rounded"
          >
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={newTask.dueDate}
            onChange={(e) =>
              setNewTask({ ...newTask, dueDate: e.target.value })
            }
            className="w-full p-2 border rounded"
          />
          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Skapa uppgift
          </button>
        </form>
      </div>

      {/* Lista användare */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Användare</h2>
        <div className="grid gap-4">
          {users.map((user) => (
            <div key={user._id} className="p-4 border rounded">
              <p>
                <strong>Namn:</strong> {user.name}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>Roll:</strong> {user.role}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Lista uppgifter */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Uppgifter</h2>
        <div className="grid gap-4">
          {tasks.map((task) => (
            <div key={task._id} className="p-4 border rounded">
              <p>
                <strong>Titel:</strong> {task.title}
              </p>
              <p>
                <strong>Status:</strong> {task.status}
              </p>
              <p>
                <strong>Förfallodatum:</strong>{" "}
                {new Date(task.dueDate).toLocaleDateString()}
              </p>
              <p>
                <strong>Tilldelade:</strong>
              </p>
              <ul className="list-disc ml-4">
                {task.assignees.map((assignee) => (
                  <li key={assignee._id}>{assignee.name}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
