import React, { useState } from 'react';
import { GenderRole, UserSession } from '../types';

interface LandingPageProps {
  onJoin: (session: UserSession) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onJoin }) => {
  const [roomId, setRoomId] = useState('');
  const [nickname, setNickname] = useState('');
  const [role, setRole] = useState<GenderRole>(GenderRole.MALE);

  const generateRoomId = () => {
    const randomId = Math.floor(100000 + Math.random() * 900000).toString();
    setRoomId(randomId);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId.trim() || !nickname.trim()) {
      alert("请输入房间号和昵称喵！");
      return;
    }
    onJoin({ roomId, nickname, role });
  };

  return (
    <div className="min-h-screen bg-cat-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full border-4 border-cat-200">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🐱 猫猫法庭</h1>
          <p className="text-gray-500">情侣吵架调解所</p>
        </div>

        <form onSubmit={handleJoin} className="space-y-6">
          {/* Room ID */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">房间号码</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="例如: 123456"
                className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:border-cat-400 transition"
              />
              <button
                type="button"
                onClick={generateRoomId}
                className="bg-cat-100 text-cat-800 px-3 py-2 rounded-xl text-sm font-bold hover:bg-cat-200 transition"
              >
                随机生成
              </button>
            </div>
          </div>

          {/* Nickname */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">你的昵称</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="怎么称呼你？"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:border-cat-400 transition"
            />
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">你的角色</label>
            <div className="flex gap-4">
              <label className={`flex-1 cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center gap-2 transition ${role === GenderRole.MALE ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-200'}`}>
                <input
                  type="radio"
                  name="role"
                  value={GenderRole.MALE}
                  checked={role === GenderRole.MALE}
                  onChange={() => setRole(GenderRole.MALE)}
                  className="hidden"
                />
                <span className="text-2xl">👦</span>
                <span className="font-bold text-gray-700">男方</span>
              </label>

              <label className={`flex-1 cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center gap-2 transition ${role === GenderRole.FEMALE ? 'border-pink-400 bg-pink-50' : 'border-gray-200 hover:border-pink-200'}`}>
                <input
                  type="radio"
                  name="role"
                  value={GenderRole.FEMALE}
                  checked={role === GenderRole.FEMALE}
                  onChange={() => setRole(GenderRole.FEMALE)}
                  className="hidden"
                />
                <span className="text-2xl">👧</span>
                <span className="font-bold text-gray-700">女方</span>
              </label>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-cat-500 hover:bg-cat-600 text-white font-bold py-3 rounded-xl shadow-lg transform active:scale-95 transition"
          >
            进入猫猫法庭 🐾
          </button>
        </form>
      </div>
    </div>
  );
};

export default LandingPage;
