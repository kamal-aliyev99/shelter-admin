import { useState } from 'react'
import { legacy_createStore as createStore } from 'redux'

const initialState = {
  sidebarShow: true,
  theme: 'light',
  apiURL: "http://localhost:3030",
  lang: sessionStorage.getItem("lang") || "en",
  showLangs: false, // not used yet
  rerenderLang: 0,
  langs: [],
  toast: null
}

const changeState = (state = initialState, { type, ...rest }) => {
  switch (type) {
    case 'set':
      return { ...state, ...rest }
    default:
      return state
  }
}

const store = createStore(changeState)
export default store
