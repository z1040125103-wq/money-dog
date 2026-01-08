import { AppState } from '../types';

const STORAGE_KEY = 'money_dog_app_data_v6'; // Incremented version for auth security

const DEFAULT_STATE: AppState = {
  app_settings: {
    admin_password: "", // Empty by default
    admin_initialized: false, // User must set it up first
    default_allocation: {
      dream: 0.5,
      goose: 0.3,
      pocket: 0.2
    },
    assumed_interest_rate: 0.08
  },
  users: [
    {
      id: 1,
      name: "我是账本",
      password: "123456", // Default password for the demo user
      securityQuestion: "你的第一只宠物名字是？",
      securityAnswer: "旺财",
      assets: {
        goose_balance: 0,
        pocket_balance: 0,
        dreams: [
          {
            id: 101,
            title: "乐高城堡",
            target_amount: 2000,
            current_amount: 0,
            image_url: "https://picsum.photos/400/200"
          },
          {
            id: 102,
            title: "迪士尼乐园门票",
            target_amount: 800,
            current_amount: 0
          }
        ],
        custom_accounts: []
      },
      transactions: []
    }
  ],
  activeUserId: 0
};

export const loadState = (): AppState => {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (serializedState === null) {
      return DEFAULT_STATE;
    }
    const state = JSON.parse(serializedState);
    
    // Backward compatibility: ensure custom_accounts exists
    state.users = state.users.map((u: any) => ({
        ...u,
        assets: {
            ...u.assets,
            custom_accounts: u.assets.custom_accounts || []
        }
    }));

    // Backward compatibility check for admin_initialized
    if (state.app_settings && typeof state.app_settings.admin_initialized === 'undefined') {
        state.app_settings.admin_initialized = true; 
        state.app_settings.admin_password = state.app_settings.admin_password || "123456";
    }
    return state;
  } catch (err) {
    console.error("Could not load state", err);
    return DEFAULT_STATE;
  }
};

export const saveState = (state: AppState): void => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serializedState);
  } catch (err) {
    console.error("Could not save state", err);
  }
};