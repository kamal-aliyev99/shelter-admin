import { CFormSelect } from "@coreui/react"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux";



const HeaderLang = () => {
  const [langs, setLangs] = useState([]);
  const currentLang = useSelector(state => state.lang);
  const apiURL = useSelector(state => state.apiURL);
  const rerenderLang = useSelector(state => state.rerenderLang);
  const dispatch = useDispatch();

  function getDatas() {
    fetch(`${apiURL}/api/lang`)
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
      const langCodes = sortedData.map(item => item.langCode);
      setLangs(langCodes)
      dispatch({type: "set", langs: langCodes})
    })
    .catch(err => {
      console.error(err);
    })
  }

  useEffect(() => {
      getDatas()
  }, [apiURL, rerenderLang])

  
  function handleChange(e) {
      const value = e.target.value;
      sessionStorage.setItem("lang", value);
      dispatch({type: "set", lang: value})
  }

// console.log(currentLang);
    

    return(
        <>
          <CFormSelect 
              className="headerLang"
              aria-label="Langs"
              options={langs}
              onChange={handleChange}
              value={currentLang}
          />
          {/* <CFormSelect 
              aria-label="Langs"
              options={[
                  'Open this select menu',
                  { label: 'One', value: '1' },
                  { label: 'Two', value: '2' },
                  { label: 'Three', value: '3', disabled: true }
              ]}
          /> */}
        </>
    )
}

export default HeaderLang