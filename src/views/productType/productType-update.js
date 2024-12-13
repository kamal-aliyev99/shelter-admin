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
  id: Yup.number().positive("ID cannot be less than 0"),
  slug: Yup.string().max(255, 'Key must be at most 255 characters').required('key is required'),
  title: Yup.string().max(255, 'Value must be at most 255 characters').required("Value is required"),
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


//    productType    Component

const ProductTypeUpdate = () => {
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
    slug: "",
    title: "",
    translationID : null,
    langCode: lang
  });

  function showNotf(ok, message) {
    dispatch({type: "set", toast: (Toast(ok, message))()})
  }

  function handleData(e) {
    const name = e.target.name;
    const value = e.target.value;
    setData(prew => {
      return {
        ...prew,
        [name]: value 
      }
    })
    if (name == "title" && lang == "en") {
      setData(prew => ({
        ...prew,
        slug: slugify(value, { lower: true, strict: true })
      }))
    }
  }

  function getData(id) {
    fetch(`${apiURL}/api/productType/${id}?lang=${lang}`)
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
            title: ""
          })
        }        
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
      formData.append('slug', data.slug);
      formData.append('title', data.title);
      data.translationID && formData.append("translationID", data.translationID); 
      formData.append("langCode", data.langCode);

      fetch(`${apiURL}/api/productType/${id}`, {
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
            <h3> Product Type Update </h3>
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
                  href='#/productType'
                  disabled={loading}
                >
                  <CIcon icon={cilXCircle}/>
                  Cancel
                </CButton>
            </div>
          </CCardHeader>
          <CCardBody>
            <p className="text-body-secondary small">
              You can update <i>Product Type</i>
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
                  <CFormLabel htmlFor="slug">
                    Slug (formatted)
                    {/* <span className='inputRequired' title='Required'>*</span> */}
                  </CFormLabel>
                  <CFormInput
                    type="text"
                    id="slug"
                    name="slug"
                    placeholder="Will create automatically"
                    value={data?.slug}
                    disabled
                  />
                </CCol>

                <CCol md={12} className="mb-3">
                  <CFormLabel htmlFor="title">
                    Title ({lang})
                    <span className='inputRequired' title='Required'>*</span>
                  </CFormLabel>
                  <CFormInput
                    type="text"
                    id="title"
                    name='title'
                    placeholder={data?.translationID ? "Title" : "No Content this language"}
                    value={data?.title || ""}
                    onChange={handleData}
                    feedbackInvalid={validationErrors?.title}
                    invalid={!!validationErrors?.title}
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
                    href='#/productType'
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

export default ProductTypeUpdate
