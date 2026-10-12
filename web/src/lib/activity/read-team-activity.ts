import { isUuid } from "../metrics/summary-filters";
import { activityDate, activityInstant, activityToday, type ActivityFilters } from "./activity-filters";
export type ActivityItem = { id: string; employee_id: string; full_name: string; bike_external_id: string; created_at: string; bike_locked: boolean; kickstand_positioned: boolean; bike_repositioned: boolean; counted: boolean; duplicate_of: string | null };
export type ActivityData = { as_of: string; total: number; valid: number; invalid: number; has_more: boolean; items: ActivityItem[] };
export type ActivityResult = { status: "ready"; data: ActivityData } | { status: "unavailable" | "denied" | "invalid" };
type RpcClient={rpc(name:"read_team_activity",params:{p_view:string;p_date:string;p_employee_id:string|null;p_bike_query:string|null;p_validity:string;p_offset:number;p_as_of:string|null}):{abortSignal(signal:AbortSignal):PromiseLike<{data:unknown;error:{code?:string}|null}>}};
function record(value:unknown):value is Record<string,unknown>{return typeof value==="object"&&value!==null&&!Array.isArray(value);}
function parse(value:unknown, filters:ActivityFilters):ActivityData|null{
  if(!record(value)||value.view!==filters.view||value.period!==filters.date||value.employee_id!==filters.employeeId||value.bike_query!==filters.query||value.validity!==filters.validity||
    value.offset!==filters.offset||value.page_size!==25||!activityDate(value.today)||!activityInstant(value.as_of)||
    (filters.asOf&&Date.parse(value.as_of)!==Date.parse(filters.asOf))||filters.date>value.today||activityToday(value.as_of)>value.today||
    ![value.total,value.valid,value.invalid].every(n=>Number.isSafeInteger(n)&&(n as number)>=0)||
    (value.valid as number)+(value.invalid as number)!==value.total||typeof value.has_more!=="boolean"||!Array.isArray(value.items)||
    value.items.length!==Math.min(25,Math.max(0,(value.total as number)-filters.offset))||value.has_more!==((value.total as number)>filters.offset+25))return null;
  const items:ActivityItem[]=[],ids=new Set<string>();
  for(const item of value.items){
    if(!record(item)||!isUuid(item.id)||ids.has(item.id.toLowerCase())||!isUuid(item.employee_id)||(filters.employeeId&&item.employee_id!==filters.employeeId)||
      typeof item.full_name!=="string"||!item.full_name.trim()||typeof item.bike_external_id!=="string"||!/^[A-Z0-9]{10}$/.test(item.bike_external_id)||
      (filters.query&&!item.bike_external_id.includes(filters.query))||!activityInstant(item.created_at)||Date.parse(item.created_at)>Date.parse(value.as_of)||
      (filters.view==="day"?activityToday(item.created_at)!==filters.date:activityToday(item.created_at).slice(0,7)!==filters.date.slice(0,7))||
      ![item.bike_locked,item.kickstand_positioned,item.bike_repositioned,item.counted].every(flag=>typeof flag==="boolean")||
      !(item.bike_locked||item.kickstand_positioned||item.bike_repositioned)||
      (item.counted?item.duplicate_of!==null:(!isUuid(item.duplicate_of)||item.duplicate_of===item.id))||
      (filters.validity==="valid"&&!item.counted)||(filters.validity==="invalid"&&item.counted))return null;
    const previous=items.at(-1);
    if(previous&&(Date.parse(item.created_at)>Date.parse(previous.created_at)||(item.created_at===previous.created_at&&item.id>previous.id)))return null;
    ids.add(item.id.toLowerCase());
    items.push({id:item.id,employee_id:item.employee_id,full_name:item.full_name.trim(),bike_external_id:item.bike_external_id,created_at:item.created_at,
      bike_locked:item.bike_locked as boolean,kickstand_positioned:item.kickstand_positioned as boolean,bike_repositioned:item.bike_repositioned as boolean,counted:item.counted as boolean,duplicate_of:item.duplicate_of as string|null});
  }
  if(items.filter(item=>item.counted).length>(value.valid as number)||items.filter(item=>!item.counted).length>(value.invalid as number))return null;
  return {as_of:value.as_of,total:value.total as number,valid:value.valid as number,invalid:value.invalid as number,has_more:value.has_more,items};
}
export async function readTeamActivity(client:RpcClient,filters:ActivityFilters):Promise<ActivityResult>{
  try{
    const {data,error}=await client.rpc("read_team_activity",{p_view:filters.view,p_date:filters.date,p_employee_id:filters.employeeId,p_bike_query:filters.query,p_validity:filters.validity,p_offset:filters.offset,p_as_of:filters.asOf}).abortSignal(AbortSignal.timeout(10000));
    if(error)return {status:error.code==="42501"?"denied":error.code==="22023"?"invalid":"unavailable"};
    const parsed=parse(data,filters);return parsed?{status:"ready",data:parsed}:{status:"unavailable"};
  }catch{return {status:"unavailable"};}
}
