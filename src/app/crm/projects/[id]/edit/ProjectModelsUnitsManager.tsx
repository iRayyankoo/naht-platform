import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ModelForm from "../models/ModelForm";
import DeleteModelButton from "../models/DeleteModelButton";
import UnitClassificationForm from "../units/UnitClassificationForm";
import QuickAddUnitForm from "./QuickAddUnitForm";

interface ProjectModelsUnitsManagerProps {
  projectId: string;
}

export default async function ProjectModelsUnitsManager({ projectId }: ProjectModelsUnitsManagerProps) {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === "ADMIN";

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      name: true,
      planImage: true,
      models: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        include: {
          units: { orderBy: { sortOrder: "asc" } },
        },
      },
      units: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!project) return null;

  const allUnits = project.units;
  const allModels = project.models;
  const unassignedUnits = allUnits.filter((u) => u.modelId === null);
  const availableUnits = allUnits.filter((u) => u.status === "AVAILABLE");

  const modelsList = allModels.map((m) => ({ id: m.id, name: m.name, code: m.code }));

  const statusBadge = (s: string) =>
    s === "AVAILABLE"
      ? "bg-green-100 text-green-700"
      : s === "SOLD"
      ? "bg-red-100 text-red-700"
      : "bg-yellow-100 text-yellow-700";
  const statusLabel = (s: string) =>
    s === "AVAILABLE" ? "متاح" : s === "SOLD" ? "مباع" : "محجوز";

  return (
    <section id="models-units" className="space-y-6 mt-6" dir="rtl">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#D4AF37]/10 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900">النماذج والوحدات</h2>
        </div>
        <Link
          href={`/crm/projects/${projectId}/models`}
          className="text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 transition"
        >
          الإدارة المتقدمة ←
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{allModels.length}</div>
          <div className="text-xs text-gray-500 mt-1">النماذج</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{allUnits.length}</div>
          <div className="text-xs text-gray-500 mt-1">إجمالي الوحدات</div>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-100 shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-green-700">{availableUnits.length}</div>
          <div className="text-xs text-green-600 mt-1">متاحة</div>
        </div>
        <div className={`rounded-xl border shadow-sm p-4 text-center ${unassignedUnits.length > 0 ? "bg-amber-50 border-amber-200" : "bg-gray-50 border-gray-100"}`}>
          <div className={`text-2xl font-bold ${unassignedUnits.length > 0 ? "text-amber-700" : "text-gray-500"}`}>{unassignedUnits.length}</div>
          <div className={`text-xs mt-1 ${unassignedUnits.length > 0 ? "text-amber-600" : "text-gray-400"}`}>غير مصنّفة</div>
        </div>
      </div>

      {/* Add New Model Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 pt-5">
          <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-[#D4AF37] rounded-full"></span>
            إضافة نموذج جديد
          </h3>
        </div>
        {/* ModelForm is a client component with its own form — safe outside project form */}
        <div className="px-5 pb-5">
          <ModelForm projectId={projectId} />
        </div>
      </div>

      {/* Models List */}
      {allModels.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <span className="w-1 h-4 bg-[#D4AF37] rounded-full"></span>
            نماذج المشروع ({allModels.length})
          </h3>

          {allModels.map((model) => (
            <div key={model.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Model Card Header */}
              <div className="p-4 bg-gray-50 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Model thumbnail */}
                  {model.planImage ? (
                    <div className="w-14 h-14 rounded-lg bg-white border border-gray-200 overflow-hidden relative shrink-0">
                      <Image src={model.planImage} alt={model.name} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}

                  {/* Model info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h4 className="font-bold text-gray-900">{model.name}</h4>
                      {model.code && (
                        <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded text-[10px] font-bold">{model.code}</span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        model.status === "AVAILABLE" ? "bg-green-100 text-green-700" :
                        model.status === "SOLD" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                      }`}>
                        {model.status === "AVAILABLE" ? "متاح" : model.status === "SOLD" ? "مباع" : "قريباً"}
                      </span>
                      {!model.isVisible && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px]">مخفي</span>
                      )}
                    </div>
                    {model.description && (
                      <p className="text-xs text-gray-500 line-clamp-1 mb-1">{model.description}</p>
                    )}
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                      {model.area && <span>📐 {model.area} م²</span>}
                      {model.rooms !== null && <span>🛏 {model.rooms} غرف</span>}
                      {model.baths !== null && <span>🚿 {model.baths} حمامات</span>}
                      <span className="font-medium text-gray-700">الوحدات: {model.units.length}</span>
                    </div>
                  </div>

                  {/* Delete button — ADMIN only */}
                  {isAdmin && (
                    <div className="shrink-0 w-full sm:w-40">
                      <DeleteModelButton
                        id={model.id}
                        unitsCount={model.units.length}
                        disabled={model.units.length > 0}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Edit Model Form (collapsible) — own form, not nested */}
              <div className="px-4 border-b border-gray-100">
                <ModelForm projectId={projectId} initialData={model} />
              </div>

              {/* Units under this model */}
              <div className="p-4">
                <h5 className="text-xs font-bold text-gray-600 mb-3 flex items-center justify-between">
                  <span>الوحدات ({model.units.length})</span>
                </h5>

                {/* Quick Add Unit Form */}
                <QuickAddUnitForm projectId={projectId} modelId={model.id} modelName={model.name} />

                {/* Units table */}
                {model.units.length > 0 ? (
                  <div className="mt-3 border border-gray-100 rounded-lg overflow-hidden">
                    <table className="min-w-full text-xs">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-right font-medium text-gray-500">رقم</th>
                          <th className="px-3 py-2 text-right font-medium text-gray-500">النوع</th>
                          <th className="px-3 py-2 text-right font-medium text-gray-500">المساحة</th>
                          <th className="px-3 py-2 text-right font-medium text-gray-500">السعر</th>
                          <th className="px-3 py-2 text-right font-medium text-gray-500">الحالة</th>
                          <th className="px-3 py-2 text-right font-medium text-gray-500">تصنيف</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {model.units.map((unit) => (
                          <tr key={unit.id} className="hover:bg-gray-50">
                            <td className="px-3 py-2 font-bold text-gray-800">{unit.unitNum}</td>
                            <td className="px-3 py-2 text-gray-600">{unit.type || "—"}</td>
                            <td className="px-3 py-2 text-gray-600">{unit.area ? `${unit.area} م²` : "—"}</td>
                            <td className="px-3 py-2 text-[#D4AF37] font-medium">{unit.price ? unit.price.toLocaleString() : "—"}</td>
                            <td className="px-3 py-2">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${statusBadge(unit.status)}`}>
                                {statusLabel(unit.status)}
                              </span>
                            </td>
                            <td className="px-3 py-2">
                              <UnitClassificationForm
                                unitId={unit.id}
                                projectId={projectId}
                                initialModelId={unit.modelId}
                                initialFloor={unit.floor}
                                initialFacade={unit.facade}
                                initialUnitPlanImage={unit.unitPlanImage}
                                initialSortOrder={unit.sortOrder}
                                models={modelsList}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic mt-2 text-center py-3 bg-gray-50 rounded-lg">
                    لا توجد وحدات في هذا النموذج. استخدم النموذج أعلاه لإضافة وحدة.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty models state */}
      {allModels.length === 0 && (
        <div className="text-center py-10 bg-white rounded-xl border border-gray-200 shadow-sm">
          <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-sm text-gray-500">لا توجد نماذج مضافة بعد. استخدم نموذج &quot;إضافة نموذج جديد&quot; أعلاه.</p>
        </div>
      )}

      {/* Unassigned Units */}
      {unassignedUnits.length > 0 && (
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-amber-600 text-lg">⚠</span>
            <h3 className="text-sm font-bold text-amber-800">
              وحدات غير مرتبطة بنموذج ({unassignedUnits.length})
            </h3>
          </div>
          <p className="text-xs text-amber-700 mb-4">
            هذه الوحدات لم تُربط بنموذج محدد. استخدم &quot;تصنيف&quot; لربطها بالنموذج المناسب.
          </p>
          <div className="space-y-3">
            {unassignedUnits.map((unit) => (
              <div key={unit.id} className="bg-white rounded-lg border border-amber-100 p-3 flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="font-bold text-sm text-gray-800">وحدة {unit.unitNum}</div>
                  {unit.type && <span className="text-xs text-gray-500">{unit.type}</span>}
                  {unit.area && <span className="text-xs text-gray-500">{unit.area} م²</span>}
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${statusBadge(unit.status)}`}>
                    {statusLabel(unit.status)}
                  </span>
                </div>
                <UnitClassificationForm
                  unitId={unit.id}
                  projectId={projectId}
                  initialModelId={null}
                  initialFloor={unit.floor}
                  initialFacade={unit.facade}
                  initialUnitPlanImage={unit.unitPlanImage}
                  initialSortOrder={unit.sortOrder}
                  models={modelsList}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
