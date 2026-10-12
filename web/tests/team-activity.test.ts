import { expect, it, vi } from "vitest";
import { readTeamActivity } from "../src/lib/activity/read-team-activity";
const id="00000000-0000-4000-8000-000000009402";
const filters={view:"day" as const,date:"2026-10-11",employeeId:id,query:null,validity:"all" as const,offset:0,asOf:null};
const item={id:"00000000-0000-4000-8000-000000008407",employee_id:id,full_name:" Ana ",bike_external_id:"IE12H02911",created_at:"2026-10-11T10:00:00+00:00",bike_locked:true,kickstand_positioned:false,bike_repositioned:false,counted:true,duplicate_of:null};
const data={view:"day",period:filters.date,today:filters.date,as_of:"2026-10-11T12:00:00+00:00",employee_id:id,bike_query:null,validity:"all",offset:0,page_size:25,total:1,valid:1,invalid:0,has_more:false,items:[item]};
function sdk(value:unknown=data,error:unknown=null) { const abort=vi.fn().mockResolvedValue({data:value,error});return {rpc:vi.fn(()=>({abortSignal:abort})),abort}; }
it("queries the protected list with exact filters and strips extra fields",async()=>{
  const client=sdk({...data,items:[{...item,notes:"private",latitude:53}]});
  expect(await readTeamActivity(client,filters)).toEqual({status:"ready",data:{as_of:data.as_of,total:1,valid:1,invalid:0,has_more:false,items:[{...item,full_name:"Ana"}]}});
  expect(client.rpc).toHaveBeenCalledWith("read_team_activity",{p_view:"day",p_date:filters.date,p_employee_id:id,p_bike_query:null,p_validity:"all",p_offset:0,p_as_of:null});
});
it.each([{...data,total:2},{...data,period:"2026-10-10"},{...data,items:[item,item]},{...data,has_more:true},{...data,items:[{...item,employee_id:"00000000-0000-4000-8000-000000009403"}]},{...data,items:[{...item,counted:false,duplicate_of:null}]},{...data,items:[{...item,bike_locked:"true"}]},{...data,as_of:"bad"}])("rejects inconsistent provider data",async value=>{expect(await readTeamActivity(sdk(value),filters)).toEqual({status:"unavailable"});});
it("distinguishes genuine empty data from failures and access rejection",async()=>{
  expect(await readTeamActivity(sdk({...data,total:0,valid:0,items:[]}),filters)).toMatchObject({status:"ready",data:{items:[]}});
  expect(await readTeamActivity(sdk(null,{code:"42501"}),filters)).toEqual({status:"denied"});
  expect(await readTeamActivity(sdk(null,{code:"22023"}),filters)).toEqual({status:"invalid"});
  const client=sdk();client.abort.mockRejectedValue(new Error("network"));expect(await readTeamActivity(client,filters)).toEqual({status:"unavailable"});
});

it("accepts a repeated action with its first-action reference without treating its checks as valid totals",async()=>{
  const repeated={...item,id:"00000000-0000-4000-8000-000000008408",counted:false,duplicate_of:item.id};
  expect(await readTeamActivity(sdk({...data,valid:0,invalid:1,items:[repeated]}),filters)).toMatchObject({status:"ready",data:{valid:0,invalid:1,items:[{counted:false,duplicate_of:item.id}]}});
});
it("preserves the cutoff and global totals on a beyond-last page",async()=>{
  const selected={...filters,offset:25,asOf:data.as_of};
  expect(await readTeamActivity(sdk({...data,offset:25,items:[]}),selected)).toMatchObject({status:"ready",data:{total:1,valid:1,items:[]}});
});
it("rejects a different cutoff or a row outside the selected Dublin date",async()=>{
  expect(await readTeamActivity(sdk({...data,as_of:"2026-10-11T13:00:00Z"}),{...filters,asOf:data.as_of})).toEqual({status:"unavailable"});
  expect(await readTeamActivity(sdk({...data,items:[{...item,created_at:"2026-10-10T10:00:00Z"}]}),filters)).toEqual({status:"unavailable"});
});
