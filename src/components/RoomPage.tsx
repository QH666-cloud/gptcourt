import React, { useState } from 'react';
import { UserSession, GenderRole, CaseDetails } from '../types';
import { callCatJudgeApi } from '../services/geminiService';
import { useRoomSync } from '../hooks/useRoomSync';

interface RoomPageProps {
  session: UserSession;
  onLeave: () => void;
}

const RoomPage: React.FC<RoomPageProps> = ({ session, onLeave }) => {
  // 接入 Supabase 实时 Hook
  const { roomData, loading, error, updateField } = useRoomSync(session.roomId, session.role);

  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  // 辅助判断：当前用户身份
  const isMale = session.role === GenderRole.MALE;
  const isFemale = session.role === GenderRole.FEMALE;

  const handleJudge = async () => {
    // 使用实时数据进行校验
    if ((!roomData.male_story && !roomData.male_feelings) || (!roomData.female_story && !roomData.female_feelings)) {
      alert("请双方至少填写一点内容喵！");
      return;
    }

    setIsSubmitting(true);
    
    // 滚动到底部
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });

    // 使用实时数据构建 Prompt
    const details: CaseDetails = {
      maleName: isMale ? session.nickname : '男方', // 这里简化处理，可以扩展 DB 存储双方昵称
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

  // 加载中状态
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl animate-bounce mb-4">🐾</div>
          <p className="text-gray-600 font-bold">正在连接猫猫数据库...</p>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-red-100 max-w-md text-center">
          <h3 className="text-xl font-bold text-red-500 mb-2">连接出错了喵！😿</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <p className="text-sm text-gray-400 mb-4">请检查网络或 Supabase 配置</p>
          <button 
            onClick={onLeave}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-full transition"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐱</span>
            <div>
              <h1 className="font-bold text-gray-800 leading-tight">猫猫法庭</h1>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded font-mono">
                  房号: {session.roomId}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full border border-green-100">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                  实时同步中
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-sm text-gray-600">
              当前身份: <span className={`font-bold ${isMale ? 'text-blue-500' : 'text-pink-500'}`}>
                {isMale ? '👦 男方' : '👧 女方'}
              </span>
            </div>
            <button 
              onClick={onLeave}
              className="text-sm text-gray-400 hover:text-red-500 transition-colors px-2 py-1"
            >
              退出
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 pb-24">
        
        {/* Warning Banner for opposite role */}
        <div className="mb-6 bg-blue-50/50 border border-blue-100 rounded-xl p-3 flex items-start gap-3 text-sm text-blue-800">
          <span className="text-lg">💡</span>
          <p>
            你只能编辑属于你的那一侧（{isMale ? '蓝色区域' : '粉色区域'}）。
            <br className="sm:hidden" />
            对方输入的内容会实时显示在屏幕上。
          </p>
        </div>

        {/* Input Areas Split View */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* Male Side */}
          <div className={`bg-white rounded-2xl shadow-sm border-t-4 border-blue-400 overflow-hidden flex flex-col transition-all duration-500 ${!isMale ? 'opacity-90 grayscale-[20%]' : 'ring-2 ring-blue-100'}`}>
            <div className="bg-blue-50 p-4 border-b border-blue-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">👦</span>
                <h2 className="font-bold text-blue-900">男方陈述</h2>
              </div>
              {!isMale ? (
                <span className="text-xs bg-white text-gray-400 border border-gray-200 px-2 py-1 rounded-full flex items-center gap-1">
                  🔒 只读模式
                </span>
              ) : (
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full animate-pulse">
                  ✏️ 请填写
                </span>
              )}
            </div>
            <div className="p-4 space-y-4 flex-1">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">事情经过</label>
                <textarea
                  className={`w-full h-32 p-3 border rounded-xl outline-none resize-none transition-all duration-300
                    ${isMale 
                      ? 'border-gray-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 bg-white' 
                      : 'border-transparent bg-gray-50 text-gray-600 cursor-not-allowed select-none'
                    }`}
                  placeholder={isMale ? "发生了什么事？请客观描述..." : "等待男方填写..."}
                  value={roomData.male_story}
                  onChange={(e) => isMale && updateField('male_story', e.target.value)}
                  readOnly={!isMale || result !== null}
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">委屈和感受</label>
                <textarea
                  className={`w-full h-24 p-3 border rounded-xl outline-none resize-none transition-all duration-300
                    ${isMale 
                      ? 'border-gray-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 bg-white' 
                      : 'border-transparent bg-gray-50 text-gray-600 cursor-not-allowed select-none'
                    }`}
                  placeholder={isMale ? "你觉得哪里被误解了？心里怎么想的？" : "等待男方填写..."}
                  value={roomData.male_feelings}
                  onChange={(e) => isMale && updateField('male_feelings', e.target.value)}
                  readOnly={!isMale || result !== null}
                ></textarea>
              </div>
            </div>
          </div>

          {/* Female Side */}
          <div className={`bg-white rounded-2xl shadow-sm border-t-4 border-pink-400 overflow-hidden flex flex-col transition-all duration-500 ${!isFemale ? 'opacity-90 grayscale-[20%]' : 'ring-2 ring-pink-100'}`}>
            <div className="bg-pink-50 p-4 border-b border-pink-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">👧</span>
                <h2 className="font-bold text-pink-900">女方陈述</h2>
              </div>
              {!isFemale ? (
                <span className="text-xs bg-white text-gray-400 border border-gray-200 px-2 py-1 rounded-full flex items-center gap-1">
                  🔒 只读模式
                </span>
              ) : (
                <span className="text-xs bg-pink-100 text-pink-600 px-2 py-1 rounded-full animate-pulse">
                  ✏️ 请填写
                </span>
              )}
            </div>
            <div className="p-4 space-y-4 flex-1">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">事情经过</label>
                <textarea
                  className={`w-full h-32 p-3 border rounded-xl outline-none resize-none transition-all duration-300
                    ${isFemale 
                      ? 'border-gray-200 focus:ring-2 focus:ring-pink-200 focus:border-pink-400 bg-white' 
                      : 'border-transparent bg-gray-50 text-gray-600 cursor-not-allowed select-none'
                    }`}
                  placeholder={isFemale ? "发生了什么事？请客观描述..." : "等待女方填写..."}
                  value={roomData.female_story}
                  onChange={(e) => isFemale && updateField('female_story', e.target.value)}
                  readOnly={!isFemale || result !== null}
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">委屈和感受</label>
                <textarea
                  className={`w-full h-24 p-3 border rounded-xl outline-none resize-none transition-all duration-300
                    ${isFemale 
                      ? 'border-gray-200 focus:ring-2 focus:ring-pink-200 focus:border-pink-400 bg-white' 
                      : 'border-transparent bg-gray-50 text-gray-600 cursor-not-allowed select-none'
                    }`}
                  placeholder={isFemale ? "你觉得哪里被误解了？心里怎么想的？" : "等待女方填写..."}
                  value={roomData.female_feelings}
                  onChange={(e) => isFemale && updateField('female_feelings', e.target.value)}
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
              * 将会使用双方当前输入的内容进行评判
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
               {/* 简易 Markdown 渲染，生产环境建议用 react-markdown */}
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
