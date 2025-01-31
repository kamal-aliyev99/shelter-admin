import React, { useEffect, useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormCheck,
  CFormInput,
  CFormLabel,
  CRow,
  CSpinner
} from '@coreui/react'
import CIcon from '@coreui/icons-react';
import {
  cilTrash,
  cilSave,
  cilXCircle,
  cilImageBroken
} from '@coreui/icons'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import * as Yup from 'yup';
import Toast from '../../components/Toast';



//    V A L I D A T I O N

const validationSchema = Yup.object({
  id: Yup.number().min(0, "ID cannot be less than 0"),
  title: Yup.string().max(255, 'key must be at most 255 characters').required('key is required'),
  image: Yup.string().nullable(),
}).noUnknown(true, "Unknown property is not allowed"); // olmayan filedler yazanda xeta vermir,,; ~  .noUnknown(true, "Unknown property is not allowed");

const imageValidation = Yup.mixed()
  .test('is-image', 'Only image files are allowed', (value) => {
    return value && value.type.startsWith('image/');
  })
  

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

const validateImage = async (file) => {
  try {
    await imageValidation.validate(file, { abortEarly: false });
    return;
  } catch (err) {
    const validationErrors = {};  
    validationErrors.image = err.inner[0].message;
    return validationErrors;
  }
};


//    Customer    Component

const CustomerInner = () => {
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
    title: "",
    image: undefined,
    showHomePage: false
  });
  const [deleteImage, setDeleteImage] = useState(false);
  const [file, setFile] = useState(null);
  const [previewImage, setPreviewImage] = useState();

  function showNotf(ok, message) {
    dispatch({type: "set", toast: (Toast(ok, message))()})
  }

  function handleDeleteImage() {
    !previewImage && setDeleteImage(prew => !prew)
  }

  function handleDeleteDownloadedImage() {
    setPreviewImage(undefined);
    setFile(null);
    document.getElementById("image").value = "";
  }

  function handleData(e) {
    const name = e.target.name;

    if (name == "showHomePage") {
        setData(prew => {
            return {
                ...prew,
                [name]: !prew.showHomePage 
            }
        })
    } else {
        setData(prew => {
            return {
                ...prew,
                [name]: e.target.value 
            }
        })
    }
  }

  useEffect(() => {
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);
    } else {
      setPreviewImage("");
    }
  }, [file])  

  function getData(id) {
    fetch(`${apiURL}/api/customer/${id}`)
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
    const imageValidationErrors = file && await validateImage(file);    
    
    if (formValidationErrors || imageValidationErrors) {
      const err = {
        ...formValidationErrors,
        ...imageValidationErrors
      } 

      showNotf(false, "Please enter correct data")
      setValidationErrors(err); 
      setLoading(false)

    } else {
      setValidationErrors(undefined);

      const formData = new FormData();
      id != 0 && formData.append('id', id);
      formData.append('title', data.title);
      formData.append('showHomePage', data.showHomePage);
  
      if (deleteImage || (id == 0 && !file)) {
        formData.append('image', null);      
      } else if(id != 0 && !file) {
        formData.append('image', data.image);
      } else {
        formData.append('image', file);
      }
      

      fetch(`${apiURL}/api/customer/${id != 0 ? id : ""}`, {
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
            nav(`/customer/${data.data.id}`)
          } 
          getData(data.data.id);
          file && handleDeleteDownloadedImage();
          setDeleteImage(false)
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
            <h3> Customer </h3>
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
                    href='#/customer'
                    disabled={loading}
                >
                  <CIcon icon={cilXCircle}/>
                  Cancel
                </CButton>
            </div>
          </CCardHeader>
          <CCardBody>
            <p className="text-body-secondary small">
              You can {id==0 ? "create" : "update"} <i>Customer</i>
            </p>


            <CForm
              className="row g-3 needs-validation mt-2"
              // noValidate
              // validated={validated}
              onSubmit={handleSubmit}
            >
                <CCol md={12} className="mb-3">
                  <CFormLabel htmlFor="image" className='mb-3'>Image</CFormLabel>
                  <div className='fileInput'>
                    {
                      data?.image &&
                      <div className={`mb-3 fileInput__currentImage ${previewImage && "shadow-content"}`}>
                        <p className='mb-1'> Current Image: </p>
                        <div className={`fileInput__currentImage--image ${deleteImage && "shadow-content"}`}>
                          <img src={data?.image}/>
                        </div>
                        <CFormCheck 
                          id="flexCheckDefault" 
                          className='mt-2'
                          label="Delete Image" 
                          checked={deleteImage}
                          onChange={handleDeleteImage}
                        />
                      </div>
                    }
                    {
                      (!data?.image && !previewImage) &&
                      <div className='mb-3'>
                        <CIcon icon={cilImageBroken} title="There isn't image"/>
                        <span> There isn't image </span>
                      </div>
                    }
                    {
                      previewImage &&
                      <div className='mb-3 fileInput__downloadImage'>
                        <p className='mb-1'>
                          { data?.image && "Changed to:" }
                        </p>
                        <div className='fileInput__downloadImage--image'>
                          <img src={previewImage}/>

                          <span 
                            className='fileInput__downloadImage--delete' 
                            title='Delete'
                            onClick={handleDeleteDownloadedImage}
                          >
                            <CIcon icon={cilTrash}/>
                          </span>
                        </div>
                      </div>
                    }
                  </div>
                  {
                    !deleteImage &&
                    <CFormInput
                      className='fileInput__input'
                      type="file"
                      id="image"
                      name='image'
                      accept='image/*'
                      onChange={(e) => setFile(e.target.files[0])}
                      feedbackInvalid={validationErrors?.image}
                      invalid={!!validationErrors?.image}
                    />
                  }
                </CCol>
            
                <CCol md={6} className="mb-3">
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
                  <CFormLabel htmlFor="title">
                    Title
                    <span className='inputRequired' title='Required'>*</span>
                  </CFormLabel>
                  <CFormInput
                    type="text"
                    id="title"
                    name="title"
                    placeholder="Title"
                    value={data.title}
                    onChange={handleData}
                    required
                    feedbackInvalid={validationErrors?.title}
                    invalid={!!validationErrors?.title}
                  />
                </CCol>

                <CCol md={6} className="mb-2">
                    <CFormCheck 
                        id="showHomePage" 
                        name='showHomePage'
                        className='mt-1'
                        label="Show HomePage" 
                        checked={data.showHomePage}
                        onChange={handleData}
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
                    href='#/customer'
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

export default CustomerInner
