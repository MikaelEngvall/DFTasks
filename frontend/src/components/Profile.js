import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "../utils/api";

const Profile = () => {
  const { user, setUser } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPreferredLanguage(user.preferredLanguage || "en");
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await updateProfile({
        name,
        email,
        preferredLanguage,
      });

      if (response.status) {
        setUser(response.user);
        setMessage("Profil uppdaterad!");
      }
    } catch (error) {
      setMessage("Något gick fel vid uppdatering av profilen.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Min Profil</h2>
      {message && (
        <div className="mb-4 p-2 bg-blue-100 text-blue-700 rounded">
          {message}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Namn
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Föredraget språk
          </label>
          <select
            value={preferredLanguage}
            onChange={(e) => setPreferredLanguage(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="sv">Svenska</option>
            <option value="pl">Polski</option>
            <option value="uk">Українська</option>
            <option value="en">English</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Uppdatera profil
        </button>
      </form>
    </div>
  );
};

export default Profile;
