import { useEffect, useRef, useState } from 'react'
import femaleCyborg from '/femaleCyborg.png'
import { motion } from "framer-motion"
import './App.css'

function App() {
  const [file, setFile] = useState({name:""})
  const [fileResult,setFileResult] = useState(false)
  const [query, setQuery] = useState("")
  const [namespace, setNamespace] = useState("")
  const [talk, setTalk]= useState([])
  const [id, setId]=useState(0)
  const [sendData, setSendData] = useState(false)
  const [loading, setLoading] = useState(false)
  const [info, setInfo] = useState("")
  const viewRef= useRef()
  const [url, setUrl] = useState("https://talktopdf.ew.r.appspot.com")
  // const [url, setUrl] = useState("http://localhost:5000")

  useEffect(() =>{
    if (id>0){
      getQuery()
      
    }
  },[sendData])

  async function getQuery(){
    const response = await fetch(url, {
    method: "POST",
    mode: "cors",
    body: JSON.stringify({"query":query, "namespace": namespace}),
    headers: {
      "Content-Type": "application/json"
    }
    });
    setQuery("")
    const result = await response.json();
    // console.log("result",result)
    if(result.status !== "ok"){
      alert("opps, something went wrong")
    } else {
      setTimeout(() =>{
        viewRef.current?.scrollIntoView({ behavior: 'smooth' });
      },500)
      setTalk(prev => [...prev, {id, role:"AI", content: result.content}])
      setId(id+1)
    }
    setLoading(false)
  }

   async function handleSubmit(e){
    e.preventDefault()
    setInfo("")
    setLoading(true)
    // console.log("SUBMIT", file)
    const data = new FormData()
    data.append("file", file)
    // console.log("DATA", data)
    setTimeout(() =>{
      setInfo("Processing")
    },3000)
    setTimeout(() =>{
      setInfo("")
    },6000)
    try{
      const response = await fetch(`${url}/upload`, {
      method: "POST",
      mode: "cors",
      body: data,
    // headers: {
    //   "Content-Type": "multipart/form-data"
    // }
    })
      const result = await response.json();
      // console.log("RESULT",result.status)
      setInfo("File Uploaded...")
      setTimeout(() =>{
        setInfo("")
      },2500)
      setLoading(false)
      setNamespace(result.namespace)
      setFileResult(true)
      deleteDB(result.namespace,result.destination_file_name)
  } catch(error){
    setInfo("opps something went wrong",error)
    setLoading(false)
    setTimeout(() =>{
      setInfo("")
    },2500)
  }    
  }

  function handleQuery(e){
    e.preventDefault()
    setTalk(prev => [...prev, {id,role:"human", content: query}])
    setId(id+1)
    setSendData(!sendData)
    setLoading(true)
  }

  function handleChange(e) {
    const size = e.target.files[0].size
    if (size < 5*1024*1024){
      setFile( e.target.files[0])
      setInfo("Ready to Submit")
    } else {
      setInfo("File too big. Maximum 5mb")
      setTimeout(() =>{
        setInfo("")
      },2500)
    }
    
    // console.log("SIZE", e.target.files[0].size);
  }

  async function deleteDB(namespace, destinationFileName){
    // console.log("INIT DELETION",namespace)
    // console.log("DESTINATION", destinationFileName)
    const response = await fetch(`${url}/delete`, {
      method: "POST",
      mode: "cors",
      body: JSON.stringify({"namespace":namespace, "destinationFileName": destinationFileName}),
      headers: {
        "Content-Type": "application/json"
      }
      });
      // const deletion = await response.json();
      // console.log("DELETION",deletion)
      // if(result.status !== "ok"){
      //   console.log("DELETE DB, opps, something went wrong")
      // } 
    
  }
  
  // console.log("FILE",file)
  const variants = {
    open: { opacity: 1, x: 0 },
    closed: { opacity: 0, x: "-100%" },
  } 

  return (
    <div className='main'>
      <div className='formContainer'>
        <div className='logoContainer'>
        <img className="cyborg" src={femaleCyborg} alt="female cyborg holding a laptop" />
        <h1>TALK TO <span className="pdf">PDF</span></h1>
        </div>

        <hr className='ruler'></hr>
        
        <form style={{display: fileResult&&"none"}} className="myfile" onSubmit={handleSubmit}>
          <label htmlFor="file" style={{display: file.name.length>0 &&"none"}}>Upload a file</label>
          <input type="file" style={{display: file.name.length>0 &&"none"}} id="file" name="file" required onChange={handleChange} />
          <p style={{paddingBottom:"15px"}}>{file.name.length>0 && file.name}</p>
         
          {loading ? <div className="loader"></div>:<motion.button whileHover={{scale:1.3}} whileTap={{scale:0.9}} 
          type="submit">Submit</motion.button>}
        </form>
        <motion.div className="info" initial={{opacity:0}} animate={info.length>0?"open":"closed"} 
        variants={variants}>{info}</motion.div>

        <div className='talkContainer'>
          {talk.map(item => {
            return (
              <p style={{fontStyle: item.role==="AI"&&"italic",whiteSpace:"pre-wrap"}} key={item.id}>{item.content}</p> 
          )
          })}
          <form className="query" onSubmit={handleQuery}>
            <input style={{textAlign:"center"}} required type="text" id="query" name="query" placeholder={namespace.length>0?"Please enter your query":"Data will be deleted after 2 hours"} 
            onChange={(e) => {setQuery(e.target.value)}} value={query}/>
            {loading && <div style={{display: namespace.length>0?"block":"none"}} className="loader"></div>}
            {!loading&&<button style={{display: namespace.length>0?"block":"none"}} type="submit">Submit</button>}
          </form>
          <br />
          <br />
          <div ref={viewRef}></div>
        </div>
        
      </div>
      
        
    </div>
  )
}

export default App
