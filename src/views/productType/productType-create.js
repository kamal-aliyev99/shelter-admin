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
} from '@coreui/icons'
import { useDispatch, useSelector } from 'react-redux';
import { json, useNavigate, useParams } from 'react-router-dom';
import * as Yup from 'yup';
import Toast from '../../components/Toast';
import slugify from 'slugify';



//    V A L I D A T I O N

const validationSchema = Yup.object({
  slug: Yup.string().max(255, 'Slug must be at most 255 characters').required('key is required'),
  translation: Yup.array()
    .of(
      Yup.object().shape({
        langCode: Yup.string().max(10, 'LangCode must be at most 10 characters').required('LangCode is required'),
        title: Yup.string().max(255, 'Title must be at most 255 characters')
      })
    )
    .min(1, 'At least one translation object is required') // Arrayda minimum 1 obyekt
    .required('Translation is required'),
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

const ProductTypeCreate = () => {  
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
//   const [primaryInput, setPrimaryInput] = useState("")

  function showNotf(ok, message) {
    dispatch({type: "set", toast: (Toast(ok, message))()})
  }

  useEffect(() => {
    if (!data.translation.length) {
      setData(prew => ({
        ...prew,
        translation : 
          langs.map(lang => ({
            langCode: lang,
            title: ""
          }))
      }))
    }
  }, [langs])  

  function handleData(e, lang) {
    const name = e.target.name;
    const value = e.target.value;
    if (lang) {
      const currentTranslation = data.translation.find((item) => item.langCode == lang)
      const field = name.split(`-${lang}`)[0]        

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
  

//   function handlePrimaryInput(e) {
//     const text = e.target.value;
//     setPrimaryInput(text);
//     setData(prew => ({
//       ...prew,
//       key: slugify(text, { lower: true, strict: true })
//     }))
//   }  
  

  async function handleSubmit(e) {
    e?.preventDefault();
    setLoading(true)

    const formValidationErrors = await validateForm(data);
    
    if (formValidationErrors) {

      let err = {...formValidationErrors} 

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

      fetch(`${apiURL}/api/productType`, {
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
          nav(`/productType/${data.data.id}`)
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
            <h3> Product Type Create </h3>
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
              You can create <i>Product Type</i>
            </p>

            <CForm
              className="row g-3 needs-validation mt-2"
              // noValidate
              // validated={validated}
              onSubmit={handleSubmit}
            >
                
                {/* <CCol md={6} className="mb-3">
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
                </CCol> */}

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
                              "translationError" : ""
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
                                    `Title-${data.langCode} (Required for Slug)` :
                                    `Title-${data.langCode} (default same as slug)`
                                  }
                                value={data?.title}
                                onChange={(e) => handleData(e, data.langCode)}
                                feedbackInvalid={validationErrors && validationErrors[`title-${data.langCode}`]} 
                                invalid={!!validationErrors && !!validationErrors[`title-${data.langCode}`]}
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

export default ProductTypeCreate
