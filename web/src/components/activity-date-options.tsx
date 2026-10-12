"use client";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { SummaryMonthOptions } from "./summary-filter-picker";
export function ActivityDateOptions({view,date,today,locale,onSelect}:{view:"day"|"month";date:string;today:string;locale:string;onSelect:(view:"day"|"month",date:string)=>void}){
  const {t}=useTranslation();
  const [mode,setMode]=useState(view),[month,setMonth]=useState(date.slice(0,7));
  const year=Number(month.slice(0,4)),monthIndex=Number(month.slice(5,7))-1;
  const first=new Date(`${month}-01T12:00:00Z`),days=new Date(Date.UTC(year,monthIndex+1,0)).getUTCDate(),blanks=(first.getUTCDay()+6)%7;
  const label=new Intl.DateTimeFormat(locale,{month:"long",year:"numeric",timeZone:"Europe/Dublin"}).format(first);
  const short=new Intl.DateTimeFormat(locale,{day:"numeric",month:"short",year:"numeric",timeZone:"Europe/Dublin"});
  function move(delta:number){setMonth(new Date(Date.UTC(year,monthIndex+delta,1)).toISOString().slice(0,7));}
  return <>
    <div className="activity-date-mode"><button type="button" aria-pressed={mode==="day"} onClick={()=>setMode("day")}>{t("activityDay")}</button><button type="button" aria-pressed={mode==="month"} onClick={()=>setMode("month")}>{t("filterMonth")}</button></div>
    {mode==="month"?<SummaryMonthOptions value={date.slice(0,7)} max={today.slice(0,7)} locale={locale} previousLabel={t("filterPreviousYear")} nextLabel={t("filterNextYear")} onSelect={month=>onSelect("month",month+"-01")}/>:
      <><div className="summary-picker-year"><button type="button" aria-label={t("activityPreviousMonth")} disabled={month<="1900-01"} onClick={()=>move(-1)}>‹</button><span aria-live="polite">{label}</span><button type="button" aria-label={t("activityNextMonth")} disabled={month>=today.slice(0,7)} onClick={()=>move(1)}>›</button></div>
      <div className="activity-calendar">
        {Array.from({length:7},(_,index)=><span className="activity-weekday" key={`weekday-${index}`} aria-hidden="true">{new Intl.DateTimeFormat(locale,{weekday:"short",timeZone:"Europe/Dublin"}).format(new Date(Date.UTC(2024,0,1+index,12)))}</span>)}
        {Array.from({length:blanks},(_,index)=><span key={`blank-${index}`} aria-hidden="true"/>)}
        {Array.from({length:days},(_,index)=>{const value=`${month}-${String(index+1).padStart(2,"0")}`;return <button key={value} type="button" aria-label={short.format(new Date(value+"T12:00:00Z"))} aria-pressed={value===date} disabled={value>today} onClick={()=>onSelect("day",value)}>{index+1}</button>;})}
      </div><button className="activity-calendar-today" type="button" onClick={()=>onSelect("day",today)}>{t("metricsToday")}</button></>}
  </>;
}
