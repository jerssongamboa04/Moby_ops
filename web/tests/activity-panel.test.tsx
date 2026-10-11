import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi, beforeEach } from "vitest";
import { ActivityPanel } from "../src/components/activity-panel";
import { DashboardShell } from "../src/components/dashboard-shell";
import { LocaleProvider } from "../src/i18n/locale-provider";
const router=vi.hoisted(()=>({push:vi.fn(),refresh:vi.fn()}));
vi.mock("next/navigation",()=>({useRouter:()=>router}));
const id="00000000-0000-4000-8000-000000009402";
const filters={view:"day" as const,date:"2026-10-11",employeeId:null,query:null,validity:"all" as const,offset:0,asOf:null};
const item={id:"00000000-0000-4000-8000-000000008407",employee_id:id,full_name:"Ana",bike_external_id:"IE12H02911",created_at:"2026-10-11T10:00:00Z",bike_locked:true,kickstand_positioned:true,bike_repositioned:false,counted:true,duplicate_of:null};
const data={as_of:"2026-10-11T12:00:00+00:00",total:1,valid:1,invalid:0,has_more:false,items:[item]};
const props={filters,today:filters.date,result:{status:"ready" as const,data},collaborators:{status:"ready" as const,data:[{id,full_name:"Ana",is_active:true}]}};
beforeEach(()=>vi.clearAllMocks());
function view(){return render(<LocaleProvider><DashboardShell page="activity" fullName="Jersson"><ActivityPanel {...props}/></DashboardShell></LocaleProvider>);}
it("shows real rows, Dublin time, only performed actions and accessible valid status",()=>{
  view();const table=screen.getByRole("table",{name:"Actuaciones de hoy"});
  expect(within(table).getByText("11:00")).toBeTruthy();expect(within(table).getByText("IE12H02911")).toBeTruthy();
  expect(within(table).getByRole("img",{name:"Pata colocada"})).toBeTruthy();expect(within(table).queryByRole("img",{name:"Reposicionadas"})).toBeNull();
  expect(within(table).getByText("Válida")).toBeTruthy();expect(screen.getByRole("button",{name:"Siguiente"}).hasAttribute("disabled")).toBe(true);
});
it("searches literally through the URL and resets page/cutoff",async()=>{
  const user=userEvent.setup();view();await user.type(screen.getByRole("textbox",{name:"Buscar ID de bicicleta"}),"h02911{Enter}");
  expect(router.push).toHaveBeenCalledWith("/activity?view=day&date=2026-10-11&q=H02911",{scroll:false});
});
it("keeps the date when changing validity and collaborator",async()=>{
  const user=userEvent.setup();view();await user.click(screen.getByRole("button",{name:/^Validez:/}));await user.click(screen.getByRole("radio",{name:"Inválidas"}));
  expect(router.push).toHaveBeenCalledWith("/activity?view=day&date=2026-10-11&validity=invalid",{scroll:false});
  await user.click(screen.getByRole("button",{name:/^Colaborador:/}));await user.click(screen.getByRole("radio",{name:"Ana"}));
  expect(router.push).toHaveBeenCalledWith(`/activity?view=day&date=2026-10-11&employee=${id}`,{scroll:false});
});
it("opens dates from the chevron, disallows future days and picks a real historical day",async()=>{
  const user=userEvent.setup();view();const trigger=screen.getByRole("button",{name:/^Fecha:/});await user.click(trigger.querySelector(".summary-filter-chevron")!);
  expect(screen.getByRole("button",{name:"12 oct 2026"}).hasAttribute("disabled")).toBe(true);
  await user.click(screen.getByRole("button",{name:"10 oct 2026"}));expect(router.push).toHaveBeenCalledWith("/activity?view=day&date=2026-10-10",{scroll:false});
});
it("selects a historical month with the approved month control",async()=>{
  const user=userEvent.setup();view();await user.click(screen.getByRole("button",{name:/^Fecha:/}));await user.click(screen.getByRole("button",{name:"Mes"}));
  await user.click(screen.getByRole("button",{name:"Septiembre 2026"}));expect(router.push).toHaveBeenCalledWith("/activity?view=month&date=2026-09-01",{scroll:false});
});
it("preserves the cutoff while paging and creates a fresh read on Refresh",async()=>{
  const user=userEvent.setup();render(<LocaleProvider><ActivityPanel {...props} result={{status:"ready",data:{...data,total:26,valid:26,has_more:true,items:[item]}}}/></LocaleProvider>);
  await user.click(screen.getByRole("button",{name:"Siguiente"}));expect(router.push).toHaveBeenCalledWith(expect.stringContaining("offset=25&asOf="),{scroll:false});
  await user.click(screen.getByRole("button",{name:"Actualizar"}));expect(router.refresh).toHaveBeenCalledOnce();
});
it("keeps errors separate from real empty data",()=>{
  const ui=render(<LocaleProvider><ActivityPanel {...props} result={{status:"unavailable"}}/></LocaleProvider>);
  expect(screen.getByRole("alert")).toBeTruthy();expect(screen.queryByRole("table")).toBeNull();
  ui.rerender(<LocaleProvider><ActivityPanel {...props} result={{status:"ready",data:{...data,total:0,valid:0,items:[]}}}/></LocaleProvider>);
  expect(screen.queryByRole("alert")).toBeNull();expect(screen.getByText("No hay actuaciones para estos filtros.")).toBeTruthy();
});
it("translates dates, columns and status with the shared language selector",async()=>{
  const user=userEvent.setup();view();await user.click(screen.getByRole("button",{name:"Inglés"}));expect(screen.getByRole("table",{name:"Today's actions"})).toBeTruthy();expect(screen.getByText("Valid")).toBeTruthy();expect(screen.getByRole("button",{name:/^Date: Today/})).toBeTruthy();
});

it("marks repeated submissions as invalid and shows an empty page without inventing its range",()=>{
  const ui=render(<LocaleProvider><ActivityPanel {...props} result={{status:"ready",data:{...data,valid:0,invalid:1,items:[{...item,counted:false,duplicate_of:"00000000-0000-4000-8000-000000008406"}]}}}/></LocaleProvider>);
  expect(screen.getByText("Inválida")).toBeTruthy();
  ui.rerender(<LocaleProvider><ActivityPanel {...props} filters={{...filters,offset:25,asOf:data.as_of}} result={{status:"ready",data:{...data,items:[]}}}/></LocaleProvider>);
  expect(screen.getByText("0–0 de 1")).toBeTruthy();expect(screen.getByRole("button",{name:"Anterior"}).hasAttribute("disabled")).toBe(false);
});
