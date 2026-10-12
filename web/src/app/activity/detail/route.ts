import {createSupabaseServerClient} from "../../../lib/supabase/server";
import {getSupabaseConfig} from "../../../lib/supabase/config";
import {readSupervisorAccess} from "../../../lib/auth/access";
import {readActivityDetail} from "../../../lib/activity/read-activity-detail";
import {isUuid} from "../../../lib/metrics/summary-filters";
import {activityInstant} from "../../../lib/activity/activity-filters";
export const dynamic="force-dynamic";
const headers={"Cache-Control":"private, no-store, max-age=0","Vary":"Cookie","Referrer-Policy":"no-referrer"};
export async function GET(request:Request){
  const reply=(body:unknown,status=200)=>Response.json(body,{status,headers});
  try{
    const config=getSupabaseConfig();if(!config)return reply({status:"unavailable"},503);
    const client=await createSupabaseServerClient({signal:AbortSignal.any([request.signal,AbortSignal.timeout(15000)])});
    const access=await readSupervisorAccess(client);
    if(access.status!=="authorized")return reply({status:access.status==="unavailable"?"unavailable":"denied"},access.status==="anonymous"?401:access.status==="denied"?403:503);
    const params=new URL(request.url).searchParams,id=params.get("id"),cutoff=params.get("asOf");
    if(params.getAll("id").length!==1||params.getAll("asOf").length!==1||!isUuid(id)||!activityInstant(cutoff)||Date.parse(cutoff)>Date.now())return reply({status:"unavailable"},400);
    const result=await readActivityDetail(client,id,cutoff,config.url);
    return reply(result,result.status==="denied"?403:result.status==="missing"?404:result.status==="unavailable"?503:200);
  }catch{return reply({status:"unavailable"},503);}
}
