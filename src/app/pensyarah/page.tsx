"use client";

import DataTable from "@/components/DataTable";
import { pensyarahData } from "@/lib/mock-data";
import { ColumnDef } from "@/lib/types";
import StatsCard from "@/components/StatsCard";
import { Users, UserCheck, UserX, Building } from "lucide-react";

const columns: ColumnDef[] = [
  { key: "User_Name", label: "Nama" },
  { key: "User_Ic", label: "No. IC" },
  { key: "User_NoPer", label: "No. Pekerja" },
  { key: "User_Salutation", label: "Gelaran" },
  { key: "User_Position", label: "Jawatan" },
  { key: "User_Dept", label: "Jabatan" },
  { key: "User_Email", label: "Emel" },
  { key: "User_Gender", label: "Jantina" },
  { key: "User_Gred", label: "Gred" },
  { key: "User_HP", label: "No. HP" },
  { key: "PTJ_kod", label: "Kod PTJ" },
  { key: "Kumpulan", label: "Kumpulan" },
  { key: "Kategori", label: "Kategori" },
  { key: "Status", label: "Status" },
];

export default function PensyarahPage() {
  const aktif = pensyarahData.filter((d) => d.Status === "Aktif").length;
  const tidakAktif = pensyarahData.length - aktif;
  const jabatan = new Set(pensyarahData.map((d) => d.User_Dept)).size;

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">
          Data Umum Pensyarah
        </h1>
        <p className="text-slate-500 mt-1">
          Maklumat profil pensyarah termasuk data peribadi, jawatan, jabatan, dan gred
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard title="Jumlah Pensyarah" value={pensyarahData.length} icon={Users} color="blue" />
        <StatsCard title="Aktif" value={aktif} icon={UserCheck} color="green" />
        <StatsCard title="Tidak Aktif / Cuti" value={tidakAktif} icon={UserX} color="red" />
        <StatsCard title="Jabatan" value={jabatan} icon={Building} color="purple" />
      </div>

      <DataTable
        data={pensyarahData}
        columns={columns}
        title="Senarai Pensyarah"
        exportFilename="Data_Umum_Pensyarah"
        filterColumns={["Status", "User_Dept", "Kategori", "User_Gender"]}
      />
    </div>
  );
}
