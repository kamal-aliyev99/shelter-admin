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
  CRow,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react';
import {
  cilTrash,
  cilPencil,
  cilDescription,
  cilPlus,
} from '@coreui/icons'
import { useDispatch, useSelector } from 'react-redux';
import Toast from '../../components/Toast';

const PagesSeo = () => {
  const dispatch = useDispatch();
  const [datas, setDatas] = useState([]);
  const [selectedData, setSelectedData] = useState();
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const apiURL = useSelector((state) => state.apiURL);  
  const [loadingIDs, setLoadingIDs] = useState([])

  function showNotf(ok, message) {
    dispatch({type: "set", toast: (Toast(ok, message))()})
  }

  function handleView(data) {
    setSelectedData(data)
    setModalVisible(true);
  }
 
  function closeModal() {
    setModalVisible(false);
    setSelectedData(null);
  }

  function openConfirmModal(data) {
    setSelectedData(data)
    setConfirmModalVisible(true)    
  }

  function closeConfirmModal() {
    setConfirmModalVisible(false);    
    setSelectedData(null);
  }

  function getDatas() {
    fetch(`${apiURL}/api/pagesSeo`)
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
        setDatas(sortedData)
      })
      .catch(err => {
        console.error(err);
      })
  }

  useEffect(() => {
    getDatas();
  }, [apiURL])

  function deleteData(id) {
    setLoadingIDs(prew => [...prew, id])

    fetch(`${apiURL}/api/pagesSeo/${id}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then((res) => {        
        if (res.ok) {
          // return res.json();
          getDatas();
          showNotf(true, "Deleted successfully");
        } else {
          showNotf(false, `${res.status}: An error occurred while deleting page Seo`);
          return res.json().then(err =>{
            console.error(err);
          })
        }
      })
      .finally(() => {
        setLoadingIDs(prew => prew.filter(dataID => dataID != id)) 
        closeConfirmModal();
      })
  }


  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader className='card__header'>
            <h3> Pages Seo </h3>
            <CButton
              color="primary"
              className='flexButton'
              href='#/pagesSeo/0'
            >
              <CIcon icon={cilPlus}/>
              Create
            </CButton>
          </CCardHeader>
          <CCardBody>
            <p className="text-body-secondary small">
              You can add, update and delete <i>Pages Seo</i>
            </p>
            <div className='table-container'>
              <CTable striped hover className='main-table'>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">ID</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Page</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Title</CTableHeaderCell>
                    <CTableHeaderCell scope="col" className='table__options'>Options</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {
                    datas.map(data => (
                      <CTableRow 
                        key={data.id} 
                        align='middle'
                        className="tableRow"
                      >
                        <CTableHeaderCell scope="row">{data.id}</CTableHeaderCell>
                        <CTableDataCell>{data.page}</CTableDataCell>
                        <CTableDataCell>{data.title}</CTableDataCell>
                        <CTableDataCell className='table__options--item'>
                          <CButton
                            color="info"
                            variant="outline"
                            title='View'
                            // disabled="false"
                            onClick={() => handleView(data)}
                          >
                            <CIcon icon={cilDescription}/>
                          </CButton>

                          <CButton
                            color="warning"
                            variant="outline"
                            title='Edit'
                            href={`#/pagesSeo/${data.id}`}
                          >
                            <CIcon icon={cilPencil}/>
                          </CButton>
                          <CButton
                            color="danger"
                            variant="outline"
                            title='Delete'
                            onClick={() => openConfirmModal(data)}
                          >
                            <CIcon icon={cilTrash}/>
                          </CButton>
                        </CTableDataCell>
                        {
                          loadingIDs.includes(data.id) &&
                          <CTableDataCell className='cardLoading'>
                            <CSpinner color="warning"/>
                          </CTableDataCell>
                        }
                      </CTableRow>
                    ))
                  }
                </CTableBody>
              </CTable>
            </div>


            {/* INFO Modal */}

            <CModal scrollable visible={modalVisible} onClose={() => closeModal()} className='infoModal'>
              <CModalHeader>
                <CModalTitle>Page Seo</CModalTitle>
              </CModalHeader>
              <CModalBody>
                
                <div className='infoModal__item'>
                  <strong> ID </strong>
                  <p> {selectedData?.id} </p>
                </div>

                <hr/>

                <div className='infoModal__item'>
                  <strong> Page </strong>
                  <p> {selectedData?.page} </p>
                </div>

                <hr/>

                <div className='infoModal__item'>
                  <strong> Title </strong>
                  <p> {selectedData?.title} </p>
                </div>

                <hr/>

                <div className='infoModal__item'>
                  <strong> Description </strong>
                  <p> {selectedData?.description} </p>
                </div>

                <hr/>

                <div className='infoModal__item'>
                  <strong> Keywords </strong>
                  <p> {selectedData?.keywords} </p>
                </div>

              </CModalBody>
              <CModalFooter>
                <CButton color="secondary" onClick={() => setModalVisible(false)}>
                  Close
                </CButton>
              </CModalFooter>
            </CModal>


            {/* Confirm Modal */}

            <CModal
              backdrop="static"
              alignment="center"
              visible={confirmModalVisible}
              onClose={() => closeConfirmModal()}
              aria-labelledby="StaticBackdropExampleLabel"
            >
              <CModalHeader>
                <CModalTitle id="StaticBackdropExampleLabel">
                  Are you sure?
                </CModalTitle>
              </CModalHeader>
              <CModalBody>
                Do you want to delete <strong>{selectedData?.key}</strong> Page Seo? 
              </CModalBody>
              <CModalFooter>
                <CButton color="secondary" onClick={() => closeConfirmModal()}>
                  Cancel
                </CButton>
                <CButton 
                  color="danger" 
                  onClick={() => deleteData(selectedData?.id)}
                  className='flexButton'
                >
                  <CIcon icon={cilTrash}/>
                  Delete
                </CButton>
              </CModalFooter>
            </CModal>

          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default PagesSeo
