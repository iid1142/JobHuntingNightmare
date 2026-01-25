import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import ComplaintWall from './ComplaintWall';
import './App.css';

console.log("TESTING ENV:", import.meta.env.VITE_SUPABASE_URL);

// --- UTILS: Zero-Storage Fingerprinting ---
const getSeed = (input) => {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
};

const getAlias = (seed) => {
  const titles = ["Asset", "Entity", "Unit", "Resource", "Component"];
  return `${titles[seed % titles.length]}-${(seed % 9000) + 1000}`;
};

const QUESTION_POOL = [
  // --- MANDATORY/SERIOUS (Serious Category) ---
  { question_text: "Are you legally authorized to work in this reality?", type: "dropdown", options: ["Yes", "No", "It is classified"], category: "serious" },
  { question_text: "I am comfortable working in a fast-paced environment that ignores the laws of thermodynamics.", type: "multiple_choice", options: ["Strongly Agree", "Agree", "I have no choice"], category: "serious" },
  { question_text: "How many years of experience do you have in a software that was released yesterday?", type: "dropdown", options: ["1-3 years", "5+ years", "I invented it"], category: "serious" },
  { question_text: "Describe your greatest weakness using only corporate buzzwords.", type: "short_answer", category: "serious" },
  { question_text: "Are you willing to relocate to a cubicle located in a sub-dimension?", type: "multiple_choice", options: ["Yes", "Only if there is coffee", "I am already there"], category: "serious" },
  { question_text: "What is your expected salary in 'Exposure Units'?", type: "dropdown", options: ["0-100", "100-500", "I pay you for the privilege"], category: "serious" },
  { question_text: "Do you have experience managing stakeholders who don't exist?", type: "multiple_choice", options: ["Yes", "No", "I am a ghost myself"], category: "serious" },
  { question_text: "Rate your ability to pretend to be excited about Monday mornings.", type: "dropdown", options: ["Expert", "Intermediate", "I am a professional actor"], category: "serious" },
  { question_text: "Can you provide a 5-year plan for a company that will pivot in 2 weeks?", type: "short_answer", category: "serious" },
  { question_text: "I agree to let the AI monitor my blink rate for productivity metrics.", type: "multiple_choice", options: ["I Accept", "I Enthusiastically Accept"], category: "serious" },
  { question_text: "How many browser tabs do you currently have open?", type: "dropdown", options: ["1-10", "11-50", "My RAM is screaming"], category: "serious" },
  { question_text: "Are you able to provide 24/7 support while maintaining a 'Work-Life Balance'?", type: "multiple_choice", options: ["Yes", "No (Immediate Rejection)"], category: "serious" },
  { question_text: "Which animal best represents your ability to pivot during a quarterly crisis?", type: "short_answer", category: "serious" },
  { question_text: "Have you ever 'leveled up' a 'synergistic paradigm'?", type: "dropdown", options: ["Daily", "Hourly", "In my sleep"], category: "serious" },
  { question_text: "Do you find satisfaction in completing tasks that have no purpose?", type: "multiple_choice", options: ["Deeply", "Somewhat", "Only on Tuesdays"], category: "serious" },
  { question_text: "Enter your LinkedIn URL so we can judge your profile picture.", type: "short_answer", category: "serious" },
  { question_text: "How do you handle 'Constructive Criticism' (yelling)?", type: "dropdown", options: ["With a smile", "With a spreadsheet", "I internalize it"], category: "serious" },
  { question_text: "I am ready to sacrifice my hobbies for a 'Standard Performance Review'.", type: "multiple_choice", options: ["True", "Extremely True"], category: "serious" },
  { question_text: "What is the maximum amount of 'Internalized Stress' you can carry?", type: "dropdown", options: ["Low", "High", "Critical Failure"], category: "serious" },
  { question_text: "If the CEO tells a joke that isn't funny, how loudly do you laugh?", type: "short_answer", category: "serious" },
  { question_text: "Do you believe in the power of 'Mandatory Fun' events?", type: "multiple_choice", options: ["Yes", "I love office pizza", "No (HR contacted)"], category: "serious" },
  { question_text: "Can you maintain 'Agile' workflow while standing perfectly still?", type: "dropdown", options: ["Yes", "No", "I am a statue"], category: "serious" },
  { question_text: "Rate your proficiency in 'Email Passive-Aggressiveness'.", type: "dropdown", options: ["Per my last email", "Kind regards", "Best"], category: "serious" },
  { question_text: "How many times a day do you check your Slack notifications?", type: "short_answer", category: "serious" },
  { question_text: "I understand that 'Unlimited PTO' is a psychological test.", type: "multiple_choice", options: ["I agree", "I will never take a day off"], category: "serious" },

  // --- ABSURD/UNHINGED (Absurd Category) ---
  { question_text: "If a manager falls in a forest and no one is there to hear them, are you still fired?", type: "multiple_choice", options: ["Yes", "Obviously", "The forest is HR"], category: "absurd" },
  { question_text: "Explain the color 'Blue' to a CEO who only sees 'Profit Green'.", type: "short_answer", category: "absurd" },
  { question_text: "How many souls are currently stored in your LinkedIn Premium account?", type: "dropdown", options: ["0-5", "5-50", "Infinite"], category: "absurd" },
  { question_text: "If you were a color, which one would be the most 'Productive'?", type: "dropdown", options: ["Office Gray", "Fluorescent White", "Burnout Beige"], category: "absurd" },
  { question_text: "Which kitchen appliance is your spirit animal during a server outage?", type: "short_answer", category: "absurd" },
  { question_text: "Do you prefer your coffee black or with the tears of interns?", type: "multiple_choice", options: ["Black", "Intern Tears", "I drink ink"], category: "absurd" },
  { question_text: "On a scale of 1 to 'The Void', how much do you enjoy spreadsheets?", type: "dropdown", options: ["1", "The Void", "Beyond"], category: "absurd" },
  { question_text: "If you could replace HR with a sentient toaster, would you?", type: "multiple_choice", options: ["Yes", "No", "The toaster is already HR"], category: "absurd" },
  { question_text: "How many times have you been 'Ghosted' by a robot today?", type: "short_answer", category: "absurd" },
  { question_text: "Describe the taste of a 'Successful Merger'.", type: "dropdown", options: ["Metallic", "Bitter", "Like cold pizza"], category: "absurd" },
  { question_text: "Can you hear the servers screaming at night?", type: "multiple_choice", options: ["Yes", "I scream back", "I sleep in the server room"], category: "absurd" },
  { question_text: "What is the airspeed velocity of an unladen project manager?", type: "short_answer", category: "absurd" },
  { question_text: "Is it a 'Bug' or a 'Feature' that your existence is temporary?", type: "multiple_choice", options: ["Bug", "Feature", "Hotfix"], category: "absurd" },
  { question_text: "How many invisible hats do you wear in a given workday?", type: "dropdown", options: ["3", "12", "I am made of hats"], category: "absurd" },
  { question_text: "Which existential crisis fits your current professional profile?", type: "short_answer", category: "absurd" },
  { question_text: "Do you agree that 'Synergy' is just a fancy word for 'Group Panic'?", type: "multiple_choice", options: ["Yes", "Definitely", "Help"], category: "absurd" },
  { question_text: "How much of your body has been replaced by office supplies?", type: "dropdown", options: ["10%", "50%", "I am a stapler"], category: "absurd" },
  { question_text: "If you were a font, would you be 'Comic Sans' to annoy the designers?", type: "multiple_choice", options: ["Yes", "No", "I am Wingdings"], category: "absurd" },
  { question_text: "What is the square root of a 'Late Afternoon Meeting'?", type: "short_answer", category: "absurd" },
  { question_text: "Can you communicate effectively using only Emoji and despair?", type: "dropdown", options: ["Yes 😭", "No 🤡", "Maybe 💀"], category: "absurd" },
  { question_text: "Are you aware that the 'Save' icon is a floppy disk, and do you know what that is?", type: "multiple_choice", options: ["Yes", "I am too young", "I am the floppy disk"], category: "absurd" },
  { question_text: "How many times can you say 'Let's take this offline' before you vanish?", type: "short_answer", category: "absurd" },
  { question_text: "Does the printer smell your fear?", type: "multiple_choice", options: ["Always", "Only when I'm in a rush", "I have no fear"], category: "absurd" },
  { question_text: "Which circle of Hell is the Marketing Department located in?", type: "dropdown", options: ["7th", "9th", "A new one they created"], category: "absurd" },
  { question_text: "Please provide your final words for the 'Company Archive'.", type: "short_answer", category: "absurd" }
];

const shuffle = (array) => [...array].sort(() => Math.random() - 0.5);

function App() {
  // --- STATE ---
  const [step, setStep] = useState("login"); // login, questions, loading, rejected
  const [userId, setUserId] = useState("");
  const [alias, setAlias] = useState("");
  const [questions, setQuestions] = useState([]);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Initializing...");
  const [refreshWall, setRefreshWall] = useState(0);

  const messages = [
    "Optimizing synergy...",
    "Scanning for culture fit...",
    "Consulting the Board of Directors...",
    "Ignoring your achievements...",
    "Finalizing rejection letter...",
    "Checking for soul...",
    "Analyzing eye contact in photo...",
    "Comparing salary to industry lows..."
  ];

  // --- LOGIC: Fetch Questions from Supabase ---
  useEffect(() => {
    async function fetchQuestions() {
      try {
        const { data } = await supabase.from("community_questions").select("*");

        const hasCategories = data?.some(q => q.category === 'serious');
        const source = (data && data.length > 0 && hasCategories) ? data : QUESTION_POOL;

        // 1. Determine random counts for this specific session
        // We'll aim for roughly half serious, half absurd
        const totalTarget = Math.floor(Math.random() * (15 - 7 + 1)) + 7; // Random 7-15
        const seriousCount = Math.ceil(totalTarget / 2); // e.g., if 11, serious is 6
        const absurdCount = totalTarget - seriousCount; // e.g., if 11, absurd is 5

        const seriousPool = source.filter(q => q.category === 'serious');
        const absurdPool = source.filter(q => q.category === 'absurd');

        // 2. Shuffle and slice based on our new random targets
        const serious = shuffle(seriousPool).slice(0, seriousCount);
        const absurd = shuffle(absurdPool).slice(0, absurdCount);

        setQuestions([...serious, ...absurd]);
      } catch (err) {
        console.error("Falling back to local pool:", err);
        // Fallback random slice if everything fails
        const fallbackCount = Math.floor(Math.random() * (15 - 7 + 1)) + 7;
        setQuestions(shuffle(QUESTION_POOL).slice(0, fallbackCount));
      }
    }
    fetchQuestions();
  }, []);

  // --- LOGIC: Identity Hashing (Phase 1) ---
  const handleLogin = (e) => {
    e.preventDefault();
    const hash = userId.split("").reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0);
    setAlias(`Entity-${Math.abs(hash % 10000)}`);
    setStep("questions");
  };

  // --- LOGIC: Loading & Status Messages (Phase 3) ---
  useEffect(() => {
    if (step === "loading") {
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 99.9) return prev;
          // As it gets higher, the jumps get smaller (The "Zeno's Paradox" of loading)
          const increment = (100 - prev) / (prev > 90 ? 50 : 20);
          return prev + increment;
        });
      }, 500);

      const msgInterval = setInterval(() => {
        setStatus(messages[Math.floor(Math.random() * messages.length)]);
      }, 2000);

      const timer = setTimeout(() => setStep("rejected"), 10000);

      return () => {
        clearInterval(progressInterval);
        clearInterval(msgInterval);
        clearTimeout(timer);
      };
    }
  }, [step]);

  // --- LOGIC: Sabotage (Phase 2) ---
  const submitSabotage = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const text = formData.get("newQuestion");
    const type = formData.get("questionType");
    const rawChoices = formData.get("customChoices");

    let options = null;

    // Only handle options for Multiple Choice or Dropdown
    if (type === "multiple_choice" || type === "dropdown") {
      if (rawChoices && rawChoices.trim() !== "") {
        // Split by comma and remove extra spaces
        options = rawChoices.split(",").map(opt => opt.trim()).filter(opt => opt !== "");
      } else {
        // Fallback if they left it blank
        options = ["Insignificant", "Irrelevant", "The Void"];
      }
    }

    const { error } = await supabase
      .from("community_questions")
      .insert([{
        question_text: text,
        type: type,
        category: "absurd",
        options: options
      }]);

    if (error) alert("System Error: " + error.message);
    else {
      alert("SABOTAGE LOGGED. SYSTEM INFECTED.");
      e.target.reset();
    }
  };
  const postComplaint = async (e) => {
    e.preventDefault();
    const text = new FormData(e.target).get("complaintText");

    const { error } = await supabase
      .from('complaints')
      .insert([{
        content: text,
        user_alias: alias
      }]);

    if (error) {
      alert("The wall ignored your cry: " + error.message);
    } else {
      e.target.reset();
      // Optional: Refresh the list or alert success
      alert("Complaint etched into the void.");
      setRefreshWall(prev => prev + 1);
    }
  };

  // --- UI RENDERING ---
  return (
    /* MAIN WRAPPER: Centers everything and fills the dark background */
    <div className="app-container">
      <div className="content-wrapper">
        
        {/* BOX 1: THE PORTAL BOX (Changes content based on 'step') */}
        <div className="max-w-4xl w-full bg-white border-[6px] border-black p-8 text-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
          
          {/* PERSISTENT HEADER */}
          <div className="border-b-8 border-black mb-8 pb-4">
            <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none">
              Global Synergy Portal
            </h1>
            {alias && (
              <p className="font-mono font-bold bg-yellow-300 inline-block px-2 mt-2 border-2 border-black text-sm">
                ID: {alias}
              </p>
            )}
          </div>

          {/* STEP 1: LOGIN */}
          {step === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <p className="font-bold uppercase text-sm">Enter Employee ID to begin evaluation:</p>
              <input
                required
                className="w-full border-4 border-black p-4 text-xl font-mono focus:bg-yellow-50 outline-none"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="USER_99"
              />
              <button className="w-full bg-black text-white font-black py-4 uppercase text-xl hover:bg-red-600 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                Access Portal
              </button>
            </form>
          )}

          {/* STEP 2: DYNAMIC QUESTIONS (With Validation) */}
          {step === "questions" && (
            <form 
              onSubmit={(e) => { e.preventDefault(); setStep("loading"); }} 
              className="space-y-8 max-h-[65vh] overflow-y-auto pr-4 custom-scrollbar"
            >
              <div className="bg-yellow-50 border-2 border-dashed border-yellow-400 p-3 mb-4">
                <p className="text-[10px] font-mono uppercase text-yellow-700">
                  ⚠️ Warning: All fields are mandatory. LOAD: {questions.length} MODULES DETECTED.
                </p>
              </div>

              {questions.map((q, i) => (
                <div key={i} className="space-y-3 border-b-2 border-gray-100 pb-6">
                  {/* Metadata Tag */}
                  <div className="flex gap-2">
                    <span className="bg-black text-white text-[9px] px-2 py-0.5 font-bold uppercase">
                      Type: {q.type?.replace('_', ' ')}
                    </span>
                    {q.category === 'absurd' && (
                      <span className="bg-red-600 text-white text-[9px] px-2 py-0.5 font-bold uppercase animate-pulse-fast">
                        Infection Detected
                      </span>
                    )}
                  </div>

                  <p className="font-black uppercase text-sm leading-tight">
                    <span className="text-red-600 mr-2">{i + 1}.</span> {q.question_text} *
                  </p>

                  {/* Render based on Type */}
                  {q.type === "multiple_choice" && (
                    <div className="grid grid-cols-1 gap-2">
                      {q.options?.map(opt => (
                        <label key={opt} className="flex items-center gap-3 p-3 border-2 border-black hover:bg-gray-50 cursor-pointer has-[:checked]:bg-yellow-50">
                          <input type="radio" name={`q-${i}`} required className="w-4 h-4 accent-black" />
                          <span className="text-xs font-bold uppercase">{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {q.type === "short_answer" && (
                    <input type="text" name={`q-${i}`} required placeholder="Justify..." className="w-full border-2 border-black p-3 font-mono text-xs focus:bg-white bg-gray-50 outline-none" />
                  )}

                  {q.type === "dropdown" && (
                    <select name={`q-${i}`} required className="w-full border-2 border-black p-3 font-bold text-xs bg-white outline-none" defaultValue="">
                      <option value="" disabled>-- SELECT --</option>
                      {q.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  )}
                </div>
              ))}
              <button type="submit" className="w-full bg-black text-white font-black py-6 uppercase mt-4 hover:bg-red-600 sticky bottom-0">
                Finalize Submission
              </button>
            </form>
          )}

          {/* STEP 3: LOADING */}
          {step === "loading" && (
            <div className="space-y-6 py-10 text-center">
              <p className="font-mono text-red-600 font-bold animate-pulse">&gt; {status}</p>
              <div className="w-full h-10 border-4 border-black bg-gray-100">
                <div className="h-full bg-black transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
              <p className="font-mono font-black text-2xl">{progress.toFixed(2)}%</p>
            </div>
          )}

          {/* STEP 4: REJECTED HEADER (Inside main box) */}
          {step === "rejected" && (
            <div className="bg-red-600 text-white p-6 text-center border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-5xl font-black uppercase italic">Rejected</h2>
              <p className="font-bold">STATUS: UNFIT FOR CULTURE FIT</p>
            </div>
          )}
        </div>

        {/* STEP 4: SABOTAGE & GRIEVANCE (Visible only after rejection, below main box) */}
        {step === "rejected" && (
          <div className="space-y-10 mb-20">
            
            {/* INFECT SYSTEM FORM */}
            <div className="border-[6px] border-black p-6 bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="text-2xl font-black uppercase italic mb-4 border-b-4 border-black inline-block">Infect System</h3>
              <div className="bg-gray-900 text-gray-300 p-4 mb-4 font-mono text-[9px] border-l-8 border-red-600">
                <p className="text-red-500 font-bold underline mb-1">PROTOCOL:</p>
                <p>1. INPUT MALICIOUS QUESTION.</p>
                <p>2. SELECT INPUT TYPE.</p>
                <p>3. USE COMMAS FOR CHOICES (A, B, C).</p>
              </div>
              <form onSubmit={submitSabotage} className="space-y-4">
                <textarea name="newQuestion" required placeholder="Question text..." className="w-full border-4 border-black p-3 font-mono text-sm bg-gray-50" />
                <div className="grid grid-cols-2 gap-4">
                  <select name="questionType" className="border-4 border-black p-2 font-bold text-xs bg-white">
                    <option value="multiple_choice">Multi-Choice</option>
                    <option value="dropdown">Dropdown</option>
                    <option value="short_answer">Short Answer</option>
                  </select>
                  <input name="customChoices" placeholder="Choice 1, Choice 2..." className="border-4 border-black p-2 font-mono text-xs" />
                </div>
                <button className="w-full bg-red-600 text-white font-black py-3 uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">Deploy Infection</button>
              </form>
            </div>

            {/* GRIEVANCE FORM */}
            <div className="border-[6px] border-black p-6 bg-white shadow-[12px_12px_0px_0px_rgba(220,38,38,1)]">
              <h3 className="text-2xl font-black uppercase mb-4 border-b-4 border-black inline-block">Submit Grievance</h3>
              <form onSubmit={postComplaint} className="space-y-4">
                <textarea name="complaintText" required placeholder="TYPE COMPLAINT HERE..." className="w-full h-32 border-4 border-black p-4 font-mono text-lg bg-gray-50" />
                <button className="w-full bg-black text-white font-black py-4 uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">Log Complaint</button>
              </form>
            </div>

            {/* THE MISERY FEED */}
            <ComplaintWall refreshTrigger={refreshWall} />
          </div>
        )}

      </div>
    </div>
  );
}
export default App;