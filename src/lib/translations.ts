export type Lang = "en" | "ms";

const translations = {
  // Header
  subtitle: {
    en: "Search & Export Data from Multiple Databases",
    ms: "Cari & Eksport Data dari Pelbagai Pangkalan Data",
  },
  totalSources: {
    en: "Total data sources:",
    ms: "Jumlah sumber data:",
  },

  // Data source selector
  selectSource: {
    en: "Select Data Source",
    ms: "Pilih Sumber Data",
  },

  // Search
  searchIn: {
    en: "Search in",
    ms: "Cari dalam",
  },

  // Buttons
  filter: {
    en: "Filter",
    ms: "Tapis",
  },
  columns: {
    en: "Columns",
    ms: "Lajur",
  },

  // Filter area
  all: {
    en: "All",
    ms: "Semua",
  },
  filterByDate: {
    en: "Filter by Date",
    ms: "Tapis Mengikut Tarikh",
  },
  dateColumn: {
    en: "Date Column",
    ms: "Lajur Tarikh",
  },
  selectColumn: {
    en: "-- Select column --",
    ms: "-- Pilih lajur --",
  },
  from: {
    en: "From",
    ms: "Dari",
  },
  to: {
    en: "To",
    ms: "Hingga",
  },
  resetAllFilters: {
    en: "Reset All Filters",
    ms: "Set Semula Semua Penapis",
  },

  // Column picker
  selectColumnsToDisplay: {
    en: "Select columns to display:",
    ms: "Pilih lajur untuk dipaparkan:",
  },
  showAll: {
    en: "Show All",
    ms: "Papar Semua",
  },

  // Results
  searchResults: {
    en: "Search Results",
    ms: "Keputusan Carian",
  },
  of: {
    en: "of",
    ms: "daripada",
  },
  records: {
    en: "records",
    ms: "rekod",
  },
  activeFilters: {
    en: "active filters",
    ms: "penapis aktif",
  },
  exportAll: {
    en: "Export All",
    ms: "Eksport Semua",
  },
  exportFiltered: {
    en: "Export Filtered",
    ms: "Eksport Ditapis",
  },

  // Empty state
  noRecords: {
    en: "No records found",
    ms: "Tiada rekod ditemui",
  },
  tryChanging: {
    en: "Try changing your search or filters",
    ms: "Cuba ubah carian atau penapis anda",
  },

  // Pagination
  rowsPerPage: {
    en: "Rows per page:",
    ms: "Baris per halaman:",
  },
  page: {
    en: "Page",
    ms: "Halaman",
  },

  // Data source labels
  "ds.pensyarah.label": {
    en: "Lecturer Data",
    ms: "Data Umum Pensyarah",
  },
  "ds.pensyarah.desc": {
    en: "Lecturer profiles - personal info, position, department, grade",
    ms: "Profil pensyarah - maklumat peribadi, jawatan, jabatan, gred",
  },
  "ds.pascasiswazah.label": {
    en: "Postgraduate Data",
    ms: "Data Pelajar Pascasiswazah",
  },
  "ds.pascasiswazah.desc": {
    en: "Postgraduate students - programme, supervisor, grant, output",
    ms: "Pelajar pascasiswazah - program, penyelia, geran, output",
  },
  "ds.penyelidikan.label": {
    en: "Research Data",
    ms: "Data Penyelidikan",
  },
  "ds.penyelidikan.desc": {
    en: "Research database - keywords, URL, researchers",
    ms: "Pangkalan data penyelidikan - kata kunci, URL, penyelidik",
  },
  "ds.harta-intelek.label": {
    en: "Intellectual Property Data",
    ms: "Data Harta Intelek",
  },
  "ds.harta-intelek.desc": {
    en: "Patents, copyrights, trademarks, commercial info",
    ms: "Paten, hak cipta, cap dagangan, maklumat komersial",
  },
  "ds.penyeliaan.label": {
    en: "Supervision Data",
    ms: "Data Penyeliaan",
  },
  "ds.penyeliaan.desc": {
    en: "Supervision records - supervisor, student, role, status",
    ms: "Rekod penyeliaan - penyelia, pelajar, peranan, status",
  },

  // Column labels - Pensyarah
  "col.User_Name": { en: "Name", ms: "Nama" },
  "col.User_Ic": { en: "IC No.", ms: "No. IC" },
  "col.User_NoPer": { en: "Employee No.", ms: "No. Pekerja" },
  "col.User_Salutation": { en: "Salutation", ms: "Gelaran" },
  "col.User_Position": { en: "Position", ms: "Jawatan" },
  "col.User_Dept": { en: "Department", ms: "Jabatan" },
  "col.User_Email": { en: "Email", ms: "Emel" },
  "col.User_Gender": { en: "Gender", ms: "Jantina" },
  "col.User_Gred": { en: "Grade", ms: "Gred" },
  "col.User_HP": { en: "Phone No.", ms: "No. HP" },
  "col.User_SLantikan": { en: "Appointment Date", ms: "Tarikh Lantikan" },
  "col.User_TmtKontrak": { en: "Contract End", ms: "Tamat Kontrak" },
  "col.PTJ_kod": { en: "PTJ Code", ms: "Kod PTJ" },
  "col.Kumpulan": { en: "Group", ms: "Kumpulan" },
  "col.Kategori": { en: "Category", ms: "Kategori" },
  "col.Status": { en: "Status", ms: "Status" },

  // Column labels - Pascasiswazah
  "col.StudentID": { en: "Student ID", ms: "ID Pelajar" },
  "col.StudentName": { en: "Student Name", ms: "Nama Pelajar" },
  "col.StudentIC": { en: "IC No.", ms: "No. IC" },
  "col.Programme": { en: "Programme", ms: "Program" },
  "col.Faculty": { en: "Faculty", ms: "Fakulti" },
  "col.Department": { en: "Department", ms: "Jabatan" },
  "col.SupervisorName": { en: "Supervisor", ms: "Penyelia" },
  "col.CoSupervisor": { en: "Co-Supervisor", ms: "Penyelia Bersama" },
  "col.ResearchTitle": { en: "Research Title", ms: "Tajuk Penyelidikan" },
  "col.EnrollmentDate": { en: "Enrollment Date", ms: "Tarikh Daftar" },
  "col.ExpectedCompletion": { en: "Expected Completion", ms: "Jangka Siap" },
  "col.FundingSource": { en: "Funding Source", ms: "Sumber Dana" },
  "col.GrantRef": { en: "Grant Ref.", ms: "Ref. Geran" },
  "col.PublicationCount": { en: "Publications", ms: "Bil. Penerbitan" },

  // Column labels - Penyelidikan
  "col.DbName": { en: "Database Name", ms: "Nama Pangkalan Data" },
  "col.DbDesc": { en: "Description", ms: "Penerangan" },
  "col.Keyword": { en: "Keywords", ms: "Kata Kunci" },
  "col.URL": { en: "URL", ms: "URL" },
  "col.ContactName": { en: "Contact Name", ms: "Nama Hubungan" },
  "col.ContactPTJ": { en: "PTJ", ms: "PTJ" },
  "col.CreatedBy": { en: "Created By", ms: "Dibuat Oleh" },
  "col.CreateDate": { en: "Created Date", ms: "Tarikh Cipta" },
  "col.LastUpdate": { en: "Last Updated", ms: "Kemaskini Terakhir" },
  "col.ApproveBy": { en: "Approved By", ms: "Diluluskan Oleh" },
  "col.ApproveDate": { en: "Approval Date", ms: "Tarikh Lulus" },
  "col.Active": { en: "Active", ms: "Aktif" },
  "col.Remarks": { en: "Remarks", ms: "Catatan" },

  // Column labels - Harta Intelek
  "col.IDIntellectual": { en: "ID", ms: "ID" },
  "col.ProjectID": { en: "Project ID", ms: "ID Projek" },
  "col.IntellectualProperty": { en: "IP Type", ms: "Jenis IP" },
  "col.ProductName": { en: "Product Name", ms: "Nama Produk" },
  "col.CommercialPotential": { en: "Commercial Potential", ms: "Potensi Komersial" },
  "col.Country": { en: "Country", ms: "Negara" },
  "col.IntellectualStatusID": { en: "Status", ms: "Status" },
  "col.DateFile": { en: "Filing Date", ms: "Tarikh Fail" },
  "col.DatePass": { en: "Approval Date", ms: "Tarikh Lulus" },
  "col.PatentNumber": { en: "Patent No.", ms: "No. Paten" },
  "col.Income": { en: "Income (RM)", ms: "Pendapatan (RM)" },
  "col.CertificateDate": { en: "Certificate Date", ms: "Tarikh Sijil" },
  "col.ValidDate": { en: "Valid Date", ms: "Tarikh Sah" },
  "col.Agent": { en: "Agent", ms: "Agen" },
  "col.ReferenceNo": { en: "Reference No.", ms: "No. Rujukan" },
  "col.UpdatedBy": { en: "Updated By", ms: "Dikemaskini Oleh" },
  "col.UpdateDate": { en: "Update Date", ms: "Tarikh Kemaskini" },

  // Column labels - Penyeliaan
  "col.SupervisionID": { en: "ID", ms: "ID" },
  "col.Role": { en: "Role", ms: "Peranan" },
  "col.StartDate": { en: "Start Date", ms: "Tarikh Mula" },
  "col.EndDate": { en: "End Date", ms: "Tarikh Tamat" },
  "col.VivaDate": { en: "Viva Date", ms: "Tarikh Viva" },
  "col.Result": { en: "Result", ms: "Keputusan" },
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, lang: Lang): string {
  return translations[key][lang];
}

export function colLabel(key: string, lang: Lang): string {
  const tKey = `col.${key}` as TranslationKey;
  if (tKey in translations) {
    return translations[tKey][lang];
  }
  return key;
}
