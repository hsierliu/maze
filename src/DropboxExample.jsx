import React, { useState } from 'react';
import { Dropbox } from 'dropbox';

function DropboxExample() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Get the Dropbox access token from environment variables
  const accessToken = process.env.REACT_APP_DROPBOX_ACCESS_TOKEN;

  // Initialize Dropbox client
  const dbx = new Dropbox({ accessToken });

  const listFiles = async () => {
    if (!accessToken || accessToken === 'your_dropbox_access_token_here') {
      alert('Please set your Dropbox access token in the .env file');
      return;
    }

    setLoading(true);
    try {
      const response = await dbx.filesListFolder({ path: '' });
      setFiles(response.result.entries);
    } catch (error) {
      console.error('Error listing files:', error);
      alert('Error accessing Dropbox. Please check your access token.');
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file) => {
    if (!accessToken || accessToken === 'your_dropbox_access_token_here') {
      alert('Please set your Dropbox access token in the .env file');
      return;
    }

    try {
      const response = await dbx.filesUpload({
        path: `/${file.name}`,
        contents: file,
        mode: 'overwrite'
      });
      console.log('File uploaded:', response.result);
      alert('File uploaded successfully!');
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file to Dropbox.');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Dropbox Integration Example</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={listFiles} 
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          {loading ? 'Loading...' : 'List Files'}
        </button>
        
        <input
          type="file"
          onChange={(e) => {
            if (e.target.files[0]) {
              uploadFile(e.target.files[0]);
            }
          }}
          style={{ marginLeft: '10px' }}
        />
      </div>

      {files.length > 0 && (
        <div>
          <h3>Files in Dropbox:</h3>
          <ul>
            {files.map((file, index) => (
              <li key={index}>
                {file.name} ({file['.tag']})
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
        <h4>Setup Instructions:</h4>
        <ol>
          <li>Get your Dropbox access token from the <a href="https://www.dropbox.com/developers/apps" target="_blank" rel="noopener noreferrer">Dropbox App Console</a></li>
          <li>Replace 'your_dropbox_access_token_here' in your .env file with your actual token</li>
          <li>Make sure your .env file is in the root directory of your project</li>
          <li>Restart your development server after updating the .env file</li>
        </ol>
      </div>
    </div>
  );
}

export default DropboxExample;
