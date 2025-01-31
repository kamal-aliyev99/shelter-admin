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
  CFormTextarea,
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
  id: Yup.number().min(0, "ID cannot be less than 0"),
  page: Yup.string().max(255, 'page must be at most 255 characters').required('page is required'),
  title: Yup.string().max(255, 'title must be at most 255 characters').required('title is required'),
  description: Yup.string().nullable(),
  keywords: Yup.string().nullable(),
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


//    pagesSeo    Component

const PagesSeoInner = () => {
  const apiURL = useSelector((state) => state.apiURL);  
  const nav = useNavigate();
  const dispatch = useDispatch();
  const {id} = useParams();
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState();
  const [data, setData] = useState({  
    id: 0,
    page: "",
    title: "",
    description: "",
    keywords: ""
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
      page: slugify(text, { lower: true, strict: true })
    }))
  }

  function getData(id) {
    fetch(`${apiURL}/api/pagesSeo/${id}`)
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
        setData(data)        
        setPrimaryInput(data.page)
      })
      .catch(err => {        
        setNotFound(true);
        setError(`${err}`)
      })
  }

  useEffect(() => {
    id != 0 &&
    getData(id)
    
  }, [apiURL, id])

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
      id != 0 && formData.append('id', id);
      formData.append('page', data.page);
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('keywords', data.keywords);
      

      fetch(`${apiURL}/api/pagesSeo/${id != 0 ? id : ""}`, {
        method: id == 0 ? "POST" : "PATCH",
        credentials: "include",
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
          if (id==0) {
            nav(`/pagesSeo/${data.data.id}`)
          } 
          getData(data.data.id);
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
            <h3> Page Seo </h3>
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
                    href='#/pagesSeo'
                    disabled={loading}
                >
                  <CIcon icon={cilXCircle}/>
                  Cancel
                </CButton>
            </div>
          </CCardHeader>
          <CCardBody>
            <p className="text-body-secondary small">
              You can {id==0 ? "create" : "update"} <i>Page Seo</i>
            </p>

            <CForm
              className="row g-3 needs-validation mt-2"
              // noValidate
              // validated={validated}
              onSubmit={handleSubmit}
            >
            
                <CCol md={12} className="mb-3">
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
                
                <CCol md={6} className="mb-3">
                  <CFormLabel htmlFor="pageInput">
                    Page
                    <span className='inputRequired' title='Required'>*</span>
                  </CFormLabel>
                  <CFormInput
                    type="text"
                    id="pageInput"
                    name="pageInput"
                    placeholder="page"
                    value={primaryInput}
                    onChange={handlePrimaryInput}
                    required
                    feedbackInvalid={validationErrors?.page}
                    invalid={!!validationErrors?.page}
                  />
                </CCol>

                <CCol md={6} className="mb-3">
                  <CFormLabel htmlFor="page">
                    Page (formatted)
                    {/* <span className='inputRequired' title='Required'>*</span> */}
                  </CFormLabel>
                  <CFormInput
                    type="text"
                    id="page"
                    name="page"
                    placeholder="Will create automatically"
                    value={data?.page}
                    // onChange={handleData}
                    disabled
                  />
                </CCol>

                <CCol md={12} className="mb-3">
                  <CFormLabel htmlFor="title">
                    Title
                    <span className='inputRequired' title='Required'>*</span>
                  </CFormLabel>
                  <CFormInput
                    type="text"
                    id="title"
                    name='title'
                    placeholder="title"
                    value={data?.title || ""}
                    onChange={handleData}
                    feedbackInvalid={validationErrors?.title}
                    invalid={!!validationErrors?.title}
                  />
                </CCol>

                <CCol md={12} className="mb-3">
                    <CFormLabel htmlFor="description">
                        Description 
                    </CFormLabel>
                    <CFormTextarea
                        className='form__textarea'
                        id={`description`}
                        name={`description`}
                        placeholder="description"
                        value={data?.description || ""}
                        onChange={(e) => handleData(e)}
                        feedbackInvalid={validationErrors?.description} 
                        invalid={!!validationErrors?.description}
                    />
                </CCol>

                <CCol md={12} className="mb-3">
                    <CFormLabel htmlFor="keywords">
                        Keywords 
                        <p> Note: <i>Words must be separated by `,`</i></p>
                    </CFormLabel>
                    <CFormTextarea
                        className='form__textarea'
                        id={`keywords`}
                        name={`keywords`}
                        placeholder="keywords"
                        value={data?.keywords || ""}
                        onChange={(e) => handleData(e)}
                        feedbackInvalid={validationErrors?.keywords} 
                        invalid={!!validationErrors?.keywords}
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
                    href='#/pagesSeo'
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

export default PagesSeoInner
