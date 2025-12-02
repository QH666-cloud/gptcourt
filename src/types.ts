
export enum GenderRole {
  MALE = 'MALE',
  FEMALE = 'FEMALE'
}

export interface CaseDetails {
  maleName: string;
  femaleName: string;
  maleStory: string;
  maleFeelings: string;
  femaleStory: string;
  femaleFeelings: string;
}

export interface UserSession {
  roomId: string;
  nickname: string;
  role: GenderRole;
}

export interface JudgeResponse {
  markdown: string;
}

// 对应 Supabase 数据库 rooms 表的结构
export interface RoomData {
  id: string;
  male_story: string;
  male_feelings: string;
  female_story: string;
  female_feelings: string;
}
