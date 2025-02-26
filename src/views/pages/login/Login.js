import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import Toast from '../../../components/Toast';
import { useDispatch, useSelector } from 'react-redux'

const Login = () => {
  const apiURL = useSelector((state) => state.apiURL); 
  const dispatch = useDispatch();

  function showNotf(ok, message) {
    dispatch({type: "set", toast: (Toast(ok, message))()})
  }

  const [formData, setFormData] = useState({  
    login: "",
    password: []
  });
  const [ error, setError ] = useState()

  function handleData (e) {
    const name = e.target.name;
    const value = e.target.value;

    setFormData(prew => ({
      ...prew,
      [name]: value
    }))
  }

  function handleSubmit (e) {
    e.preventDefault();

    if (!formData.login || !formData.password) {
      setError("Login and Password required")
      return;
    }

    const form = new FormData();
    form.append("login", formData.login);
    form.append("password", formData.password);

    fetch(`${apiURL}/api/auth/login`, {
      method: "POST",
      credentials: "include",  // Cookie-lərin alınmasını təmin edir
      body: form,
    })
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          return res.json().then(err =>{
            // console.error(err);
            throw new Error(`${err.message}`)
          })
        }
      })
      .then((data) => {          
        // console.log('Success:', data);
        // nav(`/`)
        console.log(data);
        
        dispatch({type: "set", userData: data})
        // showNotf(true, data.message);
      })
      .catch((error) => {        
        // showNotf(false, `${error}`)
        setError(`${error.message}`)
      })
  }  


  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={5}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm onSubmit={handleSubmit}>
                    <h1>Login</h1>
                    <p className="text-body-secondary">Sign In to your account</p>
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        placeholder="Login" 
                        autoComplete="login"
                        id="login"
                        name="login"
                        value={formData.login}
                        onChange={handleData}
                      />
                    </CInputGroup>
                    <CInputGroup className="mb-2">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Password"
                        autoComplete="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleData}
                      />
                    </CInputGroup>
                    {
                      error ?
                      <p className='loginError mb-3'> {error} </p> : 
                      null
                    }
                    <CRow>
                      <CCol xs={6}>
                        <CButton color="primary" className="px-4" type='submit'>
                          Login
                        </CButton>
                      </CCol>
                      {/* <CCol xs={6} className="text-right">
                        <CButton color="link" className="px-0">
                          Forgot password?
                        </CButton>
                      </CCol> */}
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
              {/* <CCard className="text-white bg-primary py-5" style={{ width: '44%' }}>
                <CCardBody className="text-center">
                  <div>
                    <h2>Sign up</h2>
                    <p>
                      Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
                      tempor incididunt ut labore et dolore magna aliqua.
                    </p>
                    <Link to="/register">
                      <CButton color="primary" className="mt-3" active tabIndex={-1}>
                        Register Now!
                      </CButton>
                    </Link>
                  </div>
                </CCardBody>
              </CCard> */}
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
