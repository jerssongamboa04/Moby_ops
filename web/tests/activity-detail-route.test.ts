import {beforeEach,expect,test,vi} from "vitest";
import {GET} from "../src/app/activity/detail/route";
const m=vi.hoisted(()=>({access:vi.fn(),read:vi.fn(),client:vi.fn()}));
vi.mock("../src/lib/supabase/config",()=>({getSupabaseConfig:()=>({url:"https://test.supabase.co",key:"sb_publishable_test"})}));
vi.mock("../src/lib/supabase/server",()=>({createSupabaseServerClient:m.client}));
vi.mock("../src/lib/auth/access",()=>({readSupervisorAccess:m.access}));
vi.mock("../src/lib/activity/read-activity-detail",()=>({readActivityDetail:m.read}));
const id="00000000-0000-4000-8000-000000000001",cutoff="2024-03-31T23:30:00Z";
beforeEach(()=>{vi.clearAllMocks();m.client.mockResolvedValue({requestScoped:true});m.access.mockResolvedValue({status:"authorized"});m.read.mockResolvedValue({status:"ready",data:{id}});});
function req(query=`id=${id}&asOf=${cutoff}`){return new Request(`https://moby.test/activity/detail?${query}`);}
test("verifies supervisor on every request and returns private uncacheable data",async()=>{const response=await GET(req());expect(response.status).toBe(200);expect(response.headers.get("cache-control")).toContain("no-store");expect(response.headers.get("vary")).toBe("Cookie");expect(m.read).toHaveBeenCalledWith({requestScoped:true},id,cutoff,"https://test.supabase.co");expect(m.client.mock.calls[0][0].signal).toBeInstanceOf(AbortSignal);});
test.each([["anonymous",401],["denied",403],["unavailable",503]])("denies %s before inspecting or fetching detail",async(status,code)=>{m.access.mockResolvedValue({status});expect((await GET(req())).status).toBe(code);expect(m.read).not.toHaveBeenCalled();});
test("rejects malformed or repeated parameters and future cutoffs",async()=>{for(const query of [`id=wrong&asOf=${cutoff}`,`id=${id}&id=${id}&asOf=${cutoff}`,`id=${id}&asOf=2999-01-01T00:00:00Z`])expect((await GET(req(query))).status).toBe(400);expect(m.read).not.toHaveBeenCalled();});
test("returns no internal errors or paths on unexpected failure",async()=>{m.read.mockRejectedValue(new Error("private path / secrets"));const response=await GET(req());expect(response.status).toBe(503);expect(await response.json()).toEqual({status:"unavailable"});});
