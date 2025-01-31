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
  CFormTextarea,
  CRow,
  CSpinner
} from '@coreui/react'
import CIcon from '@coreui/icons-react';
import {
  cilSave,
  cilXCircle,
  cilTrash,
  cilImageBroken,
} from '@coreui/icons'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import * as Yup from 'yup';
import Toast from '../../components/Toast';
import slugify from 'slugify';



//    V A L I D A T I O N

const validationSchema = Yup.object({
  id: Yup.number().positive("ID cannot be less than 0").required('id is required'),
  translationID : Yup.number().positive().nullable(), // hemin dilde tercume yoxdusa null,, request'de gonderilmeyecek!
  langCode: Yup.string().max(3, "LangCode must be at most 3 characters!"),
  linkedin: Yup.string().url().max(255, 'link must be at most 255 characters').required(),
  name: Yup.string().max(255, 'name must be at most 255 characters'),
  position: Yup.string().max(255, 'position must be at most 255 characters').optional()
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

const imageValidation = Yup.mixed()
  .test('is-image', 'Only image files are allowed', (value) => {
    return value && value.type.startsWith('image/');
  })

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


//    TeamUpdate    Component

const TeamUpdate = () => {
  const apiURL = useSelector((state) => state.apiURL);  
  const lang = useSelector((state) => state.lang);  
  const dispatch = useDispatch();
  const {id} = useParams();
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState();
  const [data, setData] = useState({  
    id: id,
    image: undefined,
    translationID : null,
    langCode: lang,
    linkedin: "",
    name: "",
    position: ""
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

  useEffect(() => {
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);
    } else {
      setPreviewImage("");
    }
  }, [file])  

  function handleData(e) {
    const name = e.target.name;
    const value = e.target.value;
    setData(prew => {
      return {
        ...prew,
        [name]: value 
      }
    })
  }


  function getData(id) {
    fetch(`${apiURL}/api/team/${id}?lang=${lang}`)
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
            name: "", 
            position: "", 
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
    const imageValidationErrors = file && await validateImage(file);
    
    if (formValidationErrors || imageValidationErrors) {
      const err = {...formValidationErrors, ...imageValidationErrors} 

      showNotf(false, "Please enter correct data")
      setValidationErrors(err); 
      setLoading(false)

    } else {
      setValidationErrors(undefined);

      const formData = new FormData();
      formData.append('id', id);
      formData.append('name', data.name);
      formData.append('position', data.position);
      formData.append('linkedin', data.linkedin);
      data.translationID && formData.append("translationID", data.translationID); 
      formData.append("langCode", data.langCode);

      if (deleteImage) {
        formData.append('image', null);
      } else if(file) {
        formData.append('image', file);
      }

      // for (const element of formData) {
      //   console.log(element);
      // }

      fetch(`${apiURL}/api/team/${id}`, {
        method: "PATCH",
        credentials: "include",
        body: formData,
      })
        .then((res) => {          
          if (res.ok) {
            return res.json();
          } else {
            return res.json().then(err =>{
              console.error(err);
              throw new Error(`${res.status}: ${err.message}`)
            })
          }
        })
        .then((data) => {          
          console.log('Success:', data); 
          getData(id);
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
            <h3> Team Member Update </h3>
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
                  href='#/team'
                  disabled={loading}
                >
                  <CIcon icon={cilXCircle}/>
                  Cancel
                </CButton>
            </div>
          </CCardHeader>
          <CCardBody>
            <p className="text-body-secondary small">
              You can update <i>Team Member</i>
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

              <CCol md={12} className="mb-3">
                <CFormLabel htmlFor="name">
                  Name ({lang})
                  <span className='inputRequired' title='Required'>*</span>
                </CFormLabel>
                <CFormInput
                  type="text"
                  id="name"
                  name='name'
                  placeholder={data?.translationID ? "Name" : "No Content this language"}
                  value={data?.name || ""}
                  onChange={handleData}
                  feedbackInvalid={validationErrors?.name}
                  invalid={!!validationErrors?.name}
                />
              </CCol>

              <CCol md={12} className="mb-3">
                <CFormLabel htmlFor="position">
                  Position ({lang})
                </CFormLabel>
                <CFormInput
                  type="text"
                  id="position"
                  name='position'
                  placeholder={data?.translationID ? "Position" : "No Content this language"}
                  value={data?.position || ""}
                  onChange={handleData}
                  feedbackInvalid={validationErrors?.position}
                  invalid={!!validationErrors?.position}
                />
              </CCol>

              <CCol md={12} className="mb-3">
                <CFormLabel htmlFor="linkedin">
                  Linkedin link
                  <span className='inputRequired' title='Required'>*</span>
                </CFormLabel>
                <CFormInput
                  type="text"
                  id="linkedin"
                  name='linkedin'
                  placeholder="Linkedin link"
                  value={data?.linkedin || ""}
                  onChange={handleData}
                  feedbackInvalid={validationErrors?.linkedin}
                  invalid={!!validationErrors?.linkedin}
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
                  href='#/team'
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

export default TeamUpdate
