import React, { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { uploadToDropbox } from "./dropboxUtils";

function InstructionsWithDropbox() {
  const { sessionId, role } = useParams();
  const navigate = useNavigate();
  const mediaRecorderRef = useRef(null);
  const recordedChunks = useRef([]);
  const [recordingStarted, setRecordingStarted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");

  const startRecording = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false, 
      });
  
      // Create a MediaRecorder for the screen stream (no audio)
      mediaRecorderRef.current = new MediaRecorder(screenStream, {
        mimeType: "video/webm; codecs=vp8",
      });
  
      // Handle recorded data
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunks.current.push(e.data);
        }
      };
  
      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(recordedChunks.current, { type: "video/webm" });
        
        // Create download link for local backup
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${sessionId}_${role}.webm`;
        a.click();
        
        // Upload to Dropbox
        try {
          setUploading(true);
          setUploadStatus("Uploading to Dropbox...");
          
          const file = new File([blob], `${sessionId}_${role}.webm`, { type: "video/webm" });
          await uploadToDropbox(file);
          
          setUploadStatus("✅ Successfully uploaded to Dropbox!");
        } catch (error) {
          console.error("Dropbox upload error:", error);
          setUploadStatus("❌ Failed to upload to Dropbox. File saved locally.");
        } finally {
          setUploading(false);
        }
      };
  
      mediaRecorderRef.current.start();
      setRecordingStarted(true);
  
      screenStream.getVideoTracks()[0].addEventListener("ended", () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
          mediaRecorderRef.current.stop();
        }
      });
    } catch (err) {
      console.error("Screen recording error:", err);
      alert(
        "Please allow screen recording permission to continue."
      );
    }
  };  

  const handleStartGame = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      navigate(`/${role}/${sessionId}`);
    } else {
      alert("Please start screen recording before continuing.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Instructions</h2>
        <p style={styles.text}>
          This study will take at most 1 hour in total. In this study, you will work collaboratively with a partner to find
          a path through a series of mazes. More instructions will be given later.
        </p>

        {!recordingStarted ? (
          <p style={{ ...styles.text, ...styles.highlight }}>
            Your screen will be recorded during the session. <br/><br/>
            In a moment, please press the blue button below that says "<strong>Start Screen Recording.</strong>" 
            On the next screen, you will see an option to share your tab, your window, or entire screen.
            Please select your "Window" then "Maze Task" to record your <strong>current window</strong>.
          </p>
        ) : (
          <p style={{ ...styles.text, ...styles.highlight }}>
            Great! Your screen is now recording. Now, press the <strong>"Start Game"</strong> button and begin the task.
          </p>
        )}

        {uploadStatus && (
          <p style={{ ...styles.text, ...styles.uploadStatus }}>
            {uploadStatus}
          </p>
        )}

        <p style={styles.text}>
          If you have any issues or have any questions, please feel free to ask the researcher.
        </p>

        {!recordingStarted ? (
          <button onClick={startRecording} style={styles.button}>
            Start Screen Recording
          </button>
        ) : (
          <button onClick={handleStartGame} style={styles.button} disabled={uploading}>
            {uploading ? "Uploading..." : "Start Game"}
          </button>
        )}
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
    alignItems: "flex-start",
    backgroundColor: "#ffffff",
    padding: "40px 30px",
    borderRadius: "12px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
    minWidth: "300px",
    width: "100%",
    maxWidth: "500px",
  },
  title: {
    marginBottom: "20px",
    fontSize: "20px",
    fontWeight: "bold",
    textAlign: "left",
    width: "100%",
  },
  text: {
    marginBottom: "15px",
    fontSize: "16px",
    lineHeight: 1.6,
    textAlign: "left",
  },
  highlight: {
    backgroundColor: "#fff9c4", // light yellow highlight
    borderLeft: "4px solid #ffeb3b",
    padding: "10px 15px",
    borderRadius: "6px",
  },
  uploadStatus: {
    backgroundColor: "#e8f5e8", // light green background
    borderLeft: "4px solid #4caf50",
    padding: "10px 15px",
    borderRadius: "6px",
    fontWeight: "bold",
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
    marginTop: "20px",
  },
};

export default InstructionsWithDropbox;
