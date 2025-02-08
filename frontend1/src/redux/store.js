import { configureStore } from '@reduxjs/toolkit';

const initialState = {
  countdown: {
    days: 35,
    hours: 17,
    minutes: 50,
    seconds: 39,
  },
};

const countdownReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'UPDATE_COUNTDOWN':
      return { ...state, countdown: action.payload };
    default:
      return state;
  }
};

const store = configureStore({ reducer: countdownReducer });

export default store;
