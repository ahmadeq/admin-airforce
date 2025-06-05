export type ContactFormResponse = {
  id: number;
  created_at: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  hide: boolean;
};

export type JoinFormResponse = {
  id: number;
  created_at: string;
  name: string;
  age: number;
  email: string;
  phone: string;
  major: string;
  university: string;
  about: string;
  why: string;
  skills: string;
  note?: string;
};
