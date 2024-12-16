import React, { useEffect, useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormSelect,
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
  cilImageBroken
} from '@coreui/icons'
import { useDispatch, useSelector } from 'react-redux';
import Toast from '../../components/Toast';


const Category = () => {
  const dispatch = useDispatch();
  const [datas, setDatas] = useState([]);
  const [showdatas, setShowDatas] = useState([]);
  const [filterDatas, setFilterDatas] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState(0);
  const [selectedData, setSelectedData] = useState();
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const apiURL = useSelector((state) => state.apiURL);  
  const lang = useSelector((state) => state.lang);  
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
    fetch(`${apiURL}/api/category?lang=${lang}`)
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

  function getFilterDatas() {
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
        setFilterDatas(sortedData)
      })
      .catch(err => {
        console.error(err);
      })
  }

  useEffect(() => {
    getDatas();
    getFilterDatas();
  }, [apiURL, lang])

  useEffect(() => {
    if (+selectedFilter) {
      setShowDatas(datas.filter(i => i.productType_id == selectedFilter))
    } else {
      setShowDatas(datas)
    }
  }, [selectedFilter, datas])
  

  function deleteData(id) {
    setLoadingIDs(prew => [...prew, id])

    fetch(`${apiURL}/api/category/${id}`, {
      method: "DELETE",
    })
      .then((res) => {        
        if (res.ok) {
          // return res.json();
          getDatas();
          showNotf(true, "Deleted successfully");
        } else {
          showNotf(false, `${res.status}: An error occurred while deleting Category`);
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
            <h3> Categories </h3>
            <div className='section__header--flex flexButton'>
              <CFormSelect
                aria-label="Product-Type"
                options={[
                  {label: "All", value: 0},
                  ...filterDatas.map(item => ({
                    label: item.title,
                    value: item.id
                  }))
                ]}
                onChange={(e) => setSelectedFilter(e.target.value)}
                value={selectedFilter}
              />
              <CButton
                color="primary"
                className='flexButton'
                href='#/category/add'
              >
                <CIcon icon={cilPlus}/>
                Create
              </CButton>
            </div>
          </CCardHeader>
          <CCardBody>
            <p className="text-body-secondary small">
              You can add, update and delete <i>Category</i>
            </p>
            <div className='table-container'>
              <CTable striped hover className='main-table'>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">ID</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Image</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Slug</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Title ({lang})</CTableHeaderCell>
                    <CTableHeaderCell scope="col" className='table__options'>Options</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {
                    showdatas.map(data => (
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
                              <img src={data.image} alt={data.page}/>
                            </div> :
                            <CIcon icon={cilImageBroken} title="There isn't image"/>
                          }
                        </CTableDataCell>
                        <CTableDataCell>{data.slug}</CTableDataCell>
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
                            href={`#/category/${data.id}`}
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


            {/* INFO Modal       add producttype title ??? !!!     */}

            <CModal scrollable visible={modalVisible} onClose={() => closeModal()} className='infoModal'>
              <CModalHeader>
                <CModalTitle>Category</CModalTitle>
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
                  <strong> ProductType </strong>
                  <p>
                    {
                      filterDatas.find(i => i.id == selectedData?.productType_id)?.title
                    }
                  </p>
                </div>

                <hr/>

                <div className='infoModal__item'>
                  <strong> Slug </strong>
                  <p> {selectedData?.slug} </p>
                </div>

                <hr/>

                <div className='infoModal__item'>
                  <strong> Title ({lang}) </strong>
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
                Do you want to delete <strong>{selectedData?.slug}</strong> Category? 
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

export default Category
