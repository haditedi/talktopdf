import React from 'react'
import linkedin from "/linkedin.svg"
import style from "./footer.module.css"

export default function Footer() {
  return (
     <div className={style.footer}>
     <a href="https://www.linkedin.com/in/hadi-tedi-a7682a144/" target="_blank" rel="noreferrer noopener">
     <small className={style.wrapper}>Hire me. Whatsapp +44 (0) 7825 372243 <img src={linkedin} /></small></a></div>
  )
}
