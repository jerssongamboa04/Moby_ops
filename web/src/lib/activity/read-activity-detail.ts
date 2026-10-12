import type { SupabaseClient } from "@supabase/supabase-js";
import type { ActivityItem } from "./read-team-activity";
import {isUuid} from "../metrics/summary-filters";
import {activityInstant} from "./activity-filters";
export type EvidencePhoto={id:string;phase:"before"|"after";captured_at:string;url:string|null};
export type ActivityDetail=ActivityItem & {notes:string|null;latitude:number;longitude:number;evidence:EvidencePhoto[];expiresAt:number};
export type DetailResult={status:"ready";data:ActivityDetail}|{status:"unavailable"|"denied"|"missing"};
function record(v:unknown):v is Record<string,unknown>{return !!v&&typeof v==="object"&&!Array.isArray(v);}
export async function readActivityDetail(client:Pick<SupabaseClient,"rpc"|"storage">,id:string,cutoff:string,origin:string):Promise<DetailResult>{
  const issuedAt=Date.now();
  try{
    if(!isUuid(id)||!activityInstant(cutoff))return {status:"unavailable"};
    const {data:v,error}=await client.rpc("read_team_activity_detail",{p_action_id:id,p_as_of:cutoff}).abortSignal(AbortSignal.timeout(10000));
    if(error)return {status:error.code==="42501"?"denied":"unavailable"};
    if(v===null)return {status:"missing"};
    if(!record(v)||v.id!==id||!isUuid(v.employee_id)||typeof v.full_name!=="string"||!v.full_name.trim()||typeof v.bike_external_id!=="string"||!/^[A-Z0-9]{10}$/.test(v.bike_external_id)||!activityInstant(v.created_at)||!activityInstant(v.as_of)||Date.parse(v.as_of)!==Date.parse(cutoff)||Date.parse(v.created_at)>Date.parse(cutoff)||![v.bike_locked,v.kickstand_positioned,v.bike_repositioned,v.counted].every(b=>typeof b==="boolean")||!(v.bike_locked||v.kickstand_positioned||v.bike_repositioned)||(v.counted?v.duplicate_of!==null:!isUuid(v.duplicate_of)||v.duplicate_of===id)||(v.notes!==null&&typeof v.notes!=="string")||typeof v.latitude!=="number"||!Number.isFinite(v.latitude)||Math.abs(v.latitude)>90||typeof v.longitude!=="number"||!Number.isFinite(v.longitude)||Math.abs(v.longitude)>180||!Array.isArray(v.evidence))return {status:"unavailable"};
    const photos:Array<EvidencePhoto & {path:string}>=[],ids=new Set<string>(),paths=new Set<string>();
    for(const p of v.evidence){
      if(!record(p)||!isUuid(p.id)||ids.has(p.id)||(p.phase!=="before"&&p.phase!=="after")||!activityInstant(p.captured_at)||typeof p.storage_path!=="string"||paths.has(p.storage_path)||!p.storage_path.startsWith(`${v.employee_id}/${id}/${p.phase}/`)||!isUuid(p.storage_path.split("/")[3]?.replace(/\.webp$/,""))||!p.storage_path.endsWith(".webp")||p.storage_path.split("/").length!==4)return {status:"unavailable"};
      ids.add(p.id);paths.add(p.storage_path);photos.push({id:p.id,phase:p.phase,captured_at:p.captured_at,path:p.storage_path,url:null});
    }
    if(photos.length){
      const signed=await client.storage.from("public-order-evidence").createSignedUrls(photos.map(p=>p.path),300);
      if(!signed.error&&Array.isArray(signed.data))for(const photo of photos){
        const match=signed.data.find(p=>p.path===photo.path);
        if(!match?.error&&match?.signedUrl){const url=new URL(match.signedUrl);if(url.origin===new URL(origin).origin&&url.pathname.startsWith("/storage/v1/object/sign/public-order-evidence/"))photo.url=url.href;}
      }
    }
    return {status:"ready",data:{id,employee_id:v.employee_id,full_name:v.full_name.trim(),bike_external_id:v.bike_external_id,created_at:v.created_at,bike_locked:v.bike_locked as boolean,kickstand_positioned:v.kickstand_positioned as boolean,bike_repositioned:v.bike_repositioned as boolean,counted:v.counted as boolean,duplicate_of:v.duplicate_of as string|null,notes:v.notes as string|null,latitude:v.latitude,longitude:v.longitude,evidence:photos.map(photo=>({id:photo.id,phase:photo.phase,captured_at:photo.captured_at,url:photo.url})),expiresAt:issuedAt+300000}};
  }catch{return {status:"unavailable"};}
}
