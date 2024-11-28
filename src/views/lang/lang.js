import React, { useEffect, useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
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
  cilInfo
} from '@coreui/icons'
import { useSelector } from 'react-redux';

const Lang = () => {
  const [langs, setLangs] = useState([]);
  const [infoLang, setInfoLang] = useState();
  const [modalVisible, setModalVisible] = useState(false)
  const apiURL = useSelector((state) => state.apiURL);  

  function handleView(id) {
    const lang = langs.find(item => item.id == id)
    setInfoLang(lang)
    setModalVisible(true);
  }
 
  function closeModal() {
    setModalVisible(false);
    setInfoLang(null);
  }

  useEffect(() => {
    fetch(`${apiURL}/api/lang`)
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          return res.json().then(err =>{
            throw new Error(err.message)
          })
        }
      })
      .then(langs => {
        setLangs(langs)
      })
      .catch(err => {
        console.error(err);
      })
  }, [apiURL])

  


  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader className='card__header'>
            <h3> Languages </h3>
            <CButton
              color="primary"
              className='flexButton'
              href='#/lang/0'
            >
              <CIcon icon={cilPlus}/>
              Create
            </CButton>
          </CCardHeader>
          <CCardBody>
            <p className="text-body-secondary small">
              You can add, update and delete <i>Languages</i>
            </p>
            <div className='table-container'>
              <CTable striped hover className='main-table'>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">ID</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Image (flag)</CTableHeaderCell>
                    <CTableHeaderCell scope="col">LangCode</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Name</CTableHeaderCell>
                    <CTableHeaderCell scope="col" className='table__options'>Options</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {
                    langs.map(lang => (
                      <CTableRow key={lang.id} align='middle'>
                        <CTableHeaderCell scope="row">{lang.id}</CTableHeaderCell>
                        <CTableDataCell>
                          {
                            lang.image ?
                            <div className='table__image--S'>
                              <img src={lang.image} alt={lang.name}/>
                            </div> :
                            <CIcon icon={cilImageBroken} title="There isn't image"/>
                          }
                        </CTableDataCell>
                        <CTableDataCell>{lang.langCode}</CTableDataCell>
                        <CTableDataCell>{lang.name}</CTableDataCell>
                        <CTableDataCell className='table__options--item'>
                          <CButton
                            color="info"
                            variant="outline"
                            title='View'
                            // disabled="false"
                            onClick={() => handleView(lang.id)}
                          >
                            <CIcon icon={cilDescription}/>
                          </CButton>

                          <CButton
                            color="warning"
                            variant="outline"
                            title='Edit'
                            // disabled="false"
                            href={`#/lang/${lang.id}`}
                          >
                            <CIcon icon={cilPencil}/>
                          </CButton>
                          <CButton
                            color="danger"
                            variant="outline"
                            title='Delete'
                            disabled={lang.langCode == "en"}
                          >
                            <CIcon icon={cilTrash}/>
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))
                  }
                </CTableBody>
              </CTable>
            </div>

            <CModal scrollable visible={modalVisible} onClose={() => closeModal()} className='infoModal'>
              <CModalHeader>
                <CModalTitle>Language</CModalTitle>
              </CModalHeader>
              <CModalBody>
                
                <div className='infoModal__item'>
                  <strong> ID </strong>
                  <p> {infoLang?.id} </p>
                </div>

                <hr/>

                <div className='infoModal__item'>
                  <strong> Image (flag) </strong>
                  {
                    infoLang?.image ?
                    <div className='infoModal__item--image'>
                      <img src={infoLang?.image} alt={infoLang?.name}/>
                    </div> :
                    <div className='infoModal__item--icon'>
                      <CIcon icon={cilImageBroken} title="There isn't image"/>
                    </div>
                  }
                </div>

                <hr/>

                <div className='infoModal__item'>
                  <strong> LangCode </strong>
                  <p> {infoLang?.langCode} </p>
                </div>

                <hr/>

                <div className='infoModal__item'>
                  <strong> Name </strong>
                  <p> {infoLang?.name} </p>
                </div>

              </CModalBody>
              <CModalFooter>
                <CButton color="secondary" onClick={() => setModalVisible(false)}>
                  Close
                </CButton>
              </CModalFooter>
            </CModal>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Lang
