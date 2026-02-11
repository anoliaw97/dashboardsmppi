"use client";

import DataTable from "@/components/DataTable";
import { pascasiswazahData } from "@/lib/mock-data";
import { ColumnDef } from "@/lib/types";
import StatsCard from "@/components/StatsCard";
import { GraduationCap, BookOpen, Award, TrendingUp } from "lucide-react";

const columns: ColumnDef[] = [
  { key: "StudentID", label: "ID Pelajar" },
  { key: "StudentName", label: "Nama Pelajar" },
  { key: "StudentIC", label: "No. IC" },
  { key: "Programme", label: "Program" },
  { key: "Faculty", label: "Fakulti" },
  { key: "Department", label: "Jabatan" },
  { key: "SupervisorName", label: "Penyelia" },
  { key: "CoSupervisor", label: "Penyelia Bersama" },
  { key: "ResearchTitle", label: "Tajuk Penyelidikan" },
  { key: "EnrollmentDate", label: "Tarikh Daftar" },
  { key: "ExpectedCompletion", label: "Jangka Siap" },
  { key: "Status", label: "Status" },
  { key: "FundingSource", label: "Sumber Dana" },
  { key: "GrantRef", label: "Ref. Geran" },
  { key: "PublicationCount", label: "Bil. Penerbitan" },
];

export default function PascasiswazahPage() {
  const aktif = pascasiswazahData.filter((d) => d.Status === "Aktif").length;
  const totalPub = pascasiswazahData.reduce((sum, d) => sum + d.PublicationCount, 0);
  const frgs = pascasiswazahData.filter((d) => d.FundingSource === "FRGS").length;

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">
          Data Pelajar Pascasiswazah
        </h1>
        <p className="text-slate-500 mt-1">
          Rekod pelajar pascasiswazah termasuk program, penyelia, geran, dan output penyelidikan
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard title="Jumlah Pelajar" value={pascasiswazahData.length} icon={GraduationCap} color="green" />
        <StatsCard title="Aktif" value={aktif} icon={BookOpen} color="blue" />
        <StatsCard title="Jumlah Penerbitan" value={totalPub} icon={Award} color="purple" />
        <StatsCard title="Pelajar FRGS" value={frgs} icon={TrendingUp} color="orange" />
      </div>

      <DataTable
        data={pascasiswazahData}
        columns={columns}
        title="Senarai Pelajar Pascasiswazah"
        exportFilename="Data_Pelajar_Pascasiswazah"
        filterColumns={["Status", "Programme", "Faculty", "FundingSource"]}
      />
    </div>
  );
}
