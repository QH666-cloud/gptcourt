import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { RoomData, GenderRole } from '../types';
import debounce from 'lodash/debounce';

const DEFAULT_ROOM_DATA: RoomData = {
  id: '',
  male_story: '',
  male_feelings: '',
  female_story: '',
  female_feelings: ''
};

export const useRoomSync = (roomId: string, role: GenderRole) => {
  const [roomData, setRoomData] = useState<RoomData>(DEFAULT_ROOM_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 使用 Ref 保存最新的 roomData，防止闭包问题
  const roomDataRef = useRef(roomData);

  // 1. 初始化房间数据 (Get or Create)
  useEffect(() => {
    if (!roomId) return;

    const fetchOrInitRoom = async () => {
      try {
        setLoading(true);
        // 尝试获取房间数据
        let { data, error } = await supabase
          .from('rooms')
          .select('*')
          .eq('id', roomId)
          .single();

        if (error && error.code === 'PGRST116') {
          // PGRST116: 结果为空，说明房间不存在，需要创建
          console.log("房间不存在，正在初始化...", roomId);
          const { data: newData, error: insertError } = await supabase
            .from('rooms')
            .insert([{ id: roomId }])
            .select()
            .single();
          
          if (insertError) throw insertError;
          data = newData;
        } else if (error) {
          throw error;
        }

        if (data) {
          const typedData = data as RoomData;
          setRoomData(typedData);
          roomDataRef.current = typedData;
        }
      } catch (err: any) {
        console.error("Supabase Error:", err);
        setError(err.message || "无法连接到房间数据");
      } finally {
        setLoading(false);
      }
    };

    fetchOrInitRoom();
  }, [roomId]);

  // 2. 订阅实时更新 (Realtime Subscription)
  useEffect(() => {
    if (!roomId) return;

    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rooms',
          filter: `id=eq.${roomId}`,
        },
        (payload) => {
          // 当数据库发生变化（可能是对方修改的），更新本地状态
          const newData = payload.new as RoomData;
          
          // 只有当变更的数据和当前本地显示的数据不一样时才更新，
          // 避免自己输入时的回显导致光标跳动等问题（虽然 React Controlled Component 通常能处理）
          if (JSON.stringify(newData) !== JSON.stringify(roomDataRef.current)) {
            console.log("收到对方更新:", newData);
            setRoomData(newData);
            roomDataRef.current = newData;
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  // 3. 防抖更新数据库
  // 使用 useCallback + debounce 避免频繁请求数据库
  const updateDb = useCallback(
    debounce(async (id: string, updates: Partial<RoomData>) => {
      console.log("正在同步到数据库...", updates);
      const { error } = await supabase
        .from('rooms')
        .update(updates)
        .eq('id', id);
      
      if (error) console.error("同步失败:", error);
    }, 500), // 500ms 防抖
    []
  );

  // 4. 对外暴露的更新方法
  // 这些方法会立即更新本地 UI (Optimistic UI)，然后延迟写入 DB
  
  const updateLocalAndDb = (updates: Partial<RoomData>) => {
    const newData = { ...roomDataRef.current, ...updates };
    setRoomData(newData);
    roomDataRef.current = newData;
    updateDb(roomId, updates);
  };

  const updateMale = (story: string, feelings: string) => {
    // 只有当自己是男性时，才有权限调用这个（虽然 UI 层也会拦）
    updateLocalAndDb({ male_story: story, male_feelings: feelings });
  };

  const updateFemale = (story: string, feelings: string) => {
    updateLocalAndDb({ female_story: story, female_feelings: feelings });
  };

  // 单独更新某个字段的辅助函数（方便绑定 onChange）
  const updateField = (field: keyof RoomData, value: string) => {
    updateLocalAndDb({ [field]: value });
  };

  return { 
    roomData, 
    loading, 
    error,
    updateMale,
    updateFemale,
    updateField // 暴露通用更新方法，方便组件使用
  };
};
