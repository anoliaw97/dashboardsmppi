import { ColumnDef } from "./types";
import { Lang, t, colLabel, TranslationKey } from "./translations";
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

interface DataSourceRaw {
  id: string;
  labelKey: TranslationKey;
  descKey: TranslationKey;
  columnKeys: string[];
  data: AnyRecord[];
  filterColumns: string[];
  dateColumns: string[];
}

const dataSourcesRaw: DataSourceRaw[] = [
  {
    id: "pensyarah",
    labelKey: "ds.pensyarah.label",
    descKey: "ds.pensyarah.desc",
    columnKeys: [
      "User_Name", "User_Ic", "User_NoPer", "User_Salutation",
      "User_Position", "User_Dept", "User_Email", "User_Gender",
      "User_Gred", "User_HP", "User_SLantikan", "User_TmtKontrak",
      "PTJ_kod", "Kumpulan", "Kategori", "Status",
    ],
    data: pensyarahData,
    filterColumns: ["Status", "User_Dept", "Kategori", "User_Gender", "User_Gred"],
    dateColumns: ["User_SLantikan", "User_TmtKontrak", "User_dob"],
  },
  {
    id: "pascasiswazah",
    labelKey: "ds.pascasiswazah.label",
    descKey: "ds.pascasiswazah.desc",
    columnKeys: [
      "StudentID", "StudentName", "StudentIC", "Programme", "Faculty",
      "Department", "SupervisorName", "CoSupervisor", "ResearchTitle",
      "EnrollmentDate", "ExpectedCompletion", "Status", "FundingSource",
      "GrantRef", "PublicationCount",
    ],
    data: pascasiswazahData,
    filterColumns: ["Status", "Programme", "Faculty", "FundingSource"],
    dateColumns: ["EnrollmentDate", "ExpectedCompletion"],
  },
  {
    id: "penyelidikan",
    labelKey: "ds.penyelidikan.label",
    descKey: "ds.penyelidikan.desc",
    columnKeys: [
      "DbName", "DbDesc", "Keyword", "URL", "ContactName", "ContactPTJ",
      "CreatedBy", "CreateDate", "LastUpdate", "ApproveBy", "ApproveDate",
      "Active", "Status", "Remarks",
    ],
    data: penyelidikanData,
    filterColumns: ["Status", "Active", "ContactPTJ"],
    dateColumns: ["CreateDate", "SubmitDate", "LastUpdate", "ApproveDate"],
  },
  {
    id: "harta-intelek",
    labelKey: "ds.harta-intelek.label",
    descKey: "ds.harta-intelek.desc",
    columnKeys: [
      "IDIntellectual", "ProjectID", "IntellectualProperty", "ProductName",
      "CommercialPotential", "Country", "IntellectualStatusID", "DateFile",
      "DatePass", "PatentNumber", "Income", "CertificateDate", "ValidDate",
      "Agent", "ReferenceNo", "UpdatedBy", "UpdateDate",
    ],
    data: hartaIntelekData,
    filterColumns: ["IntellectualProperty", "IntellectualStatusID", "CommercialPotential", "Agent"],
    dateColumns: ["DateFile", "DatePass", "CertificateDate", "ValidDate", "UpdateDate"],
  },
  {
    id: "penyeliaan",
    labelKey: "ds.penyeliaan.label",
    descKey: "ds.penyeliaan.desc",
    columnKeys: [
      "SupervisionID", "SupervisorName", "StudentName", "Programme",
      "ResearchTitle", "Role", "StartDate", "EndDate", "Status",
      "Faculty", "Department", "VivaDate", "Result",
    ],
    data: penyeliaanData,
    filterColumns: ["Status", "Role", "Faculty", "Programme"],
    dateColumns: ["StartDate", "EndDate", "VivaDate"],
  },
];

export function getDataSources(lang: Lang): DataSourceConfig[] {
  return dataSourcesRaw.map((raw) => ({
    id: raw.id,
    label: t(raw.labelKey, lang),
    description: t(raw.descKey, lang),
    columns: raw.columnKeys.map((key) => ({
      key,
      label: colLabel(key, lang),
    })),
    data: raw.data,
    filterColumns: raw.filterColumns,
    dateColumns: raw.dateColumns,
  }));
}

// Default export for backward compatibility
export const dataSources: DataSourceConfig[] = getDataSources("en");
