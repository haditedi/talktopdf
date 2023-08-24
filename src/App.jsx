import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import femaleCyborg from '/femaleCyborg.png'
import Form from 'react-bootstrap/Form';
// import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'

function App() {
  const [file, setFile] = useState()
  const [query, setQuery] = useState("")
  const [namespace, setNamespace] = useState("")
  const [talk, setTalk]= useState([])
  const [id, setId]=useState(0)
  const [sendData, setSendData] = useState(false)

  useEffect(() =>{
    if (id>0){
      getQuery()
    }
  },[sendData])

  async function getQuery(){
    const response = await fetch("http://localhost:5000/", {
    method: "POST",
    mode: "cors",
    body: JSON.stringify({"query":query, "namespace": namespace}),
    headers: {
      "Content-Type": "application/json"
    }
    });
    const result = await response.json();
    console.log("result",result)
    if(result.status !== "ok"){
      alert("opps, something went wrong")
    } else {
      setTalk(prev => [...prev, {id, role:"AI", content: result.content}])
      setId(id+1)
    }
    setQuery()
  }

   async function handleSubmit(e){
    e.preventDefault()
    console.log("SUBMIT", file)
    const data = new FormData()
    data.append("file", file)
    console.log("DATA", data)
    const response = await fetch("http://localhost:5000/upload", {
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
    
  }
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
  }

  function handleChange(e) {
    setFile( e.target.files[0])
    console.log("HANDLE", e.target.files);
  }
  
  // console.log("TALK",talk)

  return (
    <div className='main'>
      <img className="cyborg" src={femaleCyborg} alt="female cyborg holding a laptop" />

      <div className='formContainer'>
        <h1>TALK TO PDF</h1>
        <form onSubmit={handleSubmit}>
          <label htmlFor="file">Select a file</label>
          <input type="file" id="file" name="file" onChange={handleChange} />
          <button type="submit">Submit</button>
        </form>
        <div className='talkContainer'>
          <div>{talk.map(item => {
            return (
              <p key={item.id}>{item.content}</p>
            )
          })}</div>
          <form onSubmit={handleQuery}>
            <label htmlFor="query">Your query</label>
            <input type="text" id="query" name="query" onChange={(e) => {setQuery(e.target.value)}} />
            <button type="submit">Submit</button>
          </form>
        </div>
        
      </div>
      
        
    </div>
  )
}

export default App
