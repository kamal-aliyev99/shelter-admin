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
  CSpinner,
  CTab,
  CTabContent,
  CTabList,
  CTabPanel,
  CTabs
} from '@coreui/react'
import CIcon from '@coreui/icons-react';
import {
  cilSave,
  cilXCircle,
  cilTrash
} from '@coreui/icons'
import { useDispatch, useSelector } from 'react-redux';
import { json, useNavigate, useParams } from 'react-router-dom';
import * as Yup from 'yup';
import Toast from '../../components/Toast';
import slugify from 'slugify';



//    V A L I D A T I O N

const validationSchema = Yup.object({
  slug: Yup.string().max(255, 'slug must be at most 255 characters').required('slug is required'),
  translation: Yup.array()
    .of(
      Yup.object().shape({
        langCode: Yup.string().max(10, 'langCode must be at most 10 characters').required('LangCode is required'),
        title: Yup.string().max(255, 'value must be at most 255 characters'),
        desc: Yup.string().optional()
      })
    )
    .min(1, 'At least one translation object is required') // Arrayda minimum 1 obyekt
    .required('Translation is required'),
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


//    OurValuesCreate    Component

const OurValuesCreate = () => {  
  const apiURL = useSelector((state) => state.apiURL);  
  const langs = useSelector((state) => state.langs);  
  const nav = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState();
  const [data, setData] = useState({  
    slug: "",
    translation: []
  });
  const [file, setFile] = useState(null);
  const [previewImage, setPreviewImage] = useState();

  function showNotf(ok, message) {
    dispatch({type: "set", toast: (Toast(ok, message))()})
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

  useEffect(() => {
    if (!data.translation.length) {
      setData(prew => ({
        ...prew,
        translation : 
          langs.map(lang => ({
            langCode: lang,
            title: "",
            desc: ""
          }))
      }))
    }
  }, [langs])  

  function handleData(e, lang) {
    const name = e.target.name;
    const value = e.target.value;
    
    if (lang) {
      const currentTranslation = data.translation.find((item) => item.langCode == lang)
      const field = name.split(`-${lang}`)[0];     

      setData(prew => ({
        ...prew,
        translation: [
          ...[...prew.translation].filter((item) => item.langCode != lang),
          {
            ...currentTranslation,
            [field]: value
          }
        ]
      }))

      if (lang == "en" && field == "title") {
        setData(prew => ({
          ...prew,
          slug: slugify(value, { lower: true, strict: true })
        }))
      }
      
    } else {
      setData(prew => {
        return {
          ...prew,
          [name]: value 
        }
      })
    }
  } 

  async function handleSubmit(e) {
    e?.preventDefault();
    setLoading(true)

    const formValidationErrors = await validateForm(data);
    const imageValidationErrors = file && await validateImage(file);
    
    if (formValidationErrors || imageValidationErrors) {

      let err = {...formValidationErrors, ...imageValidationErrors} 

      for (const [key, value] of Object.entries(formValidationErrors)) {
        if (key.includes("translation[")) {
          const trIndex = key.split("translation[")[1].split("]")[0];
          const trField = key.split("].")[1];
          const trErrorLang = data?.translation[trIndex].langCode;
          err[`${trField}-${trErrorLang}`] = value          
        }
      }

      showNotf(false, "Please enter correct data")
      setValidationErrors(err); 
      setLoading(false)

    } else {
      data.translation.forEach(item => {
        if (!item.title) {
          item.title = data.slug;
        }
      })
      
      setValidationErrors(undefined);

      const formData = new FormData();
      formData.append('slug', data.slug);
      formData.append('translation', JSON.stringify(data.translation));
      formData.append("image", file || null) 


      fetch(`${apiURL}/api/ourValues`, {
        method: "POST",
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
          nav(`/ourValues/${data.data.id}`)
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


  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader className='card__header'>
            <h3> Our Value Create </h3>
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
                    href='#/ourValues'
                    disabled={loading}
                >
                  <CIcon icon={cilXCircle}/>
                  Cancel
                </CButton>
            </div>
          </CCardHeader>
          <CCardBody>
            <p className="text-body-secondary small">
              You can create <i>Our Value</i>
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
                    previewImage &&
                    <div className='mb-3 fileInput__downloadImage'>
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
                  onChange={handleData}
                  disabled
                />
              </CCol>

              <CCol md={12} className='mb-3'>
                <span> Translations: </span>
                <CTabs activeItemKey="en" className='mt-2'>
                  <CTabList variant="tabs">
                    {
                      langs?.length &&
                      langs.map(lang => (
                        <CTab
                          itemKey={lang} 
                          key={lang}
                          disabled={
                            !data?.slug && lang != "en"
                          }
                          className={
                            validationErrors && Object.keys(validationErrors)?.some(i => i?.split("-")[1] == lang) ?
                            "translationError" :
                            ""
                          }
                        >
                          {lang.toUpperCase()}
                        </CTab>
                      ))
                    }
                  </CTabList>
                  <CTabContent>
                    {
                      data?.translation?.length &&
                      data?.translation?.map((data, index) => (
                        <CTabPanel className="p-3" itemKey={data.langCode} key={data.langCode}>
                          
                          <CCol md={12} className="mb-3">
                            <CFormLabel htmlFor={`title-${data.langCode}`}>
                              Title ({data.langCode}) 
                              {
                                data.langCode == "en" && 
                                <span className='inputRequired' title='Required'>*</span>
                              }
                            </CFormLabel>
                            <CFormInput
                              type="text"
                              id={`title-${data.langCode}`}
                              name={`title-${data.langCode}`}
                              placeholder={
                                data.langCode == "en" ?
                                `title-${data.langCode} (Required for Slug)` :
                                `title-${data.langCode} (default same as slug)`
                              }
                              value={data?.title}
                              onChange={(e) => handleData(e, data.langCode)}
                              feedbackInvalid={validationErrors && validationErrors[`title-${data.langCode}`]} 
                              invalid={!!validationErrors && !!validationErrors[`title-${data.langCode}`]}
                            />
                          </CCol>

                          <CCol md={12} className="mb-3">
                            <CFormLabel htmlFor={`desc-${data.langCode}`}>
                              Description ({data.langCode})
                            </CFormLabel>

                            <CFormTextarea
                              className='form__textarea'
                              id={`desc-${data.langCode}`}
                              name={`desc-${data.langCode}`}
                              placeholder={ `description-${data.langCode}`}
                              value={data?.desc}
                              onChange={(e) => handleData(e, data.langCode)}
                              feedbackInvalid={validationErrors && validationErrors[`desc-${data.langCode}`]} 
                              invalid={!!validationErrors && !!validationErrors[`desc-${data.langCode}`]}
                            />
                          </CCol>

                        </CTabPanel>
                      ))
                    }
                  </CTabContent>
                </CTabs>
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
                  href='#/ourValues'
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

export default OurValuesCreate
