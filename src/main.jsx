import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { Fragment, useCallback, useState, useRef } from 'react';
import { IconTraining, GiverTraining, DrawerTraining } from './training';
import MazeScreen from './maze';
import { participant1Mazes, participant2Mazes } from './mazeconfigs';
import './index.css';
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, useNavigate, useParams } from "react-router-dom";
function MainApp({ participant }) {
  const [activeTab, setActiveTab] = useState('iconTraining');
  const [completedTabs, setCompletedTabs] = useState({});
  const mazes = participant === 1 ? participant1Mazes : participant2Mazes;
  const onComplete = useCallback(() => {
    setCompletedTabs(prev => ({ ...prev, [activeTab]: true }));
  }, [activeTab]);
  const switchingRoles = activeTab === 'set2Training';
  const isGiver = (participant === 1) !== switchingRoles;
  const Training = isGiver ? GiverTraining : DrawerTraining;
  const renderButton = (id, label) => (
    <button key={id} className={activeTab === id ? 'active' : ''} onClick={() => setActiveTab(id)}
      style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {completedTabs[id] && <span style={{ fontSize: '1.1em' }}>✅</span>}{label}
    </button>
  );

  return (
    <div className="main-layout">
      <div className="left-tabs">
        {renderButton('iconTraining', 'Icon Training')}
        {[1, 2].map(set => (
          <Fragment key={set}>
            <div style={{ borderTop: '1px solid #ccc', margin: '20px 0' }} />
            <div style={{ marginBottom: 5, fontWeight: 'bold' }}>Set {set}</div>
            {renderButton(`set${set}Training`, 'Training')}
            {[1, 2, 3].map(round => renderButton(`set${set}Practice${round}`, `Practice ${round}`))}
            {[1, 2].map(round => renderButton(`set${set}Test${round}`, `Test ${round}`))}
          </Fragment>
        ))}
      </div>
      <div className="content-area">
        {activeTab === 'iconTraining' ? <IconTraining participant={participant} onComplete={onComplete} />
          : mazes[activeTab] ? <MazeScreen key={activeTab} config={mazes[activeTab]} onComplete={onComplete} />
            : <Training key={activeTab} switchingRoles={switchingRoles} onComplete={onComplete} />}
      </div>
    </div>
  );
}


const CHUNK_SIZE = 4 * 1024 * 1024;

async function request(action, body, ticket) {
  const response = await fetch(`/api/dropbox/upload?action=${action}`, {
    method: 'POST',
    headers: {
      'Content-Type': action === 'start' ? 'application/json' : 'application/octet-stream',
      ...(ticket ? { 'X-Upload-Ticket': ticket } : {}),
    },
    body,
    cache: 'no-store',
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Recording upload failed.');
  return data;
}

async function uploadToDropbox(file) {
  if (!file.size || file.size > 2 * 1024 * 1024 * 1024) {
    throw new Error('Recording must be between 1 byte and 2 GB.');
  }
  // Normalize session labels; the server still validates the complete filename.
  const name = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_').replace(/^[^a-zA-Z0-9]+/, 'recording_');
  let { ticket } = await request('start', JSON.stringify({ name, size: file.size }));
  for (let offset = 0; offset < file.size; offset += CHUNK_SIZE) {
    ({ ticket } = await request('chunk', file.slice(offset, offset + CHUNK_SIZE), ticket));
  }
  return request('finish', new Blob([]), ticket);
}

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
    <div className="entry-screen">
      <div className="entry-card">
        <h2 className="entry-title">Welcome to the Maze Game!</h2>

        <input
          type="text"
          placeholder="Enter your session ID"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="entry-input"
        />

        <div className="entry-roles">
          <label className="entry-role">
            <input
              type="radio"
              value="participant1"
              checked={role === "participant1"}
              onChange={() => setRole("participant1")}
            />
            Participant 1
          </label>
          <label className="entry-role">
            <input
              type="radio"
              value="participant2"
              checked={role === "participant2"}
              onChange={() => setRole("participant2")}
            />
            Participant 2
          </label>
        </div>

        <button onClick={handleSubmit} className="entry-button">
          Continue
        </button>
      </div>
    </div>
  );
}



function Instructions() {
  const { sessionId, role } = useParams();
  const navigate = useNavigate();
  const mediaRecorderRef = useRef(null);
  const recordedChunks = useRef([]);
  const [recordingStarted, setRecordingStarted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [converting, setConverting] = useState(false);
  const ffmpegRef = useRef(new FFmpeg());

  const convertWebMToMP4 = async (webmBlob) => {
    try {
      const ffmpeg = ffmpegRef.current;
      
      // Load FFmpeg if not already loaded
      if (!ffmpeg.loaded) {
        setUploadStatus("Loading video converter...");
        
        // Use CDN URLs directly
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
        await ffmpeg.load({
          coreURL: `${baseURL}/ffmpeg-core.js`,
          wasmURL: `${baseURL}/ffmpeg-core.wasm`,
        });
      }
      
      setUploadStatus("Converting video to MP4...");
      
      // Write the WebM file to FFmpeg
      await ffmpeg.writeFile('input.webm', await fetchFile(webmBlob));
      
      // Convert WebM to MP4 with simpler settings
      await ffmpeg.exec([
        '-i', 'input.webm',
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-preset', 'ultrafast',
        '-crf', '23',
        'output.mp4'
      ]);
      
      // Read the converted file
      const data = await ffmpeg.readFile('output.mp4');
      
      // Clean up
      await ffmpeg.deleteFile('input.webm');
      await ffmpeg.deleteFile('output.mp4');
      
      return new Blob([data.buffer], { type: 'video/mp4' });
    } catch (error) {
      console.error('Conversion error:', error);
      // Fallback: return the original WebM blob if conversion fails
      console.log('Conversion failed, using original WebM file');
      return webmBlob;
    }
  };

  const startRecording = async () => {
    try {
      // Get screen capture only (no audio)
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false, 
      });
  
      // Use WebM for recording (best browser support)
      let mimeType = "video/webm; codecs=vp9";
      
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "video/webm; codecs=vp8";
      }
      
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "video/webm";
      }
      
      console.log('Recording with WebM:', mimeType);
      
      mediaRecorderRef.current = new MediaRecorder(screenStream, {
        mimeType: mimeType
      });
  
      // Handle recorded data
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunks.current.push(e.data);
        }
      };
  
      mediaRecorderRef.current.onstop = async () => {
        const webmBlob = new Blob(recordedChunks.current, { type: mimeType });
        
        try {
          setUploading(true);
          setConverting(true);
          
          // Convert WebM to MP4
          const convertedBlob = await convertWebMToMP4(webmBlob);
          
          setUploadStatus("Uploading to Dropbox...");
          
          // Determine file type and extension
          const isMP4 = convertedBlob.type === 'video/mp4';
          const fileExtension = isMP4 ? 'mp4' : 'webm';
          const fileName = `${sessionId}_${role}.${fileExtension}`;
          
          // Upload to Dropbox
          const file = new File([convertedBlob], fileName, { type: convertedBlob.type });
          await uploadToDropbox(file);
          
          setUploadStatus("✅ Successfully uploaded to Dropbox!");
        } catch (error) {
          console.error("Processing error:", error);
          setUploadStatus("❌ Failed to process video. Please try again.");
        } finally {
          setUploading(false);
          setConverting(false);
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
    <div className="entry-screen">
      <div className="entry-card recording-card">
        <h2 className="entry-title">Instructions</h2>
        <p className="entry-text">
          This study will take at most 1 hour in total. In this study, you will work collaboratively with a partner to find
          a path through a series of mazes. More instructions will be given later.
        </p>

        {!recordingStarted ? (
          <p className="entry-text entry-notice">
            Your screen will be recorded during the session. <br/><br/>
            In a moment, please press the blue button below that says "<strong>Start Screen Recording.</strong>" 
            On the next screen, you will see an option to share your tab, your window, or entire screen.
            Please select your "Window" then "Maze Task" to record your <strong>current window</strong>.
          </p>
        ) : (
          <p className="entry-text entry-notice">
            Great! Your screen is now recording. Now, press the <strong>"Start Game"</strong> button and begin the task.
          </p>
        )}

        {uploadStatus && (
          <p className="entry-text entry-notice upload-status">
            {uploadStatus}
          </p>
        )}

        <p className="entry-text">
          If you have any issues or have any questions, please feel free to ask the researcher.
        </p>

        {!recordingStarted ? (
          <button onClick={startRecording} className="entry-button">
            Start Screen Recording
          </button>
        ) : (
          <button onClick={handleStartGame} className="entry-button" disabled={uploading || converting}>
            {converting ? "Converting..." : uploading ? "Uploading..." : "Start Game"}
          </button>
        )}
      </div>
    </div>
  );
}



ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/instructions/:sessionId/:role" element={<Instructions />} />
      <Route path="/participant1/:sessionId" element={<MainApp key="participant1" participant={1} />} />
      <Route path="/participant2/:sessionId" element={<MainApp key="participant2" participant={2} />} />
    </Routes>
  </BrowserRouter>
);
