
import React, { useState, useEffect } from 'react';
import { UserSession, GenderRole, CaseDetails } from '../types';
import { callCatJudgeApi } from '../services/geminiService';
import { useRoomSync } from '../hooks/useRoomSync';

interface RoomPageProps {
  session: UserSession;
  onLeave: () => void;
}

const RoomPage: React.FC<RoomPageProps> = ({ session, onLeave }) => {
  // 使用 Hook 获取实时同步的房间数据
  const { roomData, updateField, loading, error } = useRoomSync(session.roomId);

  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  // 辅助判断：当前用户是否是男方/女方
  const isMale = session.role === GenderRole.MALE;
  const isFemale = session.role === GenderRole.FEMALE;

  const handleJudge = async () => {
    if ((!roomData.male_story && !roomData.male_feelings) || (!roomData.female_story && !roomData.female_feelings)) {
      alert("请双方至少填写一点内容喵！");
      return;
    }

    setIsSubmitting(true);
    
    // Scroll to bottom
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });

    // 构造 Prompt 数据对象
    const details: CaseDetails = {
      maleName: isMale ? session.nickname : '男方', // 这里简化处理，真实情况可能需要把昵称也存DB
      femaleName: isFemale ? session.nickname : '女方',
      maleStory: roomData.male_story,
      maleFeelings: roomData.male_feelings,
      femaleStory: roomData.female_story,
      femaleFeelings: roomData.female_feelings
    };

    const aiResponse = await callCatJudgeApi(details);
    setResult(aiResponse);
    setIsSubmitting(false);
  };

  const resetResult = () => {
    setResult(null);
  };

  // 如果正在加载数据，显示 Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-cat-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">🐾</div>
          <p className="text-gray-600 font-bold">正在连接猫猫数据库...</p>
        </div>
      </div>
    );
  }

  // 如果 Supabase 出错
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-200">
          <h3 className="font-bold text-lg">连接出错了喵！</h3>
          <p className="text-sm mt-2">{error}</p>
          <p className="text-sm mt-2">请检查 Supabase 配置或网络连接。</p>
          <button onClick={onLeave} className="mt-4 text-blue-500 hover:underline">返回首页</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐱</span>
            <div>
              <h1 className="font-bold text-gray-800 leading-tight">猫猫法庭</h1>
              <p className="text-xs text-gray-500">
                房间号: <span className="font-mono bg-gray-100 px-1 rounded">{session.roomId}</span>
                <span className="ml-2 text-green-500 text-[10px] border border-green-200 px-1 rounded-full">● 实时同步中</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-sm text-gray-600">
              当前身份: <span className={`font-bold ${isMale ? 'text-blue-500' : 'text-pink-500'}`}>
                {isMale ? '男方' : '女方'}
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
          <div className={`bg-white rounded-2xl shadow-sm border-t-4 border-blue-400 overflow-hidden flex flex-col transition-opacity ${!isMale && 'opacity-90'}`}>
            <div className="bg-blue-50 p-4 border-b border-blue-100 flex items-center gap-2">
              <span className="text-2xl">👦</span>
              <h2 className="font-bold text-blue-900">男方陈述</h2>
              {!isMale && (
                <span className="ml-auto text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full flex items-center gap-1">
                  🔒 对方正在输入...
                </span>
              )}
              {isMale && (
                <span className="ml-auto text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full flex items-center gap-1">
                  ✏️ 请填写
                </span>
              )}
            </div>
            <div className="p-4 space-y-4 flex-1">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">事情经过</label>
                <textarea
                  className={`w-full h-32 p-3 border rounded-xl outline-none resize-none transition-colors
                    ${isMale 
                      ? 'border-gray-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 bg-gray-50' 
                      : 'border-transparent bg-gray-50 text-gray-500 cursor-not-allowed'
                    }`}
                  placeholder={isMale ? "发生了什么事？请客观描述..." : "等待男方填写..."}
                  value={roomData.male_story}
                  onChange={(e) => updateField('male_story', e.target.value)}
                  readOnly={!isMale || result !== null}
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">委屈和感受</label>
                <textarea
                  className={`w-full h-24 p-3 border rounded-xl outline-none resize-none transition-colors
                    ${isMale 
                      ? 'border-gray-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 bg-gray-50' 
                      : 'border-transparent bg-gray-50 text-gray-500 cursor-not-allowed'
                    }`}
                  placeholder={isMale ? "你觉得哪里被误解了？心里怎么想的？" : "等待男方填写..."}
                  value={roomData.male_feelings}
                  onChange={(e) => updateField('male_feelings', e.target.value)}
                  readOnly={!isMale || result !== null}
                ></textarea>
              </div>
            </div>
          </div>

          {/* Female Side */}
          <div className={`bg-white rounded-2xl shadow-sm border-t-4 border-pink-400 overflow-hidden flex flex-col transition-opacity ${!isFemale && 'opacity-90'}`}>
            <div className="bg-pink-50 p-4 border-b border-pink-100 flex items-center gap-2">
              <span className="text-2xl">👧</span>
              <h2 className="font-bold text-pink-900">女方陈述</h2>
              {!isFemale && (
                <span className="ml-auto text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full flex items-center gap-1">
                  🔒 对方正在输入...
                </span>
              )}
              {isFemale && (
                <span className="ml-auto text-xs bg-pink-100 text-pink-600 px-2 py-1 rounded-full flex items-center gap-1">
                  ✏️ 请填写
                </span>
              )}
            </div>
            <div className="p-4 space-y-4 flex-1">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">事情经过</label>
                <textarea
                  className={`w-full h-32 p-3 border rounded-xl outline-none resize-none transition-colors
                    ${isFemale 
                      ? 'border-gray-200 focus:ring-2 focus:ring-pink-200 focus:border-pink-400 bg-gray-50' 
                      : 'border-transparent bg-gray-50 text-gray-500 cursor-not-allowed'
                    }`}
                  placeholder={isFemale ? "发生了什么事？请客观描述..." : "等待女方填写..."}
                  value={roomData.female_story}
                  onChange={(e) => updateField('female_story', e.target.value)}
                  readOnly={!isFemale || result !== null}
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">委屈和感受</label>
                <textarea
                  className={`w-full h-24 p-3 border rounded-xl outline-none resize-none transition-colors
                    ${isFemale 
                      ? 'border-gray-200 focus:ring-2 focus:ring-pink-200 focus:border-pink-400 bg-gray-50' 
                      : 'border-transparent bg-gray-50 text-gray-500 cursor-not-allowed'
                    }`}
                  placeholder={isFemale ? "你觉得哪里被误解了？心里怎么想的？" : "等待女方填写..."}
                  value={roomData.female_feelings}
                  onChange={(e) => updateField('female_feelings', e.target.value)}
                  readOnly={!isFemale || result !== null}
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
            <p className="mt-2 text-xs text-gray-400">
              * 点击后双方内容将合并发送给法官
            </p>
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
          Made with 🐾 using Gemini API & Supabase Realtime
        </p>
      </footer>
    </div>
  );
};

export default RoomPage;
