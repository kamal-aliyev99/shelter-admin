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
  CFormSelect,
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
  productType_id: Yup.number().positive("ID cannot be less than 0").required('productType_id is required'),
  slug: Yup.string().max(255, 'slug must be at most 255 characters').required('Slug is required'),
  title: Yup.string().max(255, 'slug must be at most 255 characters').required("Title is required"),
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


//    CategoryUpdate    Component

const CategoryUpdate = () => {
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
    productType_id: 0,
    slug: "",
    title: "",
    translationID : null,
    langCode: lang
  });
  const [deleteImage, setDeleteImage] = useState(false);
  const [file, setFile] = useState(null);
  const [previewImage, setPreviewImage] = useState();
  const [options, setOptions] = useState([])

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
    lang == "en" && name == "title" &&
    setData(prew => ({
      ...prew,
      slug: slugify(value, { lower: true, strict: true })
    }))
  }


  function getData(id) {
    fetch(`${apiURL}/api/category/${id}?lang=${lang}`)
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

  function getOptionDatas() {
    fetch(`${apiURL}/api/productType?lang=${lang}`)
    .then(res => {
        if (res.ok) {
        return res.json();
        } else {
        return res.json().then(err =>{
            throw new Error(`${res.status}: ${err.message}`)
        })
        }
    })
    .then(datas => {
        const sortedData = datas.sort((a,b) => a.id - b.id);
        setOptions(sortedData)
    })
    .catch(err => {
        console.error(err);
    })
  }

  useEffect(() => {
    getData(id);
    getOptionDatas();
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
      formData.append('productType_id', data.productType_id);
      formData.append('slug', data.slug);
      formData.append('title', data.title);
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

      fetch(`${apiURL}/api/category/${id}`, {
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
            <h3> Category Update </h3>
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
                  href='#/category'
                  disabled={loading}
                >
                  <CIcon icon={cilXCircle}/>
                  Cancel
                </CButton>
            </div>
          </CCardHeader>
          <CCardBody>
            <p className="text-body-secondary small">
              You can update <i>Category</i>
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

                <CCol md={6} className="mb-3">
                    <CFormLabel htmlFor="productType">
                    ProductType
                    <span className='inputRequired' title='Required'>*</span>
                    </CFormLabel>
                    <CFormSelect
                        aria-label="Product-Type"
                        id='productType'
                        name='productType_id'
                        options={[
                            {label: "Select Product-Type", value: 0, disabled: true},
                            ...options.map(item => ({
                            label: item.title,
                            value: item.id
                            }))
                        ]}
                        onChange={handleData}
                        value={data.productType_id}
                        feedbackInvalid={validationErrors?.productType_id}
                        invalid={!!validationErrors?.productType_id}
                    />
                </CCol>

              <CCol md={6} className="mb-3">
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
                </CFormLabel>
                <CFormInput
                  type="text"
                  id="slug"
                  name="slug"
                  placeholder="Will create automatically"
                  value={data?.slug}
                  // onChange={handleData}
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
                  href='#/category'
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

export default CategoryUpdate
