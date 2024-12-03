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
  cilImageBroken,
  cilPencil,
  cilDescription,
  cilPlus,
} from '@coreui/icons'
import { useDispatch, useSelector } from 'react-redux';
import Toast from '../../components/Toast';

const Partner = () => {
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
    fetch(`${apiURL}/api/partner`) 
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

    fetch(`${apiURL}/api/partner/${id}`, {
      method: "DELETE",
    })
      .then((res) => {        
        if (res.ok) {
          // return res.json();
          getDatas();
          showNotf(true, "Deleted successfully");
        } else {
          showNotf(false, `${res.status}: An error occurred while deleting partner`);
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
            <h3> Partner </h3>
            <CButton
              color="primary"
              className='flexButton'
              href='#/partner/0'
            >
              <CIcon icon={cilPlus}/>
              Create
            </CButton>
          </CCardHeader>
          <CCardBody>
            <p className="text-body-secondary small">
              You can add, update and delete <i> Partner</i>
            </p>
            <div className='table-container'>
              <CTable striped hover className='main-table'>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">ID</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Image</CTableHeaderCell>
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
                        <CTableDataCell>
                          {
                            data.image ?
                            <div className='table__image--S'>
                              <img src={data.image} alt={data.title}/>
                            </div> :
                            <CIcon icon={cilImageBroken} title="There isn't image"/>
                          }
                        </CTableDataCell>
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
                            href={`#/partner/${data.id}`}
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
                <CModalTitle>Partner</CModalTitle>
              </CModalHeader>
              <CModalBody>
                
                <div className='infoModal__item'>
                  <strong> ID </strong>
                  <p> {selectedData?.id} </p>
                </div>

                <hr/>

                <div className='infoModal__item'>
                  <strong> Image </strong>
                  {
                    selectedData?.image ?
                    <div className='infoModal__item--image'>
                      <img src={selectedData?.image} alt={selectedData?.title}/>
                    </div> :
                    <div className='infoModal__item--icon'>
                      <CIcon icon={cilImageBroken} title="There isn't image"/>
                    </div>
                  }
                </div>

                <hr/>

                <div className='infoModal__item'>
                  <strong> Title </strong>
                  <p> {selectedData?.title} </p>
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
                Do you want to delete <strong>{selectedData?.title}</strong> Partner? 
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

export default Partner
