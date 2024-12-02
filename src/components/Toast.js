import CIcon from "@coreui/icons-react";
import { CToast, CToastBody, CToastHeader } from "@coreui/react";
import {
    cilXCircle,
    cilCheckCircle
  } from '@coreui/icons'

const Toast = (ok, message) => () => (
    <CToast
        color={ok ? 'success' : "danger"} 
        delay={2500}
        key={Date.now()}
    >
        <CToastHeader closeButton>
        {
            ok ?
            <CIcon icon={cilCheckCircle}/>
            :
            <CIcon icon={cilXCircle}/>
        }
        <div className="fw-bold me-auto ms-2">
            {ok ? "Successful" : "Unsuccessful"}
        </div>
        </CToastHeader>
        <CToastBody>
            {message}
        </CToastBody>
    </CToast>
)

export default Toast