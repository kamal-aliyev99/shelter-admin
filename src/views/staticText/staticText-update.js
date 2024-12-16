import React, { useEffect, useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CRow,
  CSpinner
} from '@coreui/react'
import CIcon from '@coreui/icons-react';
import {
  cilSave,
  cilXCircle,
} from '@coreui/icons'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import * as Yup from 'yup';
import Toast from '../../components/Toast';
import slugify from 'slugify';



//    V A L I D A T I O N

const validationSchema = Yup.object({
  id: Yup.number().positive("ID cannot be less than 0").required('id is required'),
  key: Yup.string().max(255, 'Key must be at most 255 characters').required('key is required'),
  value: Yup.string().max(255, 'Value must be at most 255 characters').required("Value is required"),
  translationID : Yup.number().positive().nullable(), // hemin dilde tercume yoxdusa null,, request'de gonderilmeyecek!
  langCode: Yup.string().max(10, "LangCode must be at most 10 characters!")
});

const validateForm = async (formData) => {
  try {
    await validationSchema.validate(formData, { abortEarly: false });
    return;
  } catch (err) {
    const validationErrors = {};
    err.inner.forEach((error) => {
      validationErrors[error.path] = error.message;
    });
    return validationErrors;
  }
};


//    Static Text    Component

const StaticTextUpdate = () => {
  const apiURL = useSelector((state) => state.apiURL);  
  const lang = useSelector((state) => state.lang);  
  const dispatch = useDispatch();
  const {id} = useParams();
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState();
  const [data, setData] = useState({  
    id: 0,
    key: "",
    value: "",
    translationID : null,
    langCode: lang
  });
  const [primaryInput, setPrimaryInput] = useState("")

  function showNotf(ok, message) {
    dispatch({type: "set", toast: (Toast(ok, message))()})
  }

  function handleData(e) {
    setData(prew => {
      return {
        ...prew,
        [e.target.name]: e.target.value 
      }
    })
  }

  function handlePrimaryInput(e) {
    const text = e.target.value;
    setPrimaryInput(text);
    setData(prew => ({
      ...prew,
      key: slugify(text, { lower: true, strict: true })
    }))
  }

  function getData(id) {
    fetch(`${apiURL}/api/staticText/${id}?lang=${lang}`)
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          return res.json().then(err =>{
            // console.error(err);
            throw new Error(`${res.status}: ${err.message}`)
          })
        }
      })
      .then(data => {        
        if (data.translationID) {
          setData(data)
        } else {
          setData({
            ...data,
            langCode: lang,
            value: ""
          })
        }
        
        setPrimaryInput(data.key)
      })
      .catch(err => {        
        setNotFound(true);
        setError(`${err}`)
      })
  }

  useEffect(() => {
    getData(id)    
  }, [apiURL, id, lang])

  async function handleSubmit(e) {
    e?.preventDefault();
    setLoading(true)

    const formValidationErrors = await validateForm(data);
    
    if (formValidationErrors) {
      const err = {...formValidationErrors} 

      showNotf(false, "Please enter correct data")
      setValidationErrors(err); 
      setLoading(false)

    } else {
      setValidationErrors(undefined);

      const formData = new FormData();
      formData.append('id', id);
      formData.append('key', data.key);
      formData.append('value', data.value);
      data.translationID && formData.append("translationID", data.translationID); 
      formData.append("langCode", data.langCode);

      fetch(`${apiURL}/api/staticText/${id}`, {
        method: "PATCH",
        body: formData,
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
          getData(id);
          showNotf(true, data.message);
        })
        .catch((error) => {
          showNotf(false, `${error}`)
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }  

  
  if (notFound) {
    return ( 
      <div className='error-container'>
        {error}
      </div>
    )
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader className='card__header'>
            <h3> Static Text Update </h3>
            <div className='card__header--btns'>
                <CButton
                  color="primary"
                  className='flexButton'
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  <CIcon icon={cilSave}/>
                  Save
                </CButton>

                <CButton
                  color="secondary"
                  className='flexButton'
                  // onClick={() => null}
                  href='#/staticText'
                  disabled={loading}
                >
                  <CIcon icon={cilXCircle}/>
                  Cancel
                </CButton>
            </div>
          </CCardHeader>
          <CCardBody>
            <p className="text-body-secondary small">
              You can update <i>Static Text</i>
            </p>

            <CForm
              className="row g-3 needs-validation mt-2"
              // noValidate
              // validated={validated}
              onSubmit={handleSubmit}
            >
            
                <CCol md={4} className="mb-3">
                  <CFormLabel htmlFor="id">
                    ID 
                  </CFormLabel>
                  <CFormInput
                    type="number"
                    id="id"
                    name='id'
                    placeholder="Will create automatically"
                    disabled
                    value={data?.id || ""}
                  />
                </CCol>

                <CCol md={4} className="mb-3">
                  <CFormLabel htmlFor="translationID">
                  Translation ID
                  </CFormLabel>
                  <CFormInput
                    type="number"
                    id="translationID"
                    name='translationID'
                    placeholder="Will create automatically"
                    disabled
                    value={data?.translationID || ""}
                  />
                </CCol>

                <CCol md={4} className="mb-3">
                  <CFormLabel htmlFor="langCode">
                    Lang Code
                  </CFormLabel>
                  <CFormInput
                    type="text"
                    id="langCode"
                    name='langCode'
                    placeholder="LangCode"
                    disabled
                    value={data?.langCode || ""}
                  />
                </CCol>
                
                <CCol md={6} className="mb-3">
                  <CFormLabel htmlFor="keyInput">
                    Key
                    <span className='inputRequired' title='Required'>*</span>
                  </CFormLabel>
                  <CFormInput
                    type="text"
                    id="keyInput"
                    name="keyInput"
                    placeholder="Key"
                    value={primaryInput}
                    onChange={handlePrimaryInput}
                    required
                    feedbackInvalid={validationErrors?.key}
                    invalid={!!validationErrors?.key}
                  />
                </CCol>

                <CCol md={6} className="mb-3">
                  <CFormLabel htmlFor="key">
                    Key (formatted)
                    {/* <span className='inputRequired' title='Required'>*</span> */}
                  </CFormLabel>
                  <CFormInput
                    type="text"
                    id="key"
                    name="key"
                    placeholder="Will create automatically"
                    value={data?.key}
                    // onChange={handleData}
                    disabled
                  />
                </CCol>

                <CCol md={12} className="mb-3">
                  <CFormLabel htmlFor="value">
                    Value ({lang})
                    <span className='inputRequired' title='Required'>*</span>
                  </CFormLabel>
                  <CFormInput
                    type="text"
                    id="value"
                    name='value'
                    placeholder={data?.translationID ? "Value" : "No Content this language"}
                    value={data?.value || ""}
                    onChange={handleData}
                    feedbackInvalid={validationErrors?.value}
                    invalid={!!validationErrors?.value}
                  />
                </CCol>

                <div className='card__header--btns'>
                  <CButton
                    // type='submit'
                    color="primary"
                    className='flexButton'
                    onClick={handleSubmit}
                  >
                    <CIcon icon={cilSave}/>
                    Save
                  </CButton>

                  <CButton
                    color="secondary"
                    className='flexButton'
                    href='#/staticText'
                  >
                    <CIcon icon={cilXCircle}/>
                    Cancel
                  </CButton>
                </div>
            </CForm>
            {
              loading &&
              <div className='cardLoading'>
                <CSpinner color="warning"/>
              </div>
            }
          </CCardBody>
        </CCard>        
      </CCol>
    </CRow>
  )
}

export default StaticTextUpdate
