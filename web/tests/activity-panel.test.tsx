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
it("toggles performed tasks independently with keyboard support and resets for a new period",async()=>{
  const user=userEvent.setup();
  const second={...item,id:"00000000-0000-4000-8000-000000008408",bike_external_id:"39E9900404",counted:false};
  const result={status:"ready" as const,data:{...data,total:2,items:[item,second]}};
  const ui=render(<LocaleProvider><ActivityPanel {...props} result={result}/></LocaleProvider>);
  const toggle=screen.getByRole("button",{name:"Ver tareas de IE12H02911"});
  expect(toggle.getAttribute("aria-expanded")).toBe("false");
  const controlled=toggle.getAttribute("aria-controls")!.split(" ");
  expect(controlled).toHaveLength(2);
  controlled.forEach(id=>expect(document.getElementById(id)).toBeTruthy());
  await user.click(toggle);
  expect(toggle.getAttribute("aria-expanded")).toBe("true");
  expect(toggle.closest("tr")?.getAttribute("data-expanded")).toBe("true");
  expect(screen.getByRole("button",{name:"Ver tareas de 39E9900404"}).getAttribute("aria-expanded")).toBe("false");
  await user.keyboard("{Enter}");
  expect(toggle.getAttribute("aria-expanded")).toBe("false");
  await user.click(toggle);
  ui.rerender(<LocaleProvider><ActivityPanel {...props} filters={{...filters,view:"month",date:"2026-10-01"}} result={result}/></LocaleProvider>);
  expect(screen.getByRole("button",{name:"Ver tareas de IE12H02911"}).getAttribute("aria-expanded")).toBe("false");
});
it("provides readable task labels and a detail action with full month row identity",()=>{
  render(<LocaleProvider><ActivityPanel {...props} filters={{...filters,view:"month",date:"2026-10-01"}} result={{status:"ready",data:{...data,valid:0,invalid:1,items:[{...item,full_name:"Ana Pérez González",counted:false,bike_repositioned:true}]}}}/></LocaleProvider>);
  const row=within(screen.getByRole("table")).getAllByRole("row")[1];
  expect(within(row).getByText("Ana Pérez González")).toBeTruthy();
  expect(within(row).getByText("11 oct, 11:00")).toBeTruthy();
  expect(within(row).getByText("Candado")).toBeTruthy();
  expect(within(row).getByText("Pata puesta")).toBeTruthy();
  expect(within(row).getByText("Reubicada")).toBeTruthy();
  expect(within(row).getByText("Inválida")).toBeTruthy();
  expect(within(row).getByText("Ver detalle")).toBeTruthy();
  expect(within(row).getAllByRole("button",{name:"Ver detalle de IE12H02911"})).toHaveLength(2);
});
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
it("uses the language selected in Summary for dates, columns and status",async()=>{
  const user=userEvent.setup();const ui=render(<LocaleProvider><DashboardShell page="summary" fullName="Jersson" /></LocaleProvider>);await user.click(screen.getByRole("button",{name:"Inglés"}));ui.rerender(<LocaleProvider><DashboardShell page="activity" fullName="Jersson"><ActivityPanel {...props}/></DashboardShell></LocaleProvider>);expect(screen.getByRole("table",{name:"Today's actions"})).toBeTruthy();expect(screen.getByText("Valid")).toBeTruthy();expect(screen.getByRole("button",{name:/^Date: Today/})).toBeTruthy();
});

it("marks repeated submissions as invalid and shows an empty page without inventing its range",()=>{
  const ui=render(<LocaleProvider><ActivityPanel {...props} result={{status:"ready",data:{...data,valid:0,invalid:1,items:[{...item,counted:false,duplicate_of:"00000000-0000-4000-8000-000000008406"}]}}}/></LocaleProvider>);
  expect(screen.getByText("Inválida")).toBeTruthy();
  ui.rerender(<LocaleProvider><ActivityPanel {...props} filters={{...filters,offset:25,asOf:data.as_of}} result={{status:"ready",data:{...data,items:[]}}}/></LocaleProvider>);
  expect(screen.getByText("0–0 de 1")).toBeTruthy();expect(screen.getByRole("button",{name:"Anterior"}).hasAttribute("disabled")).toBe(false);
});
