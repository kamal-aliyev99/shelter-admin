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
  CFormSelect,
  CFormTextarea,
  CRow,
  CSpinner,
  CTab,
  CTabContent,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHeaderCell,
  CTableRow,
  CTabList,
  CTabPanel,
  CTabs
} from '@coreui/react'
import CIcon from '@coreui/icons-react';
import {
  cilSave,
  cilXCircle,
  cilTrash,
  cilPlus
} from '@coreui/icons'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
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
        title: Yup.string().max(255, 'title must be at most 255 characters'),
        subTitle: Yup.string().max(255, 'subTitle must be at most 255 characters').optional(),
        shortDesc: Yup.string().max(255, 'shortDesc must be at most 255 characters').optional(),
        benefitsTitle: Yup.string().max(255, 'benefitsTitle must be at most 255 characters').optional(),
        customersTitle: Yup.string().max(255, 'customersTitle must be at most 255 characters').optional(),
        desc: Yup.string().optional(),
        seoTitle: Yup.string().max(255, 'seoTitle must be at most 255 characters').optional(),
        seoDesc: Yup.string().optional(),
        seoKeywords: Yup.string().optional()
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


//    ServiceCreate    Component 

const ServiceCreate = () => {  
  const apiURL = useSelector((state) => state.apiURL);  
  const langs = useSelector((state) => state.langs);  
  const lang = useSelector((state) => state.lang);
  const nav = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState();
  const [data, setData] = useState({  
    slug: "",
    seoTitle: "",
    seoDesc: "",
    seoKeywords: "",
    translation: []
  });
  const [ customers, setCustomers ] = useState([]);
  const [ selectedCustomers, setSelectedCustomers ] = useState([]);
  const [ specs, setSpecs ] = useState({});
  const [ benefits, setBenefits ] = useState({});
  const [file, setFile] = useState(null);
  const [benefitFile, setbenefitFile] = useState(null);
  const [previewImage, setPreviewImage] = useState();
  const [previewBenefitImage, setPreviewBenefitImage] = useState();

  function showNotf(ok, message) {
    dispatch({type: "set", toast: (Toast(ok, message))()})
  }

  function handleDeleteDownloadedImage() {
    setPreviewImage(undefined);
    setFile(null);
    document.getElementById("image").value = "";
  }
  function handleDeleteDownloadedBenefitImage() {
    setPreviewBenefitImage(undefined);
    setbenefitFile(null);
    document.getElementById("benefitImage").value = "";
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
    if (benefitFile) {
      const previewUrl = URL.createObjectURL(benefitFile);
      setPreviewBenefitImage(previewUrl);
    } else {
      setPreviewBenefitImage("");
    }
  }, [benefitFile]) 

  useEffect(() => {
    if (!data.translation.length) {
      setData(prew => ({
        ...prew,
        translation : 
          langs.map(lang => ({
            langCode: lang,
            title: "",
            subTitle: "",
            shortDesc: "",
            desc: "",
            benefitsTitle: "",
            customersTitle: ""
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

  function handleSelectedCustomers (e) {
    const value = e.target.value;
    if (selectedCustomers.includes(value)) {
        setSelectedCustomers(prew => prew.filter(i => i != value))
    } else {
        setSelectedCustomers(prew => ([
            ...prew,
            e.target.value
        ]))
    }
  }  

  function addSpec () {
    setSpecs(prew => ({
        ...prew,
        [Date.now()]: langs.map(lang => ({
            langCode: lang,
            title: "",
            desc: ""
          }))
    }))
  }

  function deleteSpec (key) {
    setSpecs(prew => {
      const prewObj = {...prew};
      delete prewObj[key]
      return prewObj
    })
  }

  function handleSpec (e) {
    const name = e.target.name;
    const value = e.target.value;
    const field = name.split("-")[1];
    const langCode = name.split("-")[2];
    const key = name.split("-")[3];    

    setSpecs(prew => ({
      ...prew,
      [key]: [
        ...prew[key].filter(i => i.langCode != langCode),
        {
          ...prew[key].find(i => i.langCode == langCode),
          [field]: value
        }
      ]
    }))
  }  

  function addBenefit () {
    setBenefits(prew => ({
      ...prew,
      [Date.now()]: langs.map(lang => ({
          langCode: lang,
          title: "",
          desc: ""
        }))
  }))
  }

  function deleteBenefit (key) {
    setBenefits(prew => {
      const prewObj = {...prew};
      delete prewObj[key]
      return prewObj
    })
  }

  function handleBenefit (e) {
    const name = e.target.name;
    const value = e.target.value;
    const field = name.split("-")[1];
    const langCode = name.split("-")[2];
    const key = name.split("-")[3];    

    setBenefits(prew => ({
      ...prew,
      [key]: [
        ...prew[key].filter(i => i.langCode != langCode),
        {
          ...prew[key].find(i => i.langCode == langCode),
          [field]: value
        }
      ]
    }))
  }  

  async function handleSubmit(e) {
    e?.preventDefault();
    setLoading(true)

    const formValidationErrors = await validateForm(data);
    const imageValidationErrors = file && await validateImage(file);
    const benefitImageValidationErrors = benefitFile && await validateImage(benefitFile);
    
    if (formValidationErrors || imageValidationErrors || benefitImageValidationErrors) {

      let err = {...formValidationErrors, ...imageValidationErrors, ...benefitImageValidationErrors}       

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
      setValidationErrors(undefined);
      
      function titleCopyForEmptyLang (translation) {
        translation.forEach(item => {
          if (!item.title) {
            item.title = data.slug;
          }
        })
      }

      titleCopyForEmptyLang(data.translation)

      const specsArray = Object.values(specs);
      const benefitsArray = Object.values(benefits);
  
      specsArray.forEach(i => {
        titleCopyForEmptyLang(i);
      })
      benefitsArray.forEach(i => {
        titleCopyForEmptyLang(i);
      })


      const formData = new FormData();
      formData.append('slug', data.slug);
      formData.append('seoTitle', data.seoTitle);
      formData.append('seoDesc', data.seoDesc);
      formData.append('seoKeywords', data.seoKeywords);
      formData.append('translation', JSON.stringify(data.translation));
      formData.append("image", file || null) 
      formData.append("benefitImage", benefitFile || null) 
      formData.append("specs", JSON.stringify(specsArray)) 
      formData.append("benefits", JSON.stringify(benefitsArray)) 
      formData.append("customersID", JSON.stringify(selectedCustomers)) 

      fetch(`${apiURL}/api/service`, {
        method: "POST",
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
          nav(`/service/${data.data.id}`)
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

  function getCustomers () {
    fetch(`${apiURL}/api/customer`)
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
        setCustomers(sortedData)
      })
      .catch(err => {
        console.error(err);
      })
  }

  useEffect(() => {
    getCustomers();
  }, [])



  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader className='card__header'>
            <h3> Service Create </h3>
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
                    href='#/service'
                    disabled={loading}
                >
                  <CIcon icon={cilXCircle}/>
                  Cancel
                </CButton>
            </div>
          </CCardHeader>
          <CCardBody>
            <p className="text-body-secondary small">
              You can create <i>Service</i>
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

              <CCol md={12} className="mb-3">
                <CFormLabel htmlFor="benefitImage" className='mb-3'>Benefit Image</CFormLabel>
                <div className='fileInput'>
                  {
                    previewBenefitImage &&
                    <div className='mb-3 fileInput__downloadImage'>
                      <div className='fileInput__downloadImage--image'>
                        <img src={previewBenefitImage}/>

                        <span 
                          className='fileInput__downloadImage--delete' 
                          title='Delete'
                          onClick={handleDeleteDownloadedBenefitImage}
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
                  id="benefitImage"
                  name='benefitImage'
                  accept='image/*'
                  onChange={(e) => setbenefitFile(e.target.files[0])}
                  feedbackInvalid={validationErrors?.benefitImage}
                  invalid={!!validationErrors?.benefitImage}
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

              <CCol md={12} className='mb-3'>
                <h5> Translations: </h5>
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
                          
                          <CCol md={12} className="mb-4">
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

                          <CCol md={12} className="mb-4">
                            <CFormLabel htmlFor={`subTitle-${data.langCode}`}>
                              SubTitle ({data.langCode}) 
                            </CFormLabel>
                            <CFormInput
                              type="text"
                              id={`subTitle-${data.langCode}`}
                              name={`subTitle-${data.langCode}`}
                              placeholder={`subTitle-${data.langCode}`}
                              value={data?.subTitle}
                              onChange={(e) => handleData(e, data.langCode)}
                              feedbackInvalid={validationErrors && validationErrors[`subTitle-${data.langCode}`]} 
                              invalid={!!validationErrors && !!validationErrors[`subTitle-${data.langCode}`]}
                            />
                          </CCol>

                          <CCol md={12} className="mb-4">
                            <CFormLabel htmlFor={`shortDesc-${data.langCode}`}>
                              Short Description ({data.langCode}) 
                            </CFormLabel>
                            <CFormInput
                              type="text"
                              id={`shortDesc-${data.langCode}`}
                              name={`shortDesc-${data.langCode}`}
                              placeholder={`shortDesc-${data.langCode}`}
                              value={data?.shortDesc}
                              onChange={(e) => handleData(e, data.langCode)}
                              feedbackInvalid={validationErrors && validationErrors[`shortDesc-${data.langCode}`]} 
                              invalid={!!validationErrors && !!validationErrors[`shortDesc-${data.langCode}`]}
                            />
                          </CCol>

                          <CCol md={12} className="mb-4">
                            <CFormLabel htmlFor={`benefitsTitle-${data.langCode}`}>
                                Benefits Title ({data.langCode}) 
                            </CFormLabel>
                            <CFormInput
                              type="text"
                              id={`benefitsTitle-${data.langCode}`}
                              name={`benefitsTitle-${data.langCode}`}
                              placeholder={`benefitsTitle-${data.langCode}`}
                              value={data?.benefitsTitle}
                              onChange={(e) => handleData(e, data.langCode)}
                              feedbackInvalid={validationErrors && validationErrors[`benefitsTitle-${data.langCode}`]} 
                              invalid={!!validationErrors && !!validationErrors[`benefitsTitle-${data.langCode}`]}
                            />
                          </CCol>

                          <CCol md={12} className="mb-4">
                            <CFormLabel htmlFor={`customersTitle-${data.langCode}`}>
                                Customers Title ({data.langCode}) 
                            </CFormLabel>
                            <CFormInput
                              type="text"
                              id={`customersTitle-${data.langCode}`}
                              name={`customersTitle-${data.langCode}`}
                              placeholder={`customersTitle-${data.langCode}`}
                              value={data?.customersTitle}
                              onChange={(e) => handleData(e, data.langCode)}
                              feedbackInvalid={validationErrors && validationErrors[`customersTitle-${data.langCode}`]} 
                              invalid={!!validationErrors && !!validationErrors[`customersTitle-${data.langCode}`]}
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

              <hr/>

              <CCol md={12} className='mb-3'>
                <h5 className='mb-3'> Customers: </h5>

                <CFormLabel htmlFor={`customers`}>   
                    Select the Customers
                </CFormLabel>
                <CFormSelect
                    aria-label="Customers"
                    className='customers-select' 
                    id='customers'
                    multiple
                    onChange={() => null}
                    value={selectedCustomers}
                >
                  {/* <option disabled>Select the Customers</option> */}

                  {
                      customers?.map(item => (
                          <option 
                              key={item.id}
                              value={item.id} 
                              onClick={handleSelectedCustomers}
                          >
                              
                              {item.title}
                          </option>
                      ))
                  }
                </CFormSelect>
              </CCol>

              <hr/>

              <CCol md={12} className='mb-3'>
                <div className='sectionHeader mb-4'>
                    <h5> Specifications: </h5>
                    <CButton
                    color="primary"
                    className='flexButton'
                    onClick={addSpec}
                    >
                      <CIcon icon={cilPlus}/>   
                      New
                    </CButton>
                </div>

                <CCol md={12} className='mb-3'>

                    <span> Edit Specifications Translations: </span>
                    <CTabs activeItemKey="en" className='mt-2'>
                        <CTabList variant="tabs">
                            {
                            langs?.length &&
                            langs.map(lang => (
                                <CTab
                                  itemKey={lang} 
                                  key={lang}
                                >
                                {lang.toUpperCase()}
                                </CTab>
                            ))
                            }
                        </CTabList>
                        <CTabContent>
                            {
                              langs?.length &&
                              langs?.map((currentLang) => (
                                <CTabPanel className="p-3" itemKey={currentLang} key={currentLang}>

                                  <div className='table-container'>
                                    <CTable striped hover className='main-table'>
                                      <CTableBody>
                                        {
                                          Object.entries(specs).map(([key,data], index) => {
                                            const translationData = data.find(i => i.langCode == currentLang);
                                            return (
                                              <CTableRow 
                                                key={key} 
                                                align='middle'
                                                className="tableRow"
                                              >
                                                <CTableHeaderCell scope="row" className='table-count'> {index+1}  </CTableHeaderCell>
                                                <CTableDataCell>
                                                  <CCol md={12} className="mb-4">
                                                    <CFormLabel htmlFor={`specs-title-${translationData.langCode}-${key}`}>
                                                      Title of spec ({translationData.langCode}) 
                                                    </CFormLabel>
                                                    <CFormInput
                                                      type="text"
                                                      id={`specs-title-${translationData.langCode}-${key}`}
                                                      name={`specs-title-${translationData.langCode}-${key}`}
                                                      placeholder={`specs-title-${translationData.langCode}`}
                                                      value={translationData.title}
                                                      onChange={handleSpec}
                                                    />
                                                  </CCol>

                                                  <CCol md={12} className="mb-3">
                                                    <CFormLabel htmlFor={`specs-desc-${translationData.langCode}-${key}`}>
                                                      Description of spec ({translationData.langCode})
                                                    </CFormLabel>

                                                    <CFormTextarea
                                                      className='form__textarea'
                                                      id={`specs-desc-${translationData.langCode}-${key}`}
                                                      name={`specs-desc-${translationData.langCode}-${key}`}
                                                      placeholder={ `specs-description-${translationData.langCode}`}
                                                      value={translationData.desc}
                                                      onChange={handleSpec}
                                                    />
                                                  </CCol>
                                                </CTableDataCell>
                                                <CTableHeaderCell scope="row" className='table-count'>
                                                  <CButton
                                                    color="danger"
                                                    variant="outline"
                                                    title='Delete'
                                                    onClick={() => deleteSpec(key)}
                                                  >
                                                    <CIcon icon={cilTrash}/>
                                                  </CButton>
                                                </CTableHeaderCell>
                                              </CTableRow>
                                            )
                                          })
                                        }
                                      </CTableBody>
                                    </CTable>
                                  </div>
                                
                                </CTabPanel>
                              ))
                            }
                        </CTabContent>
                    </CTabs>
                </CCol>

              </CCol>


              <hr/>

              <CCol md={12} className='mb-3'>
                <div className='sectionHeader mb-4'>
                    <h5> Benefits: </h5>
                    <CButton
                    color="primary"
                    className='flexButton'
                    onClick={addBenefit}
                    >
                      <CIcon icon={cilPlus}/>   
                      New
                    </CButton>
                </div>

                <CCol md={12} className='mb-3'>

                    <span> Edit Benefits Translations: </span>
                    <CTabs activeItemKey="en" className='mt-2'>
                        <CTabList variant="tabs">
                            {
                            langs?.length &&
                            langs.map(lang => (
                                <CTab
                                  itemKey={lang} 
                                  key={lang}
                                >
                                {lang.toUpperCase()}
                                </CTab>
                            ))
                            }
                        </CTabList>
                        <CTabContent>
                            {
                              langs?.length &&
                              langs?.map((currentLang) => (
                                <CTabPanel className="p-3" itemKey={currentLang} key={currentLang}>

                                  <div className='table-container'>
                                    <CTable striped hover className='main-table'>
                                      <CTableBody>
                                        {
                                          Object.entries(benefits).map(([key,data], index) => {
                                            const translationData = data.find(i => i.langCode == currentLang);
                                            return (
                                              <CTableRow 
                                                key={key} 
                                                align='middle'
                                                className="tableRow"
                                              >
                                                <CTableHeaderCell scope="row" className='table-count'> {index+1}  </CTableHeaderCell>
                                                <CTableDataCell>
                                                  <CCol md={12} className="mb-4">
                                                    <CFormLabel htmlFor={`benefit-title-${translationData.langCode}-${key}`}>
                                                      Title of benefit ({translationData.langCode}) 
                                                    </CFormLabel>
                                                    <CFormInput
                                                      type="text"
                                                      id={`benefit-title-${translationData.langCode}-${key}`}
                                                      name={`benefit-title-${translationData.langCode}-${key}`}
                                                      placeholder={`benefit-title-${translationData.langCode}`}
                                                      value={translationData.title}
                                                      onChange={handleBenefit}
                                                    />
                                                  </CCol>

                                                  <CCol md={12} className="mb-3">
                                                    <CFormLabel htmlFor={`benefit-desc-${translationData.langCode}-${key}`}>
                                                      Description of benefit ({translationData.langCode})
                                                    </CFormLabel>

                                                    <CFormTextarea
                                                      className='form__textarea'
                                                      id={`benefit-desc-${translationData.langCode}-${key}`}
                                                      name={`benefit-desc-${translationData.langCode}-${key}`}
                                                      placeholder={ `benefit-description-${translationData.langCode}`}
                                                      value={translationData.desc}
                                                      onChange={handleBenefit}
                                                    />
                                                  </CCol>
                                                </CTableDataCell>
                                                <CTableHeaderCell scope="row" className='table-count'>
                                                  <CButton
                                                    color="danger"
                                                    variant="outline"
                                                    title='Delete'
                                                    onClick={() => deleteBenefit(key)}
                                                  >
                                                    <CIcon icon={cilTrash}/>
                                                  </CButton>
                                                </CTableHeaderCell>
                                              </CTableRow>
                                            )
                                          })
                                        }
                                      </CTableBody>
                                    </CTable>
                                  </div>
                                
                                </CTabPanel>
                              ))
                            }
                        </CTabContent>
                    </CTabs>
                </CCol>

              </CCol>


              <hr/>


              <CCol md={12} className='mb-3'>
                <div className='sectionHeader mb-4'>
                  <h5> SEO Datas: </h5>
                </div>
                     
                <CCol md={12} className="mb-3">
                  <CFormLabel htmlFor="seoTitle">
                    Seo title
                  </CFormLabel>

                  <CFormInput
                    type="text"
                    id="seoTitle"
                    name='seoTitle'
                    placeholder="Seo title"
                    value={data?.seoTitle || ""}
                    onChange={handleData}
                    feedbackInvalid={validationErrors?.seoTitle}
                    invalid={!!validationErrors?.seoTitle}
                  />
                </CCol>

                <CCol md={12} className="mb-3">
                  <CFormLabel htmlFor="seoDesc">
                    Seo description 
                  </CFormLabel>
  
                  <CFormTextarea
                    className='form__textarea'
                    id="seoDesc"
                    name="seoDesc"
                    placeholder="Seo description"
                    value={data?.seoDesc}
                    onChange={handleData}
                    feedbackInvalid={validationErrors && validationErrors?.seoDesc} 
                    invalid={!!validationErrors && !!validationErrors?.seoDesc}
                  />
                </CCol>

                <CCol md={12} className="mb-3">
                  <CFormLabel htmlFor="seoKeywords">
                    Seo keywords 
                  </CFormLabel>
  
                  <CFormTextarea
                    className='form__textarea'
                    id="seoKeywords"
                    name="seoKeywords"
                    placeholder="Seo Keywords"
                    value={data?.seoKeywords}
                    onChange={handleData}
                    feedbackInvalid={validationErrors && validationErrors?.seoKeywords} 
                    invalid={!!validationErrors && !!validationErrors?.seoKeywords}
                  />
                </CCol>

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
                  href='#/service'
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

export default ServiceCreate
