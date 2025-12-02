import React, { useState, useEffect } from 'react';
import { UserSession, GenderRole, CaseDetails } from '../types';
import { callCatJudgeApi } from '../services/geminiService';
import ReactMarkdown from 'react-markdown'; // We assume this library is available or would be added
// Since we cannot rely on external npm packages in this environment, I will use a simple text display with whitespace preservation for the fallback, 
// but for the "Senior Engineer" prompt, I will write the code assuming a markdown renderer component or write a simple one.

interface RoomPageProps {
  session: UserSession;
  onLeave: () => void;
}

const RoomPage: React.FC<RoomPageProps> = ({ session, onLeave }) => {
  // Input States
  const [maleStory, setMaleStory] = useState('');
  const [maleFeelings, setMaleFeelings] = useState('');
  const [femaleStory, setFemaleStory] = useState('');
  const [femaleFeelings, setFemaleFeelings] = useState('');

  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  // Sync session nickname to placeholder if relevant (Simple demo logic)
  // In a real app with backend, we would fetch existing room data here.
  
  const handleJudge = async () => {
    if ((!maleStory && !maleFeelings) || (!femaleStory && !femaleFeelings)) {
      alert("请双方至少填写一点内容喵！");
      return;
    }

    setIsSubmitting(true);
    
    // Scroll to bottom
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });

    const details: CaseDetails = {
      maleName: session.role === GenderRole.MALE ? session.nickname : '男方',
      femaleName: session.role === GenderRole.FEMALE ? session.nickname : '女方',
      maleStory,
      maleFeelings,
      femaleStory,
      femaleFeelings
    };

    const aiResponse = await callCatJudgeApi(details);
    setResult(aiResponse);
    setIsSubmitting(false);
  };

  const resetResult = () => {
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐱</span>
            <div>
              <h1 className="font-bold text-gray-800 leading-tight">猫猫法庭</h1>
              <p className="text-xs text-gray-500">房间号: {session.roomId}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-sm text-gray-600">
              当前身份: <span className={`font-bold ${session.role === GenderRole.MALE ? 'text-blue-500' : 'text-pink-500'}`}>
                {session.role === GenderRole.MALE ? '男方' : '女方'}
              </span>
            </div>
            <button 
              onClick={onLeave}
              className="text-sm text-gray-500 hover:text-red-500"
            >
              退出
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 pb-24">
        
        {/* Input Areas Split View */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* Male Side */}
          <div className="bg-white rounded-2xl shadow-sm border-t-4 border-blue-400 overflow-hidden flex flex-col">
            <div className="bg-blue-50 p-4 border-b border-blue-100 flex items-center gap-2">
              <span className="text-2xl">👦</span>
              <h2 className="font-bold text-blue-900">男方陈述</h2>
              {session.role !== GenderRole.MALE && (
                <span className="ml-auto text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                  对方填写区域
                </span>
              )}
            </div>
            <div className="p-4 space-y-4 flex-1">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">事情经过</label>
                <textarea
                  className="w-full h-32 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none resize-none bg-gray-50"
                  placeholder="发生了什么事？请客观描述..."
                  value={maleStory}
                  onChange={(e) => setMaleStory(e.target.value)}
                  disabled={result !== null} // Lock when showing result
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">委屈和感受</label>
                <textarea
                  className="w-full h-24 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none resize-none bg-gray-50"
                  placeholder="你觉得哪里被误解了？心里怎么想的？"
                  value={maleFeelings}
                  onChange={(e) => setMaleFeelings(e.target.value)}
                  disabled={result !== null}
                ></textarea>
              </div>
            </div>
          </div>

          {/* Female Side */}
          <div className="bg-white rounded-2xl shadow-sm border-t-4 border-pink-400 overflow-hidden flex flex-col">
            <div className="bg-pink-50 p-4 border-b border-pink-100 flex items-center gap-2">
              <span className="text-2xl">👧</span>
              <h2 className="font-bold text-pink-900">女方陈述</h2>
              {session.role !== GenderRole.FEMALE && (
                <span className="ml-auto text-xs bg-pink-100 text-pink-600 px-2 py-1 rounded-full">
                  对方填写区域
                </span>
              )}
            </div>
            <div className="p-4 space-y-4 flex-1">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">事情经过</label>
                <textarea
                  className="w-full h-32 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-200 focus:border-pink-400 outline-none resize-none bg-gray-50"
                  placeholder="发生了什么事？请客观描述..."
                  value={femaleStory}
                  onChange={(e) => setFemaleStory(e.target.value)}
                  disabled={result !== null}
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">委屈和感受</label>
                <textarea
                  className="w-full h-24 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-200 focus:border-pink-400 outline-none resize-none bg-gray-50"
                  placeholder="你觉得哪里被误解了？心里怎么想的？"
                  value={femaleFeelings}
                  onChange={(e) => setFemaleFeelings(e.target.value)}
                  disabled={result !== null}
                ></textarea>
              </div>
            </div>
          </div>

        </div>

        {/* Action Area */}
        {result === null ? (
          <div className="text-center sticky bottom-12 z-20">
            <button
              onClick={handleJudge}
              disabled={isSubmitting}
              className={`
                bg-cat-500 text-white font-bold text-lg px-12 py-4 rounded-full shadow-xl 
                transform transition duration-200
                ${isSubmitting ? 'opacity-80 cursor-wait' : 'hover:bg-cat-600 hover:scale-105 active:scale-95'}
              `}
            >
              {isSubmitting ? '🐱 猫猫法官正在思考喵...' : '🐾 请猫猫法官来评判'}
            </button>
          </div>
        ) : (
          /* Result Card */
          <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border-4 border-cat-300 overflow-hidden animate-fade-in-up">
            <div className="bg-cat-400 p-6 text-center relative">
              <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/paw-prints.png')]"></div>
              <h2 className="text-2xl font-bold text-white relative z-10">📜 判决书</h2>
              <p className="text-white/90 text-sm mt-1 relative z-10">Cat Judge Verdict</p>
            </div>
            
            <div className="p-8 prose prose-amber max-w-none text-gray-700">
               {/* Since we don't have react-markdown installed in this raw output, we map the text to paragraphs simply. 
                   In a real project: <ReactMarkdown>{result}</ReactMarkdown> 
               */}
               <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed text-gray-700">
                 {result}
               </pre>
            </div>

            <div className="bg-gray-50 p-6 text-center border-t border-gray-100">
              <button
                onClick={resetResult}
                className="text-cat-600 font-bold hover:text-cat-700 hover:underline"
              >
                ✏️ 重新编辑 & 再评一次
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Footer Disclaimer */}
      <footer className="bg-white border-t border-gray-200 py-6 text-center px-4 mt-auto">
        <p className="text-xs text-gray-400">
          “猫猫法庭仅提供参考建议，不能替代真正的沟通与专业心理咨询。”
        </p>
        <p className="text-xs text-gray-300 mt-1">
          Made with 🐾 using Gemini API
        </p>
      </footer>
    </div>
  );
};

export default RoomPage;
