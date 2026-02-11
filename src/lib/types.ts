// ============================================================
// Type definitions matching database schemas
// ============================================================

export interface Pensyarah {
  User_Name: string;
  User_Ic: string;
  User_NoPer: string;
  User_Salutation: string;
  User_Position: string;
  User_Dept: string;
  User_KodJbtn: string;
  User_Ext: string;
  User_Email: string;
  User_Status: string;
  User_NoTel: string;
  User_SLantikan: string;
  User_LPertama: string;
  User_TmtKontrak: string;
  User_Gender: string;
  User_dob: string;
  User_add: string;
  User_HP: string;
  User_OffTel: string;
  User_Fax: string;
  User_GajiPokok: string;
  User_Gred: string;
  User_JwtnPt: string;
  NewUser_Dept: string;
  NewUser_KodJbtn: string;
  PTJ_id: string;
  PTJ_kod: string;
  Kumpulan: string;
  Kategori: string;
  Status: string;
  Enabled: string;
}

export interface Pascasiswazah {
  StudentID: string;
  StudentName: string;
  StudentIC: string;
  Programme: string;
  Faculty: string;
  Department: string;
  SupervisorName: string;
  SupervisorIC: string;
  CoSupervisor: string;
  ResearchTitle: string;
  EnrollmentDate: string;
  ExpectedCompletion: string;
  Status: string;
  FundingSource: string;
  GrantRef: string;
  OutputType: string;
  PublicationCount: number;
}

export interface Penyelidikan {
  DbName: string;
  DbDesc: string;
  Keyword: string;
  URL: string;
  ContactIC: string;
  ContactName: string;
  ContactPTJ: string;
  CreatedBy: string;
  CreateDate: string;
  SubmitDate: string;
  LastUpdate: string;
  ApproveBy: string;
  Remarks: string;
  ApproveDate: string;
  Active: string;
  Status: string;
}

export interface HartaIntelek {
  IDIntellectual: number;
  ProjectID: string;
  ProgressID: string;
  IntellectualProperty: string;
  CommercialPotential: string;
  ProductName: string;
  Country: string;
  IntellectualStatusID: string;
  DateFile: string;
  DatePass: string;
  PatentNumber: string;
  Income: number;
  CertificateDate: string;
  ValidDate: string;
  Agent: string;
  ReferenceNo: string;
  UpdatedBy: string;
  UpdateDate: string;
}

export interface Penyeliaan {
  SupervisionID: number;
  SupervisorIC: string;
  SupervisorName: string;
  StudentIC: string;
  StudentName: string;
  Programme: string;
  ResearchTitle: string;
  Role: string;
  StartDate: string;
  EndDate: string;
  Status: string;
  Faculty: string;
  Department: string;
  VivaDate: string;
  Result: string;
}

export interface ColumnDef {
  key: string;
  label: string;
  sortable?: boolean;
}
