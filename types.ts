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
  markdown: string; // The raw markdown response from Gemini
}
