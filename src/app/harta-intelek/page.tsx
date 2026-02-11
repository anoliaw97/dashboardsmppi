"use client";

import DataTable from "@/components/DataTable";
import { hartaIntelekData } from "@/lib/mock-data";
import { ColumnDef } from "@/lib/types";
import StatsCard from "@/components/StatsCard";
import { Lightbulb, DollarSign, Award, Clock } from "lucide-react";

const columns: ColumnDef[] = [
  { key: "IDIntellectual", label: "ID" },
  { key: "ProjectID", label: "ID Projek" },
  { key: "IntellectualProperty", label: "Jenis IP" },
  { key: "ProductName", label: "Nama Produk" },
  { key: "CommercialPotential", label: "Potensi Komersial" },
  { key: "Country", label: "Negara" },
  { key: "IntellectualStatusID", label: "Status" },
  { key: "DateFile", label: "Tarikh Fail" },
  { key: "DatePass", label: "Tarikh Lulus" },
  { key: "PatentNumber", label: "No. Paten" },
  { key: "Income", label: "Pendapatan (RM)" },
  { key: "CertificateDate", label: "Tarikh Sijil" },
  { key: "ValidDate", label: "Tarikh Sah" },
  { key: "Agent", label: "Agen" },
  { key: "ReferenceNo", label: "No. Rujukan" },
  { key: "UpdatedBy", label: "Dikemaskini Oleh" },
  { key: "UpdateDate", label: "Tarikh Kemaskini" },
];

export default function HartaIntelekPage() {
  const diluluskan = hartaIntelekData.filter((d) => d.IntellectualStatusID === "Diluluskan").length;
  const dalamProses = hartaIntelekData.filter((d) => d.IntellectualStatusID === "Dalam Proses").length;
  const totalIncome = hartaIntelekData.reduce((sum, d) => sum + d.Income, 0);

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">
          Data Harta Intelek
        </h1>
        <p className="text-slate-500 mt-1">
          Rekod harta intelek termasuk paten, hak cipta, cap dagangan, dan maklumat komersial
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard title="Jumlah IP" value={hartaIntelekData.length} icon={Lightbulb} color="orange" />
        <StatsCard title="Diluluskan" value={diluluskan} icon={Award} color="green" />
        <StatsCard title="Dalam Proses" value={dalamProses} icon={Clock} color="blue" />
        <StatsCard
          title="Jumlah Pendapatan"
          value={`RM ${totalIncome.toLocaleString()}`}
          icon={DollarSign}
          color="purple"
        />
      </div>

      <DataTable
        data={hartaIntelekData}
        columns={columns}
        title="Senarai Harta Intelek"
        exportFilename="Data_Harta_Intelek"
        filterColumns={["IntellectualProperty", "IntellectualStatusID", "CommercialPotential", "Agent"]}
      />
    </div>
  );
}
