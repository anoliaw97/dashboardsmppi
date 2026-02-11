"use client";

import Link from "next/link";
import {
  Users,
  GraduationCap,
  Database,
  Lightbulb,
  BookOpen,
  ArrowRight,
  Download,
} from "lucide-react";
import StatsCard from "@/components/StatsCard";
import { exportToExcel } from "@/lib/export-excel";
import {
  pensyarahData,
  pascasiswazahData,
  penyelidikanData,
  hartaIntelekData,
  penyeliaanData,
} from "@/lib/mock-data";

const sections = [
  {
    title: "Data Umum Pensyarah",
    description: "Data profil pensyarah termasuk maklumat peribadi, jawatan, dan jabatan",
    href: "/pensyarah",
    icon: Users,
    color: "blue",
    count: pensyarahData.length,
  },
  {
    title: "Data Pelajar Pascasiswazah",
    description: "Rekod pelajar pascasiswazah, program, penyelia, dan status pengajian",
    href: "/pascasiswazah",
    icon: GraduationCap,
    color: "green",
    count: pascasiswazahData.length,
  },
  {
    title: "Data Penyelidikan",
    description: "Pangkalan data penyelidikan, kata kunci, dan maklumat hubungan",
    href: "/penyelidikan",
    icon: Database,
    color: "purple",
    count: penyelidikanData.length,
  },
  {
    title: "Data Harta Intelek",
    description: "Paten, hak cipta, cap dagangan, dan maklumat komersial",
    href: "/harta-intelek",
    icon: Lightbulb,
    color: "orange",
    count: hartaIntelekData.length,
  },
  {
    title: "Data Penyeliaan",
    description: "Rekod penyeliaan pelajar, peranan penyelia, dan status penyelidikan",
    href: "/penyeliaan",
    icon: BookOpen,
    color: "red",
    count: penyeliaanData.length,
  },
];

export default function Dashboard() {
  const handleExportAll = () => {
    const allData = [
      ...pensyarahData.map((d) => ({ Kategori: "Pensyarah", Nama: d.User_Name, Jabatan: d.User_Dept, Status: d.Status })),
      ...pascasiswazahData.map((d) => ({ Kategori: "Pascasiswazah", Nama: d.StudentName, Jabatan: d.Department, Status: d.Status })),
      ...penyelidikanData.map((d) => ({ Kategori: "Penyelidikan", Nama: d.DbName, Jabatan: d.ContactPTJ, Status: d.Status })),
      ...hartaIntelekData.map((d) => ({ Kategori: "Harta Intelek", Nama: d.ProductName, Jabatan: d.Country, Status: d.IntellectualStatusID })),
      ...penyeliaanData.map((d) => ({ Kategori: "Penyeliaan", Nama: d.SupervisorName, Jabatan: d.Department, Status: d.Status })),
    ];
    exportToExcel(allData, "SMPPI_Ringkasan_Semua_Data", "Ringkasan");
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">
          Dashboard Pengekstrakan Data SMPPI
        </h1>
        <p className="text-slate-500 mt-1">
          Alat pengekstrakan data am untuk mencari dan mengeksport data dari pelbagai pangkalan data
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatsCard
          title="Pensyarah"
          value={pensyarahData.length}
          icon={Users}
          color="blue"
          subtitle="Jumlah rekod"
        />
        <StatsCard
          title="Pascasiswazah"
          value={pascasiswazahData.length}
          icon={GraduationCap}
          color="green"
          subtitle="Jumlah rekod"
        />
        <StatsCard
          title="Penyelidikan"
          value={penyelidikanData.length}
          icon={Database}
          color="purple"
          subtitle="Jumlah rekod"
        />
        <StatsCard
          title="Harta Intelek"
          value={hartaIntelekData.length}
          icon={Lightbulb}
          color="orange"
          subtitle="Jumlah rekod"
        />
        <StatsCard
          title="Penyeliaan"
          value={penyeliaanData.length}
          icon={BookOpen}
          color="red"
          subtitle="Jumlah rekod"
        />
      </div>

      {/* Export All Button */}
      <div className="mb-6 flex justify-end">
        <button
          onClick={handleExportAll}
          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <Download size={16} />
          Eksport Ringkasan Semua Data (Excel)
        </button>
      </div>

      {/* Section Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="group bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`p-3 rounded-lg ${
                  section.color === "blue"
                    ? "bg-blue-100 text-blue-600"
                    : section.color === "green"
                    ? "bg-green-100 text-green-600"
                    : section.color === "purple"
                    ? "bg-purple-100 text-purple-600"
                    : section.color === "orange"
                    ? "bg-orange-100 text-orange-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                <section.icon size={24} />
              </div>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                {section.count} rekod
              </span>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              {section.title}
            </h3>
            <p className="text-sm text-slate-500 mb-4">{section.description}</p>
            <div className="flex items-center text-sm text-blue-600 font-medium group-hover:gap-2 transition-all">
              Lihat Data
              <ArrowRight size={16} className="ml-1" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
