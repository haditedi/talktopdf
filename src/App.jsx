import { useEffect, useRef, useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import femaleCyborg from "/femaleCyborg.png";
import { motion } from "framer-motion";
import "./App.css";
import axios from "axios";

function App() {
  const [fileResult, setFileResult] = useState(false);
  const [query, setQuery] = useState("");
  const [webAddress, setWebAddress] = useState("");
  const [namespace, setNamespace] = useState("");
  const [talk, setTalk] = useState([]);
  const [id, setId] = useState(0);
  const [sendData, setSendData] = useState(false);
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState("");

  const viewRef = useRef();
  const [url, setUrl] = useState("https://talktopdf.ew.r.appspot.com");
  // const [url, setUrl] = useState("http://192.168.1.108:5000")
  // const [url, setUrl] = useState("http://localhost:5000");

  useEffect(() => {
    if (id > 0) {
      getQuery();
    }
  }, [sendData]);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles[0].size > 5 * 1000 * 1024) {
      setInfo("file too big");
      setTimeout(() => {
        setInfo("");
      }, 2000);
      return;
    }
    setInfo("");
    setLoading(true);
    const data = new FormData();
    data.append("file", acceptedFiles[0]);
    setTimeout(() => {
      setInfo("Processing");
    }, 3000);
    setTimeout(() => {
      setInfo("");
    }, 6000);
    try {
      const response = await axios.post(`${url}/upload`, data);
      const result = response.data;
      setInfo("File Uploaded...");
      setTimeout(() => {
        setInfo("");
      }, 2500);
      setLoading(false);
      setNamespace(result.namespace);
      setFileResult(true);
    } catch (error) {
      setInfo("");
      setInfo(`opps something went wrong ${error}`);
      setLoading(false);
    }
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
  });

  async function handleWebUpload(e) {
    e.preventDefault();
    console.log(webAddress);
    if (webAddress.length == 0) {
      setInfo("Please enter web address");
    }
    const valid = /^(ftp|http|https):\/\/[^ "]+$/;
    if (valid.test(webAddress)) {
      setLoading(true);
      setTimeout(() => {
        setInfo("Processing. It may take a couple of minutes,,,");
      }, 3000);
      // setTimeout(() => {
      //   setInfo("");
      // }, 6000);
      try {
        const response = await axios.post(`${url}/webupload`, {
          data: webAddress,
        });
        const result = response.data;
        // console.log("RESULT", result);
        if (result.message != "ok") {
          // console.log("NOT OK");
          setInfo("Sorry data too big");
          setTimeout(() => {
            setInfo("");
          }, 2500);
          setLoading(false);
          setWebAddress("");
          return;
        }
        setInfo("Data Uploaded...");
        setTimeout(() => {
          setInfo("");
        }, 2500);
        setLoading(false);
        setNamespace(result.namespace);
        setFileResult(true);
      } catch (error) {
        console.log("ERROR");
        setInfo("");
        setInfo(`opps something went wrong ${error}`);
        setLoading(false);
      }
    } else {
      setInfo("Please enter correct web address");
    }
    console.log(webAddress);
    setTimeout(() => {
      setInfo("");
    }, 2000);
    setLoading(false);
    setWebAddress("");
  }

  async function getQuery() {
    const response = await fetch(url, {
      method: "POST",
      mode: "cors",
      body: JSON.stringify({ query: query, namespace: namespace }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    setQuery("");
    const result = await response.json();
    // console.log("result",result)
    if (result.status !== "ok") {
      alert("opps, something went wrong");
    } else {
      setTimeout(() => {
        viewRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 500);
      setTalk((prev) => [...prev, { id, role: "AI", content: result.content }]);
      setId(id + 1);
    }
    setLoading(false);
  }

  function handleQuery(e) {
    e.preventDefault();
    setTalk((prev) => [...prev, { id, role: "human", content: query }]);
    setId(id + 1);
    setSendData(!sendData);
    setLoading(true);
  }

  const variants = {
    open: { opacity: 1, x: 0 },
    closed: { opacity: 0, x: "-100%" },
  };

  return (
    <div className="main">
      <div className="formContainer">
        <div className="logoContainer">
          <img
            className="cyborg"
            src={femaleCyborg}
            alt="female cyborg holding a laptop"
          />
          <h1>
            PONY <span className="pdf">BOT</span>
          </h1>
        </div>

        <hr className="ruler"></hr>

        <h1 style={{ display: fileResult && "none" }}>Upload your data</h1>

        {loading ? (
          <div
            style={{ display: fileResult && "none" }}
            className="loader"
          ></div>
        ) : (
          <motion.div
            style={{ display: fileResult && "none" }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="dropZone"
            {...getRootProps()}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Drop the file here ...</p>
            ) : (
              <p>
                Drag 'n' drop a pdf file here, or click to select file (max
                size: 5mb)
              </p>
            )}
            <span className="material-symbols-outlined">cloud_upload</span>
          </motion.div>
        )}

        <motion.div
          className="info"
          initial={{ opacity: 0 }}
          animate={info.length > 0 ? "open" : "closed"}
          variants={variants}
        >
          {info}
        </motion.div>

        {!loading && (
          <div style={{ display: fileResult && "none" }}>
            <h1>Upload your website</h1>
            <p>Enter your website: </p>
            <form className="query" onSubmit={handleWebUpload}>
              <input
                type="text"
                placeholder="https://www.yourwebsite.com"
                onChange={(e) => setWebAddress(e.target.value.toLowerCase())}
                value={webAddress}
              />
              <button
                style={{
                  display: namespace.length > 0 ? "none" : "block",
                  marginBottom: "70px",
                }}
                type="submit"
              >
                Submit
              </button>
            </form>
          </div>
        )}
        <div className="talkContainer">
          {talk.map((item) => {
            return (
              <p
                style={{
                  fontStyle: item.role === "AI" && "italic",
                  whiteSpace: "pre-wrap",
                }}
                key={item.id}
              >
                {item.content}
              </p>
            );
          })}
          <form className="query" onSubmit={handleQuery}>
            <input
              disabled={namespace.length == 0 && "true"}
              style={{ textAlign: "center" }}
              required
              type="text"
              id="query"
              name="query"
              placeholder={
                namespace.length > 0
                  ? "Please enter your query"
                  : "Data deletion every day"
              }
              onChange={(e) => {
                setQuery(e.target.value);
              }}
              value={query}
            />
            {loading && (
              <div
                style={{ display: namespace.length > 0 ? "block" : "none" }}
                className="loader"
              ></div>
            )}
            {!loading && (
              <button
                style={{ display: namespace.length > 0 ? "block" : "none" }}
                type="submit"
              >
                Submit
              </button>
            )}
          </form>
          <br />
          <br />
          <div ref={viewRef}></div>
        </div>
      </div>
    </div>
  );
}

export default App;
