import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

export default function SchemeDetails() {
  const { id } = useParams();
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/ai/scheme/${id}`);
        setDetails(response.data.markdown || response.data);
      } catch (error) {
        console.error("Error fetching details:", error);
        setDetails("Failed to generate dynamic scheme details. Ensure backend is running.");
      }
      setLoading(false);
    };
    fetchDetails();
  }, [id]);

  return (
    <div className="p-6 glass rounded-2xl shadow-xl max-w-4xl mx-auto">
      <Link to="/dashboard/schemes" className="text-govblue hover:underline mb-4 inline-block">&larr; Back to Schemes</Link>
      <h2 className="text-2xl font-bold mb-4 text-white">Dynamic Scheme Details</h2>
      {loading ? (
        <div className="flex justify-center p-8"><div className="w-8 h-8 border-4 border-govblue border-t-transparent rounded-full animate-spin"></div></div>
      ) : (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 prose prose-slate text-slate-800 max-w-none">
          <ReactMarkdown>{details}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}
