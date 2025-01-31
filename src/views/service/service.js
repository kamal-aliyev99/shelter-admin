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
  CPagination,
  CPaginationItem,
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
  cilImageBroken,
} from '@coreui/icons'
import { useDispatch, useSelector } from 'react-redux';
import Toast from '../../components/Toast';

const Service = () => {
  const dispatch = useDispatch();
  const [datas, setDatas] = useState([]);
  const [selectedData, setSelectedData] = useState();
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const apiURL = useSelector((state) => state.apiURL);  
  const lang = useSelector((state) => state.lang);
  const [loadingIDs, setLoadingIDs] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  // const [page, setPage] = useState({
  //   pageCount: 0,
  //   currentPage: 2
  // })

  function handlePagination (page) {
    setCurrentPage(page)
  }

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
    fetch(`${apiURL}/api/service?lang=${lang}&perPage=10&page=${currentPage}`)
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
        // console.log(datas);
        
        const sortedData = datas.data.sort((a,b) => a.id - b.id);
        setDatas(sortedData)
        setPageCount(datas.pageCount)
      })
      .catch(err => {
        console.error(err);
      })
  }

  useEffect(() => {
    getDatas();
  }, [apiURL, lang, currentPage])

  function deleteData(id) {
    setLoadingIDs(prew => [...prew, id])

    fetch(`${apiURL}/api/service/${id}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then((res) => {        
        if (res.ok) {
          // return res.json();
          getDatas();
          showNotf(true, "Deleted successfully");
        } else {
          showNotf(false, `${res.status}: An error occurred while deleting this service`);
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
            <h3> Service </h3>
            <CButton
              color="primary"
              className='flexButton'
              href='#/service/add'
            >
              <CIcon icon={cilPlus}/>
              Create
            </CButton>
          </CCardHeader>
          <CCardBody>
            <p className="text-body-secondary small">
              You can add, update and delete <i>Services</i>
            </p>
            <div className='table-container'>
              <CTable striped hover className='main-table'>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">ID</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Image</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Title ({lang})</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Short description ({lang})</CTableHeaderCell>
                    {/* <CTableHeaderCell scope="col">LinkedIn</CTableHeaderCell> */}
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
                        <CTableDataCell>{data.shortDesc}</CTableDataCell>
                        {/* <CTableDataCell>
                            {
                                data.linkedin ||
                                <span className='not-content'> Not Content </span>
                            }
                        </CTableDataCell> */}
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
                            href={`#/service/${data.id}`}
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

            {
              (pageCount && pageCount != 1) ?
              <CPagination aria-label="Page navigation" className='paginationDiv'>
                <CPaginationItem
                  aria-label="Previous" 
                  disabled={currentPage == 1}
                  onClick={() => handlePagination(currentPage-1)}
                >
                    <span aria-hidden="true">&laquo;</span>
                </CPaginationItem>

                {
                  Array.from({ length: pageCount }, (_,i) => {
                    const count = i+1;
                    return (
                      <CPaginationItem
                        key={count}
                        active={count == currentPage}
                        onClick={() => handlePagination(count)}
                      >
                        {count}
                      </CPaginationItem>
                    )
                  }
                  )
                }

                <CPaginationItem
                  aria-label="Next"
                  disabled={ currentPage == pageCount }
                  onClick={() => handlePagination(currentPage+1)}
                >
                    <span aria-hidden="true">&raquo;</span>
                </CPaginationItem>

              </CPagination>
              :
              null
            }


            {/* INFO Modal */}

            <CModal scrollable visible={modalVisible} onClose={() => closeModal()} className='infoModal'>
              <CModalHeader>
                <CModalTitle>Service</CModalTitle>
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
                      <img src={selectedData?.image}/>
                    </div> :
                    <div className='infoModal__item--icon'>
                      <CIcon icon={cilImageBroken} title="There isn't image"/>
                    </div>
                  }
                </div>

                <hr/>

                <div className='infoModal__item'>
                  <strong> Title ({lang})</strong>
                  <p> {selectedData?.title} </p>
                </div>

                <hr/>

                <div className='infoModal__item'>
                  <strong> short Description ({lang}) </strong>
                  <p>
                    {
                        selectedData?.shortDesc ||
                        <span className='not-content'> Not Content </span> 
                    }
                  </p>
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
                Do you want to delete <strong>{selectedData?.name}</strong> Service? 
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

export default Service
