import { AppState, User } from '../types';
import { supabase } from '../supabaseClient';

const STORAGE_KEY = 'money_dog_app_data_v7'; // Updated version

const DEFAULT_USER: User = {
  id: 0, 
  name: "我的账本",
  password: "",
  assets: {
    goose_balance: 0,
    pocket_balance: 0,
    dreams: [],
    custom_accounts: []
  },
  transactions: []
};

const DEFAULT_STATE: AppState = {
  app_settings: {
    admin_password: "", 
    admin_initialized: false,
    default_allocation: {
      dream: 0.5,
      goose: 0.3,
      pocket: 0.2
    },
    assumed_interest_rate: 0.08
  },
  users: [DEFAULT_USER],
  activeUserId: 0
};

// 本地加载（用于离线兜底或快速渲染）
export const loadState = (): AppState => {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (serializedState === null) {
      return DEFAULT_STATE;
    }
    const state = JSON.parse(serializedState);
    return state;
  } catch (err) {
    console.error("Could not load local state", err);
    return DEFAULT_STATE;
  }
};

// 本地保存
export const saveState = (state: AppState): void => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serializedState);
  } catch (err) {
    console.error("Could not save local state", err);
  }
};

// --- 云端同步功能 ---

// 从 Supabase 加载数据
export const loadFromCloud = async (userId: string): Promise<AppState | null> => {
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('data')
      .eq('id', userId)
      .maybeSingle(); // 使用 maybeSingle 而不是 single，这样找不到数据时不会报错，而是返回 null

    if (error) {
      console.error("Error loading from cloud:", error);
      return null;
    }

    if (data && data.data) {
       return data.data as AppState;
    }
    
    // 如果没有数据（data 为 null），说明是新用户
    return null;

  } catch (error) {
    console.error("Cloud load exception:", error);
    return null;
  }
};

// 保存到 Supabase
export const saveToCloud = async (userId: string, state: AppState) => {
  try {
    const { error } = await supabase
      .from('user_progress')
      .upsert({ 
        id: userId, 
        data: state,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error("Error saving to cloud:", error);
    }
  } catch (error) {
    console.error("Cloud save exception:", error);
  }
};