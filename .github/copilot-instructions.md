When writing CSS, ensure to include responsive design elements for smaller screens, such as mobile devices. Use media queries to adjust styles accordingly, ensuring a seamless user experience across different screen sizes. 
Use MySQL queries for data retrieval and manipulation, for backend logic
when writing javasript, ensure to use modern ES6+ syntax
Use axios for making api calls 
When creating pages or componenets make sure to add a subfolder for the page or component in the `src` directory. For example, if creating a new page called `UserProfile`, create a folder `src/pages/UserProfile` and place all related files (like `UserProfile.js`, `UserProfile.css`, etc.) inside that folder.

below is the boilerplate code or template for those pages that are called as "form pages" or treasted as a form. Change variables and apis accordingly, for the entries i mention while giving the prompt to make form pages.
import React, { useState } from 'react';

export default function UploadForm() {
  const [imageFiles, setImageFiles] = useState([]);
  const [audioFiles, setAudioFiles] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);
  const [textFiles, setTextFiles] = useState([]);
  const [text, setText] = useState(''); // Single text input state

  const handleFileChange = (e, type) => {
    const selected = Array.from(e.target.files);
    if (type === 'image') setImageFiles(selected);
    else if (type === 'audio') setAudioFiles(selected);
    else if (type === 'video') setVideoFiles(selected);
    else if (type === 'text') setTextFiles(selected);
  };

  const handleSubmit = async (data, type, field) => {
    const formData = new FormData();

    if (['image', 'audio', 'video', 'text'].includes(type)) {
      data.forEach(file => formData.append('files', file));
      formData.append('type', type);
      formData.append('field', field);
    } else if (type === 'text-input') {
      formData.append('type', type);
      formData.append('field', field);  // e.g., "title" or "description"
      formData.append('value', data);   // the text from input
    }

    try {
      const res = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();
      console.log(`${field} upload result:`, result);
    } catch (err) {
      console.error(`Error uploading ${field}:`, err);
    }
  };

  return (
    <div>
      {/* Image Upload */}
      <h3>Upload Images</h3>
      <input type="file" multiple accept="image/*" onChange={(e) => handleFileChange(e, 'image')} />
      <button onClick={() => handleSubmit(imageFiles, 'image', 'wallpaper')}>Upload as Wallpaper</button>

      {/* Audio Upload */}
      <h3>Upload Audio</h3>
      <input type="file" multiple accept="audio/*" onChange={(e) => handleFileChange(e, 'audio')} />
      <button onClick={() => handleSubmit(audioFiles, 'audio', 'background-music')}>Upload as Background Music</button>

      {/* Video Upload */}
      <h3>Upload Videos</h3>
      <input type="file" multiple accept="video/*" onChange={(e) => handleFileChange(e, 'video')} />
      <button onClick={() => handleSubmit(videoFiles, 'video', 'intro-video')}>Upload as Intro Video</button>

      {/* Text File Upload */}
      <h3>Upload Text Files</h3>
      <input type="file" multiple accept=".txt,.md,.csv,text/plain" onChange={(e) => handleFileChange(e, 'text')} />
      <button onClick={() => handleSubmit(textFiles, 'text', 'license')}>Upload as License</button>

      {/* Single Text Input Shared for Title & Description */}
      <h3>Enter Title</h3>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter title"
      />
      <button onClick={() => handleSubmit(text, 'text-input', 'title')}>Submit Title</button>

      <h3>Enter Description</h3>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter description"
      />
      <button onClick={() => handleSubmit(text, 'text-input', 'description')}>Submit Description</button>
    </div>
  );
}