import { useEffect, useRef, useState } from 'react'
import femaleCyborg from '/femaleCyborg.png'
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
  const viewRef= useRef()
  // const [url, setUrl] = useState("https://talktopdf.ew.r.appspot.com")
  const [url, setUrl] = useState("http://localhost:5000")

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
    console.log("result",result)
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
    setLoading(true)
    console.log("SUBMIT", file)
    const data = new FormData()
    data.append("file", file)
    console.log("DATA", data)
    const response = await fetch(`${url}/upload`, {
    method: "POST",
    mode: "cors",
    body: data,
    // headers: {
    //   "Content-Type": "multipart/form-data"
    // }
  });
  const result = await response.json();
  if(result.status !== "ok"){
    alert("opps, something went wrong")
  } else {
    setNamespace(result.namespace)
    setFileResult(true)
    setTimeout(() => {
      deleteDB(result.namespace,result.destination_file_name)
    }, 6000);
  }
  setLoading(false)
  console.log("ALOO", result);
  }

  function handleQuery(e){
    e.preventDefault()
    if (namespace.length === 0){
      alert("You need to upload a pdf")
      return
    }
    setTalk(prev => [...prev, {id,role:"human", content: query}])
    setId(id+1)
    setSendData(!sendData)
    
    setLoading(true)
  }

  function handleChange(e) {
    setFile( e.target.files[0])
    console.log("HANDLE", e.target.files);
  }

  async function deleteDB(namespace, destinationFileName){
    console.log("INIT DELETION",namespace)
    console.log("DESTINATION", destinationFileName)
    const response = await fetch(`${url}/delete`, {
      method: "POST",
      mode: "cors",
      body: JSON.stringify({"namespace":namespace, "destinationFileName": destinationFileName}),
      headers: {
        "Content-Type": "application/json"
      }
      });
      const deletion = await response.json();
      console.log("DELETION",deletion)
      if(result.status !== "ok"){
        console.log("DELETE DB, opps, something went wrong")
      } 
    
  }
  
  // console.log("FILE",file)

  return (
    <div className='main'>
      

      <div className='formContainer'>
        <div className='logoContainer'>
        <img className="cyborg" src={femaleCyborg} alt="female cyborg holding a laptop" />
        <h1>TALK TO PDF</h1>
        </div>

        <hr></hr>
        
        <form style={{display: fileResult&&"none"}} className="myfile" onSubmit={handleSubmit}>
          <label htmlFor="file" style={{display: file.name.length>0 &&"none"}}>Upload a file</label>
          <input type="file" style={{display: file.name.length>0 &&"none"}} id="file" name="file" onChange={handleChange} />
          <p style={{paddingBottom:"15px"}}>{file.name.length>0 && file.name}</p>
          {loading ? <div className="loader"></div>:<button type="submit">Submit</button>}
        </form>

        <div className='talkContainer'>
          {talk.map(item => {
            return (
              <p style={{fontStyle: item.role==="AI"&&"italic",whiteSpace:"pre-wrap"}} key={item.id}>{item.content}</p> 
          )
          })}
          <form className="query" onSubmit={handleQuery}>
            {/* <label htmlFor="query">Your query </label> */}
            <input required type="text" id="query" name="query" placeholder="Please enter your query" onChange={(e) => {setQuery(e.target.value)}} value={query}/>
            {loading?<div className="loader"></div>:<button type="submit">Submit</button>}
          </form>
          
          <div ref={viewRef}></div>
        </div>
        
      </div>
      
        
    </div>
  )
}

export default App
