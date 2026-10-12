"use client";
import { useId, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { activityHref, type ActivityFilters } from "../lib/activity/activity-filters";
import type { ActivityResult } from "../lib/activity/read-team-activity";
import type { CollaboratorResult } from "../lib/metrics/read-team-summary-collaborators";
import { SummaryFilterPicker } from "./summary-filter-picker";
import { ActivityDetailPanel } from "./activity-detail";
import { ActivityDateOptions } from "./activity-date-options";
const actions=[{field:"bike_locked",icon:"lock-closed-outline",label:"metric_locked"},{field:"kickstand_positioned",icon:"kickstand",label:"metric_kickstand"},{field:"bike_repositioned",icon:"move-outline",label:"metric_repositioned"}] as const;
export function ActivityPanel({filters,today,result,collaborators}:{filters:ActivityFilters|null;today:string;result:ActivityResult;collaborators:CollaboratorResult|null}){
  const {t,i18n}=useTranslation(),router=useRouter(),id=useId();
  const [selectedAction,setSelectedAction]=useState<string|null>(null);
  const [pending,startTransition]=useTransition(),[query,setQuery]=useState(filters?.query??""),[searchError,setSearchError]=useState(false);
  const locale=i18n.language==="en"?"en-IE":"es-ES",format=new Intl.NumberFormat(locale);
  if(!filters)return <section className="summary-filter-error"><p role="alert">{t("filtersInvalid")}</p><Link href="/activity">{t("filtersReset")}</Link></section>;
  function navigate(next:ActivityFilters){startTransition(()=>router.push(activityHref(next),{scroll:false}));}
  function change(update:Partial<ActivityFilters>){navigate({...filters!,...update,offset:0,asOf:null});}
  const shortDate=(date:string)=>new Intl.DateTimeFormat(locale,{day:"numeric",month:"short",year:"numeric",timeZone:"Europe/Dublin"}).format(new Date(date+"T12:00:00Z"));
  const month=new Intl.DateTimeFormat(locale,{month:"long",year:"numeric",timeZone:"Europe/Dublin"}).formatToParts(new Date(filters.date+"T12:00:00Z")).filter(part=>part.type==="month"||part.type==="year").map(part=>part.value).join(" ");
  const dateLabel=filters.view==="month"?month:(filters.date===today?`${t("metricsToday")} · `:"")+shortDate(filters.date);
  const people=collaborators?.status==="ready"?collaborators.data:[];
  const personLabel=(person:typeof people[number])=>person.full_name+(!person.is_active?` (${t("filterInactive")})`:"")+(people.filter(other=>other.full_name===person.full_name).length>1?` · ${person.id}`:"");
  const selected=people.find(person=>person.id===filters.employeeId);
  const heading=filters.view==="day"&&filters.date===today?t("activityTodayTitle"):t("activityPeriodTitle",{period:filters.view==="month"?month:shortDate(filters.date)});
  return <div className="activity-panel" aria-busy={pending}>
    <div inert={selectedAction?true:undefined}>
    <div className="activity-controls" role="group" aria-label={t("activityFilters")}>
      <form className="activity-search" role="search" onSubmit={event=>{event.preventDefault();const value=query.trim().toUpperCase();if(value&&(!/^[A-Z0-9]+$/.test(value)||value.length>10)){setSearchError(true);return;}setSearchError(false);change({query:value||null});}}>
        <button type="submit" aria-label={t("activitySearchSubmit")} disabled={pending}><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="7"/><path d="m16 16 5 5"/></svg></button>
        <input aria-label={t("activitySearch")} aria-invalid={searchError} aria-describedby={searchError?`${id}-search-error`:undefined} placeholder={t("activitySearch")} maxLength={10} value={query} disabled={pending} onChange={event=>setQuery(event.target.value)}/>
      </form>
      <SummaryFilterPicker label={t("filterPerson")} value={selected?personLabel(selected):filters.employeeId?t("filterPersonMissing"):t("filterAll")} icon="people-outline" className="activity-person-field" disabled={pending||collaborators?.status!=="ready"} closeLabel={t("filterClose")}>
        {close=><div className="summary-person-options" role="group" aria-label={t("filterPerson")}>{[{id:"",label:t("filterAll")},...people.map(person=>({id:person.id,label:personLabel(person)}))].map(person=><label className="summary-person-option" key={person.id}><input type="radio" name={`${id}-person`} checked={(filters.employeeId??"")===person.id} onClick={()=>{if((filters.employeeId??"")===person.id)close();}} onChange={()=>{close();change({employeeId:person.id||null});}}/><span>{person.label}</span></label>)}</div>}
      </SummaryFilterPicker>
      <SummaryFilterPicker label={t("activityDate")} value={dateLabel} icon="calendar-outline" className="activity-date-field" disabled={pending} closeLabel={t("filterClose")}>
        {close=><ActivityDateOptions view={filters.view} date={filters.date} today={today} locale={locale} onSelect={(view,date)=>{close();change({view,date});}}/>}
      </SummaryFilterPicker>
      <SummaryFilterPicker label={t("activityValidity")} value={t(`activityValidity_${filters.validity}`)} icon="activity-filter" className="activity-validity-field" disabled={pending} closeLabel={t("filterClose")}>
        {close=><div className="summary-person-options" role="group" aria-label={t("activityValidity")}>{(["all","valid","invalid"] as const).map(validity=><label className="summary-person-option" key={validity}><input type="radio" name={`${id}-validity`} checked={filters.validity===validity} onClick={()=>{if(filters.validity===validity)close();}} onChange={()=>{close();change({validity});}}/><span>{t(`activityValidity_${validity}`)}</span></label>)}</div>}
      </SummaryFilterPicker>
      <button className="metrics-refresh" type="button" disabled={pending} onClick={()=>{if(filters.offset||filters.asOf)change({});else startTransition(()=>router.refresh());}}><span className="metrics-icon metrics-refresh-icon" style={{maskImage:"url(/icons/refresh-outline.svg)"}} aria-hidden="true"/>{t(pending?"metricsRefreshing":"metricsRefresh")}</button>
    </div>
    {searchError&&<p id={`${id}-search-error`} className="activity-error" role="alert">{t("activitySearchError")}</p>}
    {collaborators?.status!=="ready"&&<p className="activity-error" role="alert">{t("filtersRosterError")}</p>}
    <section className="activity-list-card" aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`}>{heading}</h2>
      {result.status!=="ready"?<div><p className="activity-error" role="alert">{t(result.status==="invalid"?"filtersInvalid":result.status==="denied"?"deniedError":"activityLoadError")}</p>{result.status==="invalid"&&<Link href="/activity">{t("filtersReset")}</Link>}</div>:
        <><p className="activity-records">{t("activityRecords",{count:result.data.total})}</p>
          {result.data.total===0?<p className="activity-empty">{t("activityEmpty")}</p>:<>
            <div className="activity-table-scroll" role="region" aria-label={heading} tabIndex={0}><table className="activity-table" aria-labelledby={`${id}-title`}>
              <thead><tr><th scope="col">{t(filters.view==="month"?"activityDateTime":"activityTime")}</th><th scope="col">{t("filterPerson")}</th><th scope="col">{t("activityBike")}</th><th scope="col">{t("activityActions")}</th><th scope="col">{t("activityValidity")}</th><th scope="col"><span className="activity-sr-only">{t("detailTitle")}</span></th></tr></thead>
              <tbody>{result.data.items.map(item=><tr key={item.id} className={selectedAction===item.id?"activity-row--selected":undefined}><td><time dateTime={item.created_at}>{new Intl.DateTimeFormat(locale,{...(filters.view==="month"?{day:"numeric" as const,month:"short" as const}:{}),hour:"2-digit",minute:"2-digit",hourCycle:"h23",timeZone:"Europe/Dublin"}).format(new Date(item.created_at))}</time></td><td>{item.full_name}</td><th scope="row"><button type="button" className="activity-open-detail" aria-label={t("detailOpen",{bike:item.bike_external_id})} onClick={()=>setSelectedAction(item.id)}>{item.bike_external_id}</button></th><td><div className="activity-action-icons">{actions.filter(action=>item[action.field]).map(action=><span key={action.field} role="img" aria-label={t(action.label)} className={`metrics-icon activity-action-icon${action.icon==="kickstand"?" activity-kickstand-icon":""}`} style={{maskImage:`url(/icons/${action.icon}.svg)`}}/>)}</div></td><td><span className={`activity-status${item.counted?"":" activity-status--invalid"}`}><span aria-hidden="true">{item.counted?"✓":"×"}</span>{t(item.counted?"activityValid":"activityInvalid")}</span></td><td><button type="button" className="activity-detail-chevron" aria-label={t("detailOpen",{bike:item.bike_external_id})} onClick={()=>setSelectedAction(item.id)}><span aria-hidden="true">›</span></button></td></tr>)}</tbody>
            </table></div>
            {result.data.items.length===0&&<p className="activity-empty">{t("activityEmptyPage")}</p>}
            <footer className="activity-pagination"><p>{t("activityRange",{from:format.format(result.data.items.length?filters.offset+1:0),to:format.format(result.data.items.length?Math.min(filters.offset+result.data.items.length,result.data.total):0),total:format.format(result.data.total)})}</p><div><button type="button" disabled={pending||filters.offset===0} onClick={()=>navigate({...filters,offset:Math.max(0,filters.offset-25),asOf:result.data.as_of})}><span aria-hidden="true">‹</span><span>{t("activityPrevious")}</span></button><button type="button" disabled={pending||!result.data.has_more} onClick={()=>navigate({...filters,offset:filters.offset+25,asOf:result.data.as_of})}><span>{t("activityNext")}</span><span aria-hidden="true">›</span></button></div></footer>
          </>}
        </>}
    </section>
    </div>
    {selectedAction&&result.status==="ready"&&<ActivityDetailPanel key={selectedAction} actionId={selectedAction} asOf={result.data.as_of} onClose={()=>setSelectedAction(null)}/>}
  </div>;
}
