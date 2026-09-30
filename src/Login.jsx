import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (username && role) {
      navigate(`/instructions/${username}/${role}`);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Welcome to the Maze Game!</h2>

        <input
          type="text"
          placeholder="Enter your session ID"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.input}
        />

        <div style={styles.radioGroup}>
          <label style={styles.radioLabel}>
            <input
              type="radio"
              value="participant1"
              checked={role === "participant1"}
              onChange={() => setRole("participant1")}
              style={styles.radioInput}
            />
            Participant 1
          </label>
          <label style={styles.radioLabel}>
            <input
              type="radio"
              value="participant2"
              checked={role === "participant2"}
              onChange={() => setRole("participant2")}
              style={styles.radioInput}
            />
            Participant 2
          </label>
        </div>

        <button onClick={handleSubmit} style={styles.button}>
          Continue
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f2f5",
    margin: 0,
    padding: 0,
    boxSizing: "border-box",
    width: "100vw",
  },
  card: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: "40px 30px",
    borderRadius: "12px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
    minWidth: "300px",
    width: "100%",
    maxWidth: "400px",
  },
  title: {
    marginBottom: "20px",
    fontSize: "20px",
    fontWeight: "bold",
  },
  input: {
    padding: "12px",
    marginBottom: "20px",
    width: "100%",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "16px",
  },
  radioGroup: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    width: "100%",
    gap: "10px",
    marginBottom: "20px",
  },
  radioLabel: {
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  button: {
    padding: "10px 20px",
    fontSize: "16px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#007bff",
    color: "white",
    cursor: "pointer",
    width: "100%",
  },
};

export default Login;
