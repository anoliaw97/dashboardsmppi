"use client";

import DataTable from "@/components/DataTable";
import { penyeliaanData } from "@/lib/mock-data";
import { ColumnDef } from "@/lib/types";
import StatsCard from "@/components/StatsCard";
import { BookOpen, Users, UserCheck, Building } from "lucide-react";

const columns: ColumnDef[] = [
  { key: "SupervisionID", label: "ID" },
  { key: "SupervisorName", label: "Nama Penyelia" },
  { key: "SupervisorIC", label: "IC Penyelia" },
  { key: "StudentName", label: "Nama Pelajar" },
  { key: "StudentIC", label: "IC Pelajar" },
  { key: "Programme", label: "Program" },
  { key: "ResearchTitle", label: "Tajuk Penyelidikan" },
  { key: "Role", label: "Peranan" },
  { key: "StartDate", label: "Tarikh Mula" },
  { key: "EndDate", label: "Tarikh Tamat" },
  { key: "Status", label: "Status" },
  { key: "Faculty", label: "Fakulti" },
  { key: "Department", label: "Jabatan" },
  { key: "VivaDate", label: "Tarikh Viva" },
  { key: "Result", label: "Keputusan" },
];

export default function PenyeliaanPage() {
  const aktif = penyeliaanData.filter((d) => d.Status === "Aktif").length;
  const penyelia = new Set(penyeliaanData.map((d) => d.SupervisorIC)).size;
  const fakulti = new Set(penyeliaanData.map((d) => d.Faculty)).size;

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">
          Data Penyeliaan
        </h1>
        <p className="text-slate-500 mt-1">
          Rekod penyeliaan pelajar pascasiswazah termasuk peranan penyelia dan status penyelidikan
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard title="Jumlah Penyeliaan" value={penyeliaanData.length} icon={BookOpen} color="red" />
        <StatsCard title="Aktif" value={aktif} icon={UserCheck} color="green" />
        <StatsCard title="Penyelia Unik" value={penyelia} icon={Users} color="blue" />
        <StatsCard title="Fakulti" value={fakulti} icon={Building} color="purple" />
      </div>

      <DataTable
        data={penyeliaanData}
        columns={columns}
        title="Senarai Penyeliaan"
        exportFilename="Data_Penyeliaan"
        filterColumns={["Status", "Role", "Faculty", "Programme"]}
      />
    </div>
  );
}
