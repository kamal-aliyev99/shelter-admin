import React, { Suspense, useEffect, useState } from 'react'
import { BrowserRouter, HashRouter, Route, Router, Routes, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import { CSpinner, useColorModes } from '@coreui/react'
import './scss/style.scss'
import Toast from './components/Toast';

// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))

// Pages
const Login = React.lazy(() => import('./views/pages/login/Login'))
const Register = React.lazy(() => import('./views/pages/register/Register'))
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))

const App = () => {
  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const storedTheme = useSelector((state) => state.theme)

  const dispatch = useDispatch();
  const nav = useNavigate();
  const location = useLocation();
  const userData = useSelector((state) => state.userData)
  const apiURL = useSelector((state) => state.apiURL);

  function showNotf(ok, message) {
    dispatch({type: "set", toast: (Toast(ok, message))()})
  }

  function checkLogin () {
    fetch(`${apiURL}/api/auth/checkLogin`, {
      method: "POST",
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          return res.json().then(err =>{
            // console.error(err);
            throw new Error(`${res.status}: ${err.message}`)
          })
        }
      })
      .then((data) => {          
        // console.log('Success:', data);
        // nav(`/dashboard`)
        dispatch({type: "set", userData: data})
        // showNotf(true, data.message);
      })
      .catch((error) => {
        nav(`/login`)
        dispatch({type: "set", userData: null})
        // showNotf(false, `${error}`)
      })
  }

  useEffect(() => {
    checkLogin()
  }, [])

  useEffect(() => {
    if (userData === null) {
      nav(`/login`)
    } else if (location.pathname == "/login" && userData) {
      nav(`/dashboard`)
    }
  }, [location.pathname])

  useEffect(() => {
    if (userData && location.pathname == "/login") {
      nav(`/dashboard`)
    } else if (userData === null) {
      nav(`/login`)
    }
  }, [userData])

  

  // const storedLang = useSelector((state) => state.lang)
  // const [lang, setLang] = useState(storedLang)

  // setTimeout(() => {
  //   setLang("ru")
  //   dispatch({type: "set", lang})
  // }, 1000)

  // console.log(storedLang);
  

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.href.split('?')[1])
    const theme = urlParams.get('theme') && urlParams.get('theme').match(/^[A-Za-z0-9\s]+/)[0]
    if (theme) {
      setColorMode(theme)
    }

    if (isColorModeSet()) {
      return
    }

    setColorMode(storedTheme)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
      <Suspense
        fallback={
          <div className="pt-3 text-center">
            <CSpinner color="primary" variant="grow" />
          </div>
        }
      >
        <Routes>
          <Route exact path="/login" name="Login Page" element={<Login />} />
          <Route exact path="/register" name="Register Page" element={<Register />} />
          <Route exact path="/404" name="Page 404" element={<Page404 />} />
          <Route exact path="/500" name="Page 500" element={<Page500 />} />
          <Route path="*" name="Home" element={<DefaultLayout />} />
        </Routes>
      </Suspense>
  )
}

export default App
