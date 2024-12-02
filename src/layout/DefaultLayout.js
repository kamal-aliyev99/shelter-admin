import React, { useRef } from 'react'
import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components/index'
import { useSelector } from 'react-redux'
import { CToaster } from '@coreui/react'

const DefaultLayout = () => {
  const toast = useSelector((state) => state.toast)
  const toaster = useRef();  

  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="body flex-grow-1">
          <AppContent />
        </div>
        <AppFooter />
      </div>
      <CToaster className="p-3" placement="top-end" push={toast} ref={toaster}/>
    </div>
  )
}

export default DefaultLayout
