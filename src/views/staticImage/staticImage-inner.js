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
import slugify from 'slugify';



//    V A L I D A T I O N

const validationSchema = Yup.object({
  id: Yup.number().min(0, "ID cannot be less than 0"),
  key: Yup.string().max(255, 'key must be at most 255 characters').required('key is required'),
  image: Yup.string().nullable(),
});

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


//    staticImage    Component

const StaticImageInner = () => {
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
    key: "",
    image: undefined
  });
  const [primaryInput, setPrimaryInput] = useState("")
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

  useEffect(() => {
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);
    } else {
      setPreviewImage("");
    }
  }, [file])  

  function getData(id) {
    fetch(`${apiURL}/api/staticImage/${id}`)
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
        setPrimaryInput(data.key)
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
      formData.append('key', data.key);
  
      if (deleteImage || (id == 0 && !file)) {
        formData.append('image', null);      
      } else if(id != 0 && !file) {
        formData.append('image', data.image);
      } else {
        formData.append('image', file);
      }
      

      fetch(`${apiURL}/api/staticImage/${id != 0 ? id : ""}`, {
        method: id == 0 ? "POST" : "PATCH",
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
            nav(`/staticImage/${data.data.id}`)
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
            <h3> Static Image </h3>
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
                    href='#/staticImage'
                    disabled={loading}
                >
                  <CIcon icon={cilXCircle}/>
                  Cancel
                </CButton>
            </div>
          </CCardHeader>
          <CCardBody>
            <p className="text-body-secondary small">
              You can {id==0 ? "create" : "update"} <i>Static Image</i>
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
                    onChange={handleData}
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
                    href='#/staticImage'
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

export default StaticImageInner
