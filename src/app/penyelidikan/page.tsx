"use client";

import DataTable from "@/components/DataTable";
import { penyelidikanData } from "@/lib/mock-data";
import { ColumnDef } from "@/lib/types";
import StatsCard from "@/components/StatsCard";
import { Database, CheckCircle, Clock, Building } from "lucide-react";

const columns: ColumnDef[] = [
  { key: "DbName", label: "Nama Pangkalan Data" },
  { key: "DbDesc", label: "Penerangan" },
  { key: "Keyword", label: "Kata Kunci" },
  { key: "URL", label: "URL" },
  { key: "ContactName", label: "Nama Hubungan" },
  { key: "ContactPTJ", label: "PTJ" },
  { key: "CreatedBy", label: "Dibuat Oleh" },
  { key: "CreateDate", label: "Tarikh Cipta" },
  { key: "LastUpdate", label: "Kemaskini Terakhir" },
  { key: "ApproveBy", label: "Diluluskan Oleh" },
  { key: "ApproveDate", label: "Tarikh Lulus" },
  { key: "Active", label: "Aktif" },
  { key: "Status", label: "Status" },
  { key: "Remarks", label: "Catatan" },
];

export default function PenyelidikanPage() {
  const aktif = penyelidikanData.filter((d) => d.Active === "Ya").length;
  const diluluskan = penyelidikanData.filter((d) => d.Status === "Diluluskan").length;
  const ptj = new Set(penyelidikanData.map((d) => d.ContactPTJ)).size;

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">
          Data Penyelidikan
        </h1>
        <p className="text-slate-500 mt-1">
          Pangkalan data penyelidikan, kata kunci, URL, dan maklumat hubungan penyelidik
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard title="Jumlah Pangkalan Data" value={penyelidikanData.length} icon={Database} color="purple" />
        <StatsCard title="Aktif" value={aktif} icon={CheckCircle} color="green" />
        <StatsCard title="Diluluskan" value={diluluskan} icon={Clock} color="blue" />
        <StatsCard title="PTJ Terlibat" value={ptj} icon={Building} color="orange" />
      </div>

      <DataTable
        data={penyelidikanData}
        columns={columns}
        title="Senarai Pangkalan Data Penyelidikan"
        exportFilename="Data_Penyelidikan"
        filterColumns={["Status", "Active", "ContactPTJ"]}
      />
    </div>
  );
}
