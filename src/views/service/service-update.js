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
  cilImageBroken,
  cilPlus
} from '@coreui/icons'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import * as Yup from 'yup';
import Toast from '../../components/Toast';
import slugify from 'slugify';



//    V A L I D A T I O N

const validationSchema = Yup.object({
  id: Yup.number().positive("ID cannot be less than 0").required('id is required'),
  slug: Yup.string().max(255, 'slug must be at most 255 characters').required('Slug is required'),
  seoTitle: Yup.string().max(255, 'seoTitle must be at most 255 characters').optional(),
  seoDesc: Yup.string().optional(),
  seoKeywords: Yup.string().optional(),
  title: Yup.string().max(255, 'slug must be at most 255 characters').required("Title is required"),
  desc: Yup.string().max(255, 'slug must be at most 255 characters').nullable(),
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


//    ServiceUpdate    Component 

const ServiceUpdate = () => {
  const apiURL = useSelector((state) => state.apiURL);  
  const langs = useSelector((state) => state.langs);  
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
    benefitImage: undefined,
    slug: "",
    title: "",
    subTitle: "",
    shortDesc: "",
    desc: "",
    benefitsTitle: "",
    customersTitle: "",
    translationID : null,
    langCode: lang,
    specs: [],
    benefits: [],
    customers: [],
    seoTitle: "",
    seoDesc: "",
    seoKeywords: ""
  });
  const [ specs, setSpecs ] = useState({});
  const [ benefits, setBenefits ] = useState({});
  
  const [ deleteSpecsID, setDeleteSpecsID ] = useState([]);
  const [ deleteBenefitsID, setDeleteBenefitsID ] = useState([]);

  const [ customers, setCustomers ] = useState([]);
  const [ selectedCustomers, setSelectedCustomers ] = useState([]);
  const [ deletedCustomersID, setDeletedCustomersID ] = useState([]);

  const [deleteImage, setDeleteImage] = useState(false);
  const [deleteBenefitImage, setDeleteBenefitImage] = useState(false);
  const [file, setFile] = useState(null);
  const [benefitFile, setBenefitFile] = useState(null);
  const [previewImage, setPreviewImage] = useState();
  const [previewBenefitImage, setPreviewBenefitImage] = useState();

  function showNotf(ok, message) {
    dispatch({type: "set", toast: (Toast(ok, message))()})
  }

  function handleDeleteImage() {
    !previewImage && setDeleteImage(prew => !prew)
  }
  function handleDeleteBenefitImage() {
    !previewBenefitImage && setDeleteBenefitImage(prew => !prew)
  }

  function handleDeleteDownloadedImage() {
    setPreviewImage(undefined);
    setFile(null);
    document.getElementById("image").value = "";
  }

  function handleDeleteDownloadedBenefitImage() {
    setPreviewBenefitImage(undefined);
    setBenefitFile(null);
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
  

  function handleExistSpec (e) {
    const name = e.target.name;
    const value = e.target.value;
    const field = name.split("-")[1];
    const id = name.split("-")[2];    

    setData(prew => ({
        ...prew,
        specs: [
            ...[...prew.specs].filter(i => i.id != id),
            {
                ...[...prew.specs].find(i => i.id == id),
                [field]: value
            },
        ]
    }))
  }

  function handleDeleteSpec (id) {
    if (deleteSpecsID.includes(id)) {
        setDeleteSpecsID(prew => ([
            ...[...prew].filter(i => i != id)
        ]))
    } else {
        setDeleteSpecsID(prew => ([
            ...prew,
            id
        ]))
    }
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

  function handleExistBenefit (e) {
    const name = e.target.name;
    const value = e.target.value;
    const field = name.split("-")[1];
    const id = name.split("-")[2];    

    setData(prew => ({
        ...prew,
        benefits: [
            ...[...prew.benefits].filter(i => i.id != id),
            {
                ...[...prew.benefits].find(i => i.id == id),
                [field]: value
            },
        ]
    }))
  }

  function handleDeleteBenefit (id) {
    if (deleteBenefitsID.includes(id)) {
        setDeleteBenefitsID(prew => ([
            ...[...prew].filter(i => i != id)
        ]))
    } else {
        setDeleteBenefitsID(prew => ([
            ...prew,
            id
        ]))
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

  function handleDeleteCustomers (id) {
    if (deletedCustomersID.includes(id)) {
      setDeletedCustomersID(prew => prew.filter(i => i != id))
    } else {
      setDeletedCustomersID(prew => [...prew, id])
    }
  }


  function getData(id) {
    fetch(`${apiURL}/api/service/${id}?lang=${lang}`)
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
            title: "",
            subTitle: "",
            shortDesc: "",
            desc: "",
            customersTitle: "",
            benefitsTitle: ""
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
  

  async function handleSubmit(e) {
    e?.preventDefault();
    setLoading(true)

    const formValidationErrors = await validateForm(data);
    const imageValidationErrors = file && await validateImage(file);
    const benefitImageValidationErrors = benefitFile && await validateImage(benefitFile);
    
    if (formValidationErrors || imageValidationErrors) {
      const err = {...formValidationErrors, ...imageValidationErrors, ...benefitImageValidationErrors} 

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

      const specsArray = Object.values(specs);
      const benefitsArray = Object.values(benefits);
  
      specsArray.forEach(i => {
        titleCopyForEmptyLang(i);
      })
      benefitsArray.forEach(i => {
        titleCopyForEmptyLang(i);
      })

      const formData = new FormData();
      formData.append('id', id);
      formData.append('slug', data.slug);
      formData.append('seoTitle', data.seoTitle);
      formData.append('seoDesc', data.seoDesc);
      formData.append('seoKeywords', data.seoKeywords);
      formData.append('title', data.title);
      formData.append('subTitle', data.subTitle);
      formData.append('shortDesc', data.shortDesc);
      formData.append('desc', data.desc);
      formData.append('benefitsTitle', data.benefitsTitle);
      formData.append('customersTitle', data.customersTitle);
      data.translationID && formData.append("translationID", data.translationID); 
      formData.append("langCode", data.langCode);

      formData.append("specs", JSON.stringify(data.specs));
      formData.append("newSpecs", JSON.stringify(specsArray));
      formData.append("deletedSpecs", JSON.stringify(deleteSpecsID));

      formData.append("benefits", JSON.stringify(data.benefits));
      formData.append("newBenefits", JSON.stringify(benefitsArray));
      formData.append("deletedBenefits", JSON.stringify(deleteBenefitsID));
      
      formData.append("addCustomers", JSON.stringify(selectedCustomers));
      formData.append("deletedCustomers", JSON.stringify(deletedCustomersID));

      if (deleteImage) {
        formData.append('image', null);      
      } else if(file) {
        formData.append('image', file);
      }

      if (deleteBenefitImage) {
        formData.append('benefitImage', null);
      } else if(benefitFile) {
        formData.append('benefitImage', benefitFile);
      }


      // for (const element of formData) {
      //   console.log(element);
      // }

      fetch(`${apiURL}/api/service/${id}`, {
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
          benefitFile && handleDeleteDownloadedBenefitImage();
          setDeleteImage(false)
          setDeleteBenefitImage(false)
          setSpecs([])
          setDeleteSpecsID([])
          setBenefits([])
          setDeleteBenefitsID([])
          setSelectedCustomers([])
          setDeletedCustomersID([])
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
            <h3> Service Update </h3>
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
              You can update <i>Service</i>
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
                          id="deleteImage" 
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
                  <CFormLabel htmlFor="benefitImage" className='mb-3'>Benefit Image</CFormLabel>
                  <div className='fileInput'>
                    {
                      data?.benefitImage &&
                      <div className={`mb-3 fileInput__currentImage ${previewBenefitImage && "shadow-content"}`}>
                        <p className='mb-1'> Current Image: </p>
                        <div className={`fileInput__currentImage--image ${deleteBenefitImage && "shadow-content"}`}>
                          <img src={data?.benefitImage}/>
                        </div>
                        <CFormCheck 
                          id="deleteBenefitImage" 
                          className='mt-2'
                          label="Delete Image" 
                          checked={deleteBenefitImage}
                          onChange={handleDeleteBenefitImage}
                        />
                      </div>
                    }
                    {
                      (!data?.benefitImage && !previewBenefitImage) &&
                      <div className='mb-3'>
                        <CIcon icon={cilImageBroken} title="There isn't image"/>
                        <span> There isn't image </span>
                      </div>
                    }
                    {
                      previewBenefitImage &&
                      <div className='mb-3 fileInput__downloadImage'>
                        <p className='mb-1'>
                          { data?.benefitImage && "Changed to:" }
                        </p>
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
                  {
                    !deleteBenefitImage &&
                    <CFormInput
                      className='fileInput__input'
                      type="file"
                      id="benefitImage"
                      name='benefitImage'
                      accept='image/*'
                      onChange={(e) => setBenefitFile(e.target.files[0])}
                      feedbackInvalid={validationErrors?.benefitImage}
                      invalid={!!validationErrors?.benefitImage}
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

              <CCol md={12} className="mb-3">
                <CFormLabel htmlFor="subTitle">
                  SubTitle ({lang})
                </CFormLabel>
                <CFormInput
                  type="text"
                  id="subTitle"
                  name='subTitle'
                  placeholder={data?.translationID ? "subTitle" : "No Content this language"}
                  value={data?.subTitle || ""}
                  onChange={handleData}
                  feedbackInvalid={validationErrors?.subTitle}
                  invalid={!!validationErrors?.subTitle}
                />
              </CCol>

              <CCol md={12} className="mb-3">
                <CFormLabel htmlFor="shortDesc">
                  Short Description ({lang})
                </CFormLabel>
                <CFormInput
                  type="text"
                  id="shortDesc"
                  name='shortDesc'
                  placeholder={data?.translationID ? "ShortDesc" : "No Content this language"}
                  value={data?.shortDesc || ""}
                  onChange={handleData}
                  feedbackInvalid={validationErrors?.shortDesc}
                  invalid={!!validationErrors?.shortDesc}
                />
              </CCol>

              <CCol md={12} className="mb-3">
                <CFormLabel htmlFor="benefitsTitle">
                    Benefits Title ({lang})
                </CFormLabel>
                <CFormInput
                  type="text"
                  id="benefitsTitle"
                  name='benefitsTitle'
                  placeholder={data?.translationID ? "benefitsTitle" : "No Content this language"}
                  value={data?.benefitsTitle || ""}
                  onChange={handleData}
                  feedbackInvalid={validationErrors?.benefitsTitle}
                  invalid={!!validationErrors?.benefitsTitle}
                />
              </CCol>

              <CCol md={12} className="mb-3">
                <CFormLabel htmlFor="customersTitle">
                    Customers Title ({lang})
                </CFormLabel>
                <CFormInput
                  type="text"
                  id="customersTitle"
                  name='customersTitle'
                  placeholder={data?.translationID ? "CustomersTitle" : "No Content this language"}
                  value={data?.customersTitle || ""}
                  onChange={handleData}
                  feedbackInvalid={validationErrors?.customersTitle}
                  invalid={!!validationErrors?.customersTitle}
                />
              </CCol>

              <CCol md={12} className="mb-3">
                <CFormLabel htmlFor="desc">
                  Description ({data?.langCode})
                </CFormLabel>

                <CFormTextarea
                  className='form__textarea'
                  id="desc"
                  name="desc"
                  placeholder="description"
                  value={data?.desc}
                  onChange={handleData}
                  feedbackInvalid={validationErrors && validationErrors?.desc} 
                  invalid={!!validationErrors && !!validationErrors?.desc}
                />
              </CCol>

              <hr/>

                <CCol md={12} className='mb-3'>
                    <div className='sectionHeader mb-4'>
                        <h5> Specifications: </h5>
                    </div>

                    <CTable striped hover className='main-table'>
                        <CTableBody>
                            {
                            data?.specs?.map((data, index) => {
                                return (
                                <CTableRow 
                                    key={data.id} 
                                    align='middle'
                                    className="tableRow"
                                >
                                    <CTableHeaderCell scope="row" className='table-count'> {index+1}  </CTableHeaderCell>
                                    <CTableDataCell>
                                    <CCol md={12} className="mb-4">
                                        <CFormLabel htmlFor={`specs-title-${data.id}`}>
                                        Title of spec ({data.langCode}) 
                                        </CFormLabel>
                                        <CFormInput
                                        type="text"
                                        id={`specs-title-${data.id}`}
                                        name={`specs-title-${data.id}`}
                                        placeholder={`specs-title-${data.langCode}`}
                                        value={data.title}
                                        onChange={handleExistSpec}
                                        />
                                    </CCol>

                                    <CCol md={12} className="mb-3">
                                        <CFormLabel htmlFor={`specs-desc-${data.id}`}>
                                        Description of spec ({data.langCode})
                                        </CFormLabel>

                                        <CFormTextarea
                                        className='form__textarea'
                                        id={`specs-desc-${data.id}`}
                                        name={`specs-desc-${data.id}`}
                                        placeholder={ `specs-description-${data.langCode}`}
                                        value={data.desc}
                                        onChange={handleExistSpec}
                                        />
                                    </CCol>
                                    </CTableDataCell>
                                    <CTableHeaderCell scope="row" className='table__options'>
                                        <CFormCheck 
                                            id={`deleteSpec-${data.id}`}
                                            className='mt-2'
                                            label="Delete Spec" 
                                            checked={deleteSpecsID.includes(data.id)}
                                            onChange={() => handleDeleteSpec(data.id)}
                                        />
                                    </CTableHeaderCell>
                                </CTableRow>
                                )
                            })
                            }
                        </CTableBody>
                    </CTable>

                    <CCol md={12} className='mb-3'>

                        <div className='sectionHeader mb-4'>
                            <span> Add Specification: </span>
                            <CButton
                                color="primary"
                                className='flexButton'
                                onClick={addSpec}
                            >
                            <CIcon icon={cilPlus}/>   
                                New
                            </CButton>
                        </div>
                        {  Object.entries(specs).length ?
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
                            : null
                        }
                    </CCol>

                </CCol>




                        {/*       BENEFITS        */}



                <hr/>

                <CCol md={12} className='mb-3'>
                    <div className='sectionHeader mb-4'>
                        <h5> Benefits: </h5>
                    </div>

                    <CTable striped hover className='main-table'>
                        <CTableBody>
                            {
                            data?.benefits?.map((data, index) => {
                                return (
                                <CTableRow 
                                    key={data.id} 
                                    align='middle'
                                    className="tableRow"
                                >
                                    <CTableHeaderCell scope="row" className='table-count'> {index+1}  </CTableHeaderCell>
                                    <CTableDataCell>
                                    <CCol md={12} className="mb-4">
                                        <CFormLabel htmlFor={`benefit-title-${data.id}`}>
                                        Title of benefit ({data.langCode}) 
                                        </CFormLabel>
                                        <CFormInput
                                        type="text"
                                        id={`benefit-title-${data.id}`}
                                        name={`benefit-title-${data.id}`}
                                        placeholder={`benefit-title-${data.langCode}`}
                                        value={data.title}
                                        onChange={handleExistBenefit}
                                        />
                                    </CCol>

                                    <CCol md={12} className="mb-3">
                                        <CFormLabel htmlFor={`benefit-desc-${data.id}`}>
                                        Description of benefit ({data.langCode})
                                        </CFormLabel>

                                        <CFormTextarea
                                        className='form__textarea'
                                        id={`benefit-desc-${data.id}`}
                                        name={`benefit-desc-${data.id}`}
                                        placeholder={ `benefit-description-${data.langCode}`}
                                        value={data.desc}
                                        onChange={handleExistBenefit}
                                        />
                                    </CCol>
                                    </CTableDataCell>
                                    <CTableHeaderCell scope="row" className='table__options'>
                                        <CFormCheck 
                                            id={`deleteBenefit-${data.id}`}
                                            className='mt-2'
                                            label="Delete Benefit" 
                                            checked={deleteBenefitsID.includes(data.id)}
                                            onChange={() => handleDeleteBenefit(data.id)}
                                        />
                                    </CTableHeaderCell>
                                </CTableRow>
                                )
                            })
                            }
                        </CTableBody>
                    </CTable>

                    <CCol md={12} className='mb-3'>

                        <div className='sectionHeader mb-4'>
                            <span> Add Benefit: </span>
                            <CButton
                                color="primary"
                                className='flexButton'
                                onClick={addBenefit}
                            >
                            <CIcon icon={cilPlus}/>   
                                New
                            </CButton>
                        </div>
                        {  Object.entries(benefits).length ?
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
                                                              <CFormLabel htmlFor={`benefits-title-${translationData.langCode}-${key}`}>
                                                              Title of benefit ({translationData.langCode}) 
                                                              </CFormLabel>
                                                              <CFormInput
                                                              type="text"
                                                              id={`benefits-title-${translationData.langCode}-${key}`}
                                                              name={`benefits-title-${translationData.langCode}-${key}`}
                                                              placeholder={`benefits-title-${translationData.langCode}`}
                                                              value={translationData.title}
                                                              onChange={handleBenefit}
                                                              />
                                                          </CCol>

                                                          <CCol md={12} className="mb-3">
                                                              <CFormLabel htmlFor={`benefits-desc-${translationData.langCode}-${key}`}>
                                                              Description of benefit ({translationData.langCode})
                                                              </CFormLabel>

                                                              <CFormTextarea
                                                              className='form__textarea'
                                                              id={`benefits-desc-${translationData.langCode}-${key}`}
                                                              name={`benefits-desc-${translationData.langCode}-${key}`}
                                                              placeholder={ `benefits-description-${translationData.langCode}`}
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
                            : null
                        }
                    </CCol>
                </CCol>







                <CCol md={12} className='mb-3'>
                    <h5 className='mb-3'> Customers: </h5>

                    <p className='mb-2'> Current customers: </p>

                    <CTable striped hover className='main-table'>
                      <CTableBody>

                        {
                          data?.customers?.map((item, index) => (
                            <CTableRow 
                              key={item.id} 
                              align='middle'
                              className="tableRow"
                            >
                              <CTableHeaderCell scope="row" className='table-count'> {index+1}  </CTableHeaderCell>
                              <CTableDataCell scope="row" className='table-count'> {item.title}  </CTableDataCell>
                              <CTableHeaderCell scope="row" className='table__options'>
                                <CFormCheck 
                                  id={`deleteCustomer-${item.id}`}
                                  className='mt-2'
                                  label="Delete Customer" 
                                  checked={deletedCustomersID.includes(item.id)}
                                  onChange={() => handleDeleteCustomers(item.id)}
                                />
                              </CTableHeaderCell>

                            </CTableRow>
                          ))
                        }

                      </CTableBody>
                    </CTable>
    
                    <CFormLabel htmlFor={`customers`}>   
                        Add new Customers
                    </CFormLabel>
                    <CFormSelect
                        aria-label="Customers"
                        className='customers-select' 
                        id='customers'
                        multiple
                        onChange={() => null}
                        value={selectedCustomers}
                    >    
                        {
                            customers?.map(item => {
                              if (data?.customers?.some(i => i.customer_id == item.id)) {
                                return null
                              } else {
                                return (
                                  <option 
                                      key={item.id}
                                      value={item.id}
                                      // disabled={data?.customers?.some(i => i.customer_id == item.id)} 
                                      onClick={handleSelectedCustomers}
                                  >
                                      {item.title}
                                  </option>
                                ) 
                              }
                              
                            })
                        }
                    </CFormSelect>
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

export default ServiceUpdate
