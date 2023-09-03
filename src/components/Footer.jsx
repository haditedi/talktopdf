import React from 'react'
import linkedin from "/linkedin.svg"
import style from "./footer.module.css"

export default function Footer() {
  return (
    <>
      <hr />
     <div className={style.footer}>
      
        <p><small>Hire me. Connect</small> </p>
     <a href="https://www.linkedin.com/in/hadi-tedi-a7682a144/" target="_blank" rel="noreferrer noopener">
        <img src={linkedin} /></a></div>

    </>
     )
}
