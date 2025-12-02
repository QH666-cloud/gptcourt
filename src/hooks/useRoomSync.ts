
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
      console.log(`🔍 [RoomSync] 开始初始化房间: ${roomId}`);
      try {
        setLoading(true);
        
        // A. 尝试获取房间数据
        let { data, error } = await supabase
          .from('rooms')
          .select('*')
          .eq('id', roomId)
          .single();

        // B. 处理查询结果
        if (error && error.code === 'PGRST116') {
          // PGRST116: 结果为空，说明房间不存在，需要创建
          console.log(`✨ [RoomSync] 房间 ${roomId} 不存在，正在创建...`);
          
          const { data: newData, error: insertError } = await supabase
            .from('rooms')
            .insert([{ id: roomId }])
            .select()
            .single();
          
          if (insertError) {
            console.error("❌ [RoomSync] 创建房间失败:", insertError);
            throw insertError;
          }
          console.log("✅ [RoomSync] 房间创建成功:", newData);
          data = newData;
        } else if (error) {
          console.error("❌ [RoomSync] 查询房间失败:", error);
          throw error;
        } else {
          console.log("✅ [RoomSync] 房间已存在，加载数据:", data);
        }

        if (data) {
          const typedData = data as RoomData;
          setRoomData(typedData);
          roomDataRef.current = typedData;
        }
      } catch (err: any) {
        console.error("🔥 [RoomSync] 初始化过程发生异常:", err);
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

    console.log(`📡 [RoomSync] 正在订阅实时频道: room:${roomId}`);
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
          
          // 简单对比，避免循环更新
          if (JSON.stringify(newData) !== JSON.stringify(roomDataRef.current)) {
            console.log("📨 [RoomSync] 收到实时更新推送:", newData);
            setRoomData(newData);
            roomDataRef.current = newData;
          }
        }
      )
      .subscribe((status) => {
        console.log(`📡 [RoomSync] 订阅状态: ${status}`);
      });

    return () => {
      console.log(`🔌 [RoomSync] 断开订阅: room:${roomId}`);
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  // 3. 防抖更新数据库
  // 注意：debounce 返回的函数也是需要被 useCallback 缓存的
  const updateDb = useCallback(
    debounce((id: string, updates: Partial<RoomData>) => {
      console.log(`💾 [RoomSync] 正在保存数据到 DB (ID: ${id})...`, updates);
      
      supabase
        .from('rooms')
        .update(updates)
        .eq('id', id)
        .then(({ error }) => {
          if (error) {
            console.error("❌ [RoomSync] 保存失败:", error);
          } else {
            console.log("✅ [RoomSync] 保存成功");
          }
        });
    }, 500), // 500ms 防抖
    []
  );

  // 4. 对外暴露的更新方法
  const updateLocalAndDb = (updates: Partial<RoomData>) => {
    // 乐观 UI 更新：先改本地
    const newData = { ...roomDataRef.current, ...updates };
    setRoomData(newData);
    roomDataRef.current = newData;
    
    // 异步写库
    updateDb(roomId, updates);
  };

  const updateMale = (story: string, feelings: string) => {
    updateLocalAndDb({ male_story: story, male_feelings: feelings });
  };

  const updateFemale = (story: string, feelings: string) => {
    updateLocalAndDb({ female_story: story, female_feelings: feelings });
  };

  const updateField = (field: keyof RoomData, value: string) => {
    updateLocalAndDb({ [field]: value });
  };

  return { 
    roomData, 
    loading, 
    error,
    updateMale,
    updateFemale,
    updateField 
  };
};
