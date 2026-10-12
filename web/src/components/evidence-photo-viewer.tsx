"use client";
import {useRef,useState} from "react";
import Image from "next/image";
import {useTranslation} from "react-i18next";

export function EvidencePhotoViewer({url,label,onError}:{url:string;label:string;onError:()=>void}){
  const {t}=useTranslation();
  const [scale,setScale]=useState(100);
  const drag=useRef<{x:number;y:number;left:number;top:number}|null>(null);
  const viewport=useRef<HTMLDivElement>(null);
  function change(next:number){setScale(Math.max(100,Math.min(400,next)));}
  function reset(){change(100);if(viewport.current){viewport.current.scrollLeft=0;viewport.current.scrollTop=0;}}
  return <div className="activity-photo-viewer" onKeyDown={event=>{
    if(event.key==="+"||event.key==="="){event.preventDefault();change(scale+50);}
    if(event.key==="-"){event.preventDefault();change(scale-50);}
    if(event.key==="0"){event.preventDefault();reset();}
  }}>
    <div className="activity-photo-zoom-controls" role="group" aria-label={t("photoViewport",{phase:label})}>
      <button type="button" aria-label={t("photoZoomOut")} disabled={scale===100} onClick={()=>change(scale-50)}><span aria-hidden="true">−</span></button>
      <button type="button" aria-label={t("photoZoomReset")} onClick={reset}><span aria-live="polite">{scale}%</span></button>
      <button type="button" aria-label={t("photoZoomIn")} disabled={scale===400} onClick={()=>change(scale+50)}><span aria-hidden="true">+</span></button>
      <p>{t("photoPanHint")}</p>
    </div>
    <div ref={viewport} className={`activity-photo-expanded${scale>100?" activity-photo-expanded--zoomed":""}`} role="region" aria-label={t("photoViewport",{phase:label})} tabIndex={0}
      onPointerDown={event=>{if(scale===100||event.pointerType!=="mouse"||event.button!==0)return;event.preventDefault();const el=event.currentTarget;drag.current={x:event.clientX,y:event.clientY,left:el.scrollLeft,top:el.scrollTop};el.setPointerCapture(event.pointerId);}}
      onPointerMove={event=>{if(!drag.current)return;event.currentTarget.scrollLeft=drag.current.left+drag.current.x-event.clientX;event.currentTarget.scrollTop=drag.current.top+drag.current.y-event.clientY;}}
      onPointerUp={()=>{drag.current=null;}} onPointerCancel={()=>{drag.current=null;}} onLostPointerCapture={()=>{drag.current=null;}}>
      <div className="activity-photo-canvas" style={{width:`${scale}%`,height:`${scale}%`}}>
        <Image src={url} alt={label} fill unoptimized sizes="100vw" referrerPolicy="no-referrer" draggable={false} onError={onError}/>
      </div>
    </div>
  </div>;
}
