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
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CPopover,
  CRow,
  CTable,
  CTableBody,
  CTableCaption,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react';
import {
  cilTrash,
  cilImageBroken,
  cilPencil,
  cilDescription,
  cilPlus,
  cilSave,
  cilXCircle
} from '@coreui/icons'
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

const Lang = () => {
  const apiURL = useSelector((state) => state.apiURL);  
  const {id} = useParams()
  const [lang, setLang] = useState({
    langCode: "",
    name: "",
    image: ""
  });


  useEffect(() => {
    id != 0 &&
    fetch(`${apiURL}/api/lang/${id}`)
      .then(res => {        
        if (res.ok) {
          return res.json();
        } else {
          return res.json().then(err =>{
            throw new Error(err.message)
          })
        }
      })
      .then(lang => {
        setLang(lang)
      })
      .catch(err => {
        console.error(err);
      })
  }, [apiURL, id])

//   console.log(lang);


  


  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader className='card__header'>
            <h3> Language </h3>
            <div className='card__header--btns'>
                <CButton
                    color="primary"
                    className='flexButton'
                    onClick={() => null}
                >
                <CIcon icon={cilSave}/>
                    Save
                </CButton>

                <CButton
                    color="secondary"
                    className='flexButton'
                    // onClick={() => null}
                    href='#/lang'
                >
                <CIcon icon={cilXCircle}/>
                    Cancel
                </CButton>
            </div>
          </CCardHeader>
          <CCardBody>
            <p className="text-body-secondary small">
              You can {id==0 ? "create" : "update"} <i>Language</i>
            </p>


            <CForm
                className="row g-3 needs-validation mt-4"
                noValidate
                // validated={validated}
                // onSubmit={handleSubmit}
            >
                <CCol md={12} className="mb-3 form__fileInput">
                    {
                        lang?.image &&
                        <div className='form__fileInput--image'>
                            <img src={lang?.image}/>
                        </div>
                    }

                    <CFormLabel htmlFor="image">Image (flag)</CFormLabel>
                    <CFormInput
                        type="file"
                        id="image"
                        accept='image/*'
                        // value={lang?.id}
                        // onChange={() => null}
                    />
                </CCol>
            
                <CCol md={6} className="mb-3">
                    <CFormLabel htmlFor="id">ID</CFormLabel>
                    <CFormInput
                        type="number"
                        id="id"
                        placeholder="Will create automatically"
                        disabled
                        value={lang?.id}
                    />
                </CCol>
                
                <CCol md={6} className="mb-3">
                    <CFormLabel htmlFor="langCode">Language Code</CFormLabel>
                    <CFormInput
                        type="text"
                        id="langCode"
                        placeholder="Language Code"
                        value={lang?.langCode}
                        onChange={() => null}
                    />
                </CCol>

                <CCol md={6} className="mb-3">
                    <CFormLabel htmlFor="name">Language Name</CFormLabel>
                    <CFormInput
                        type="text"
                        id="name"
                        placeholder="Language Name"
                        value={lang?.name}
                        onChange={() => null}
                    />
                </CCol>

                <div className='card__header--btns'>
                <CButton
                    color="primary"
                    className='flexButton'
                    onClick={() => null}
                >
                <CIcon icon={cilSave}/>
                    Save
                </CButton>

                <CButton
                    color="secondary"
                    className='flexButton'
                    href='#/lang'
                >
                <CIcon icon={cilXCircle}/>
                    Cancel
                </CButton>
            </div>

            </CForm>


            
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Lang
