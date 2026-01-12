import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

// These bots provide "flavor" so the wall is never empty
const BOT_RANTS = [
  { username: "HR_Bot_99", content: "Your frustration has been logged and converted into a 'Growth Opportunity.'", is_bot: true },
  { username: "Candidate_441", content: "The AI asked me to describe the taste of 'synergy.' I said it tastes like copper. I was rejected.", is_bot: true },
  { username: "Ghosted_Since_22", content: "Day 400: Still waiting for the 'Submit' button to stop running away from my mouse.", is_bot: true },
  { username: "System_Admin", content: "Error 418: I'm a teapot, and even I have better career prospects than you.", is_bot: true }
];

// Add 'props' to your function arguments
export default function ComplaintWall(props) { 
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      const { data } = await supabase
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) setComplaints([...data, ...BOT_RANTS]);
    };

    fetchComplaints();
    
    // Add props.refreshTrigger here! 
    // This tells React: "Run this function whenever this value changes"
  }, [props.refreshTrigger]);

  return (
    <div className="mt-12 w-full max-w-xl border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex justify-between items-center border-b-4 border-black mb-4 pb-2">
        <h3 className="font-black uppercase text-2xl italic tracking-tighter">Live Misery Feed</h3>
        {loading && <span className="animate-spin text-xl">⏳</span>}
      </div>

      <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
        {complaints.length === 0 && !loading && (
          <p className="text-center font-mono italic text-gray-400">The void is currently silent...</p>
        )}

        {complaints.map((c, i) => (
          <div 
            key={i} 
            className={`p-4 border-2 border-black transition-transform hover:-translate-y-1 ${
              c.is_bot ? 'bg-red-50 border-red-900/20' : 'bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
            }`}
          >
            <div className="flex justify-between items-start mb-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-red-600">
                {/* This line handles both DB names and Bot names */}
                {c.user_alias || c.username || "Anonymous Entity"}
              </p>
              {c.is_bot && (
                <span className="text-[8px] bg-black text-white px-1 font-bold">VERIFIED BOT</span>
              )}
            </div>
            <p className="text-sm font-mono leading-tight">
              "{c.content}"
            </p>
          </div>
        ))}
      </div>
      
      <p className="mt-4 text-[9px] font-mono text-gray-400 text-center uppercase">
        All grievances are monitored and will be ignored in the order received.
      </p>
    </div>
  );
}