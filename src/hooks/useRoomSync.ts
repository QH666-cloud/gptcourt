
import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { RoomData } from '../types';
import debounce from 'lodash/debounce';

const DEFAULT_ROOM_DATA: RoomData = {
  id: '',
  male_story: '',
  male_feelings: '',
  female_story: '',
  female_feelings: ''
};

export const useRoomSync = (roomId: string) => {
  const [roomData, setRoomData] = useState<RoomData>(DEFAULT_ROOM_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 使用 Ref 保存最新的 roomData，供 debounce 函数引用，防止闭包过时问题
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
          // 如果房间不存在 (PGRST116)，则创建新房间
          console.log("房间不存在，正在创建...", roomId);
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
          setRoomData(data as RoomData);
          roomDataRef.current = data as RoomData;
        }
      } catch (err: any) {
        console.error("Supabase Error:", err);
        setError(err.message);
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
          console.log("收到实时更新:", payload);
          const newData = payload.new as RoomData;
          setRoomData(newData);
          roomDataRef.current = newData;
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  // 3. 防抖更新数据库 (Debounced Update)
  // 使用 useCallback 确保 debounce 函数不会在每次渲染时重建
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

  // 4. 更新本地状态并触发 DB 同步
  const updateField = (field: keyof RoomData, value: string) => {
    // 立即更新 UI，保证输入流畅
    const newData = { ...roomData, [field]: value };
    setRoomData(newData);
    roomDataRef.current = newData;

    // 触发防抖写入
    updateDb(roomId, { [field]: value });
  };

  return { roomData, updateField, loading, error };
};
