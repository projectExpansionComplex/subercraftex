import { configureStore, createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import { combineReducers } from "redux";
import axiosInstance from '@/utils/axiosInstance';


// Types
interface AuthState {
  current_user: {
    uid: string;
    email: string;
    full_name: string;
    role: 'customer' | 'designer' | 'admin';
  } | null;
  auth_token: string | null;
}

interface NotificationsState {
  messages: Array<{
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
  }>;
}

interface MessagesState {
  count: number;
}

interface CartState {
  items: Array<{
    product_uid: string;
    quantity: number;
    price: number;
  }>;
  total: number;
}

interface UIState {
  language: string;
  theme: string;
  is_search_overlay_open: boolean;
}

interface WebSocketConnectionState {
  status: string;
}

interface PreferencesState {
  language: string;
  currency: string;
  theme: 'light' | 'dark';
}

interface SearchState {
  recent_searches: string[];
}

// Slices
const authSlice = createSlice({
  name: 'auth',
  initialState: { current_user: null, auth_token: null } as AuthState,
  reducers: {
    set_auth: (state, action: PayloadAction<AuthState>) => {
      state.current_user = action.payload.current_user;
      state.auth_token = action.payload.auth_token;
    },
    clear_auth: (state) => {
      state.current_user = null;
      state.auth_token = null;
    },
  },
});

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: { messages: [] } as NotificationsState,
  reducers: {
    add_notification: (state, action: PayloadAction<NotificationsState['messages'][0]>) => {
      state.messages.push(action.payload);
    },
    remove_notification: (state, action: PayloadAction<string>) => {
      state.messages = state.messages.filter(msg => msg.id !== action.payload);
    },
    clear_notifications: (state) => {
      state.messages = [];
    },
  },
});

const messagesSlice = createSlice({
  name: 'messages',
  initialState: { count: 0 } as MessagesState,
  reducers: {
    set_message_count: (state, action: PayloadAction<number>) => {
      state.count = action.payload;
    },
  },
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], total: 0 } as CartState,
  reducers: {
    add_to_cart: (state, action: PayloadAction<CartState['items'][0]>) => {
      const existingItem = state.items.find(item => item.product_uid === action.payload.product_uid);
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
      state.total = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    },
    remove_from_cart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.product_uid !== action.payload);
      state.total = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    },
    update_cart_item_quantity: (state, action: PayloadAction<{ product_uid: string; quantity: number }>) => {
      const item = state.items.find(item => item.product_uid === action.payload.product_uid);
      if (item) {
        item.quantity = action.payload.quantity;
      }
      state.total = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    },
    clear_cart: (state) => {
      state.items = [];
      state.total = 0;
    },
  },
});

const uiSlice = createSlice({
  name: 'ui',
  initialState: { language: 'en', theme: 'light', is_search_overlay_open: false } as UIState,
  reducers: {
    set_language: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    set_theme: (state, action: PayloadAction<string>) => {
      state.theme = action.payload;
    },
    toggle_search_overlay: (state) => {
      state.is_search_overlay_open = !state.is_search_overlay_open;
    },
  },
});

const webSocketConnectionSlice = createSlice({
  name: 'web_socket_connection',
  initialState: { status: 'disconnected' } as WebSocketConnectionState,
  reducers: {
    set_connection_status: (state, action: PayloadAction<string>) => {
      state.status = action.payload;
    },
  },
});

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState: { language: 'en', currency: 'USD', theme: 'light' } as PreferencesState,
  reducers: {
    set_preferences: (state, action: PayloadAction<Partial<PreferencesState>>) => {
      return { ...state, ...action.payload };
    },
  },
});

const searchSlice = createSlice({
  name: 'search',
  initialState: { recent_searches: [] } as SearchState,
  reducers: {
    add_recent_search: (state, action: PayloadAction<string>) => {
      state.recent_searches = [action.payload, ...state.recent_searches.filter(s => s !== action.payload)].slice(0, 5);
    },
    clear_recent_searches: (state) => {
      state.recent_searches = [];
    },
  },
});

// Async Thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { dispatch }) => {
    try {
      
      
      const response = await axiosInstance.post('/api/users/login', credentials);
      
      
      
    

      if(response.data.success === true){
        dispatch(add_notification({
          id: Date.now().toString(),
          type: 'success',
          message: 'Login successful!'
        }));
      }

       // Extract and map the API response to fit the AuthState structure
       const formattedData = {
        current_user: {
          id: response.data.user._id,
          uid: response.data.user.uid,
          email: response.data.user.email,
          full_name: `${response.data.user.first_name} ${response.data.user.last_name}`,
          role: response.data.user.role as 'customer' | 'designer' | 'admin', // Ensure role matches expected type
          profile_picture_url: response.data.user.profile_picture_url,
        },
        auth_token: response.data.access_token, // Save access token
      };

      dispatch(set_auth(formattedData));
      console.log("Dispatched set_auth with:", formattedData);

      return formattedData;
      
    } catch (error) {
      console.error("Login failed:", error);
      dispatch(notificationsSlice.actions.add_notification({
        id: Date.now().toString(),
        type: 'error',
        message: error.response.data.message ? error.response.data.message :'Login failed. Please try again.',
      }));
      throw error;
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    try {
      await axiosInstance.post('/api/users/logout');
      dispatch(authSlice.actions.clear_auth());

      window.location.reload();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }
);

// Socket Middleware
let socket: Socket;

const socketMiddleware = (store: any) => (next: any) => (action: any) => {
  if (action.type === 'web_socket_connection/connect') {
    socket = io('http://localhost:1337', {
      auth: {
        token: store.getState().auth.auth_token,
      },
    });

    socket.on('connect', () => {
      store.dispatch(webSocketConnectionSlice.actions.set_connection_status('connected'));
    });

    socket.on('disconnect', () => {
      store.dispatch(webSocketConnectionSlice.actions.set_connection_status('disconnected'));
    });

    socket.on('new_message', (data) => {
      store.dispatch(messagesSlice.actions.set_message_count(data.unread_count));
    });

    socket.on('order_status_update', (data) => {
      store.dispatch(notificationsSlice.actions.add_notification({
        id: Date.now().toString(),
        type: 'info',
        message: `Order ${data.order_id} status updated to ${data.new_status}`,
      }));
    });
  }

  return next(action);
};

// Persist Config
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'preferences', 'cart'],
};

// Root Reducer
// const rootReducer = {
//   auth: authSlice.reducer,
//   notifications: notificationsSlice.reducer,
//   messages: messagesSlice.reducer,
//   cart: cartSlice.reducer,
//   ui: uiSlice.reducer,
//   web_socket_connection: webSocketConnectionSlice.reducer,
//   preferences: preferencesSlice.reducer,
//   search: searchSlice.reducer,
// };
const rootReducer = combineReducers({
  auth: authSlice.reducer,
  notifications: notificationsSlice.reducer,
  messages: messagesSlice.reducer,
  cart: cartSlice.reducer,
  ui: uiSlice.reducer,
  web_socket_connection: webSocketConnectionSlice.reducer,
  preferences: preferencesSlice.reducer,
  search: searchSlice.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Store Configuration
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }).concat(socketMiddleware),
});

export const persistor = persistStore(store);

// Export actions
export const { set_auth, clear_auth } = authSlice.actions;
export const { add_notification, remove_notification, clear_notifications } = notificationsSlice.actions;
export const { set_message_count } = messagesSlice.actions;
export const { add_to_cart, remove_from_cart, update_cart_item_quantity, clear_cart } = cartSlice.actions;
export const { set_language, set_theme, toggle_search_overlay } = uiSlice.actions;
export const { set_connection_status } = webSocketConnectionSlice.actions;
export const { set_preferences } = preferencesSlice.actions;
export const { add_recent_search, clear_recent_searches } = searchSlice.actions;

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;