import { ColumnDef } from "./types";
import {
  pensyarahData,
  pascasiswazahData,
  penyelidikanData,
  hartaIntelekData,
  penyeliaanData,
} from "./mock-data";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>;

export interface DataSourceConfig {
  id: string;
  label: string;
  description: string;
  columns: ColumnDef[];
  data: AnyRecord[];
  filterColumns: string[];
  dateColumns: string[];
}

export const dataSources: DataSourceConfig[] = [
  {
    id: "pensyarah",
    label: "Data Umum Pensyarah",
    description: "Profil pensyarah - maklumat peribadi, jawatan, jabatan, gred",
    columns: [
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
      { key: "User_SLantikan", label: "Tarikh Lantikan" },
      { key: "User_TmtKontrak", label: "Tamat Kontrak" },
      { key: "PTJ_kod", label: "Kod PTJ" },
      { key: "Kumpulan", label: "Kumpulan" },
      { key: "Kategori", label: "Kategori" },
      { key: "Status", label: "Status" },
    ],
    data: pensyarahData,
    filterColumns: ["Status", "User_Dept", "Kategori", "User_Gender", "User_Gred"],
    dateColumns: ["User_SLantikan", "User_TmtKontrak", "User_dob"],
  },
  {
    id: "pascasiswazah",
    label: "Data Pelajar Pascasiswazah",
    description: "Pelajar pascasiswazah - program, penyelia, geran, output",
    columns: [
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
    ],
    data: pascasiswazahData,
    filterColumns: ["Status", "Programme", "Faculty", "FundingSource"],
    dateColumns: ["EnrollmentDate", "ExpectedCompletion"],
  },
  {
    id: "penyelidikan",
    label: "Data Penyelidikan",
    description: "Pangkalan data penyelidikan - kata kunci, URL, penyelidik",
    columns: [
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
    ],
    data: penyelidikanData,
    filterColumns: ["Status", "Active", "ContactPTJ"],
    dateColumns: ["CreateDate", "SubmitDate", "LastUpdate", "ApproveDate"],
  },
  {
    id: "harta-intelek",
    label: "Data Harta Intelek",
    description: "Paten, hak cipta, cap dagangan, maklumat komersial",
    columns: [
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
    ],
    data: hartaIntelekData,
    filterColumns: ["IntellectualProperty", "IntellectualStatusID", "CommercialPotential", "Agent"],
    dateColumns: ["DateFile", "DatePass", "CertificateDate", "ValidDate", "UpdateDate"],
  },
  {
    id: "penyeliaan",
    label: "Data Penyeliaan",
    description: "Rekod penyeliaan - penyelia, pelajar, peranan, status",
    columns: [
      { key: "SupervisionID", label: "ID" },
      { key: "SupervisorName", label: "Nama Penyelia" },
      { key: "StudentName", label: "Nama Pelajar" },
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
    ],
    data: penyeliaanData,
    filterColumns: ["Status", "Role", "Faculty", "Programme"],
    dateColumns: ["StartDate", "EndDate", "VivaDate"],
  },
];
