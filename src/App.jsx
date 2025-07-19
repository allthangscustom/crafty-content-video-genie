
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown'; // Import ReactMarkdown for rendering Markdown

// Main App component for the CraftyVideoGenie application
const App = () => {
  // State to store the user's input for the craft type/theme (now can be multiple, comma-separated)
  const [craftInput, setCraftInput] = useState('');
  // State to store the AI-generated video scripts (now an array)
  const [generatedScripts, setGeneratedScripts] = useState([]);
  // State to manage the loading status during AI generation
  const [isLoading, setIsLoading] = useState(false);
  // State to display any error messages to the user
  const [error, setError] = useState('');

  /**
   * Handles the generation of craft video scripts using the Gemini API.
   * Can now handle multiple prompts for batch generation.
   */
  const handleGenerateScripts = async () => {
    setError(''); // Clear any previous error messages
    setGeneratedScripts([]); // Clear previous scripts

    // Split the input into individual craft types, handling commas and trimming whitespace
    const craftTypes = craftInput.split(',').map(item => item.trim()).filter(item => item.length > 0);

    // Validate user input
    if (craftTypes.length === 0) {
      setError('Please enter at least one craft idea to generate a video script.');
      return;
    }

    setIsLoading(true); // Set loading state to true
    let newScripts = [];

    for (const craftType of craftTypes) {
      try {
        // Define the prompt for the AI model
        const prompt = `Generate a creative and engaging social media video script for a craft project. The craft type/theme is: "${craftType}".

The script should be formatted for easy readability using Markdown. Use bold for key section titles and step names.

Include the following sections:
---
### **Video Title Suggestion:**
* [Suggest a catchy video title]

### **1. Catchy Hook & Intro (5-10 seconds)**
* **Visual:** [Describe visual for hook]
* **VO/Text Overlay:** "Your catchy opening line!"

### **2. Materials Needed (5-10 seconds)**
* **Visual:** [Quick cuts showing each material]
* **VO/Text Overlay:** "Here's what you'll need:"
* [List materials clearly with bullet points]

### **3. Step-by-Step Instructions & Filming Tips (15-70 seconds)**
* **(Aim for quick transitions and visually appealing close-ups for each step.)**

* **Step 1: [Step Name] (Time estimate)**
    * **Visual:** [Describe visual]
    * **VO/Text Overlay:** "What to say/show"
    * **Filming Tip:** [Specific camera/editing tip]

* **Step 2: [Step Name] (Time estimate)**
    * **Visual:** [Describe visual]
    * **VO/Text Overlay:** "What to say/show"
    * **Filming Tip:** [Specific camera/editing tip]

    (Continue for all necessary steps, ensuring each step starts with **Step X: [Step Name]**)

### **4. Call to Action (5-10 seconds)**
* **Visual:** [Show finished product, smiling crafter]
* **VO/Text Overlay:** "Encourage viewers to try it!"

### **5. Suggested Background Music Vibe**
* [Describe music style]

### **6. Relevant Hashtags**
* [List hashtags with # symbol]

### **7. Full Video Captions (for social media post)**
* [Provide a concise, engaging caption for the entire video, including a hook, brief description, and a call to action. Incorporate emojis where appropriate.]
---
Keep the overall script concise and engaging for a short video format (e.g., 60-90 seconds total).`;

        // Prepare the payload for the Gemini API request
        let chatHistory = [];
        chatHistory.push({ role: "user", parts: [{ text: prompt }] });
        const payload = { contents: chatHistory };

        // API key is automatically provided by the Canvas environment
        const apiKey = "";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        // Make the fetch call to the Gemini API
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        // Parse the JSON response
        const result = await response.json();

        // Check if the response contains generated text
        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
          const text = result.candidates[0].content.parts[0].text;
          newScripts.push({ id: Date.now() + Math.random(), craftType: craftType, script: text });
        } else {
          setError(`Failed to generate script for "${craftType}". Please try a different prompt.`);
          console.error('API response error for:', craftType, result);
        }
      } catch (err) {
        setError(`An error occurred for "${craftType}". Please try again.`);
        console.error('Error during script generation for:', craftType, err);
      }
    }
    setGeneratedScripts(newScripts); // Update the state with all generated scripts
    setIsLoading(false); // Reset loading state
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-orange-100 p-4 font-sans flex flex-col items-center">
      {/* Header Section */}
      <header className="w-full max-w-4xl text-center py-8">
        <h1 className="text-5xl font-extrabold text-pink-700 mb-4 drop-shadow-lg">
          CraftyVideoGenie
        </h1>
        <p className="text-xl text-gray-700 mb-8">
          Your AI assistant for creating amazing craft video content for social media!
          Get inspired with unique ideas and detailed scripts. Now with **Batch Generation!**
        </p>
      </header>

      {/* Script Generation Section */}
      <section className="w-full max-w-3xl bg-white p-8 rounded-2xl shadow-xl border border-pink-200 mb-8">
        <h2 className="text-3xl font-bold text-pink-600 mb-6 text-center">Generate Craft Video Script(s)</h2>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <textarea
            className="flex-grow p-3 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none text-gray-800 h-24 sm:h-auto"
            placeholder="Enter craft ideas, separated by commas for batch generation (e.g., 'DIY macrame plant hanger, Origami paper crane tutorial, Polymer clay earrings')"
            value={craftInput}
            onChange={(e) => setCraftInput(e.target.value)}
            aria-label="Craft type or theme input"
          />
          <button
            onClick={handleGenerateScripts}
            className="px-6 py-3 bg-pink-600 text-white font-semibold rounded-lg shadow-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-75 transition duration-300 ease-in-out transform hover:scale-105"
            disabled={isLoading}
            aria-label="Generate Video Scripts"
          >
            {isLoading ? 'Generating...' : 'Generate Script(s)'}
          </button>
        </div>

        {/* Error Message Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Script Display Area */}
        {isLoading && (
          <div className="flex justify-center items-center h-64 bg-pink-50 rounded-lg animate-pulse">
            <p className="text-pink-600 text-lg">Crafting your video script(s)...</p>
          </div>
        )}
        {generatedScripts.length > 0 && !isLoading && (
          <div className="mt-6">
            <h3 className="text-2xl font-semibold text-pink-700 mb-4 text-center">Your AI-Generated Video Script(s):</h3>
            {generatedScripts.map((scriptData) => (
              <div key={scriptData.id} className="mb-8 p-6 bg-pink-50 rounded-xl shadow-inner border border-pink-200 text-gray-800">
                <h4 className="text-xl font-bold text-pink-600 mb-3">Script for: "{scriptData.craftType}"</h4>
                <ReactMarkdown>{scriptData.script}</ReactMarkdown>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default App;
