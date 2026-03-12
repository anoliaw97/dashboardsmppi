export type Lang = "en" | "ms";

const translations = {
  // Header
  subtitle: {
    en: "Specific Information Retrieval Intelligence System",
    ms: "Sistem Pintar Pencarian Maklumat Khusus",
  },
  totalSources: {
    en: "Total data sources:",
    ms: "Jumlah sumber data:",
  },

  // Navigation tabs
  tabDataExplorer: {
    en: "Data Explorer",
    ms: "Penjelajah Data",
  },
  tabAiAssistant: {
    en: "AI Assistant",
    ms: "Pembantu AI",
  },
  tabRequestForm: {
    en: "Data Request",
    ms: "Permohonan Data",
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
  globalSearch: {
    en: "Global search across all columns...",
    ms: "Carian global merentasi semua lajur...",
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
  clearAll: {
    en: "Clear All",
    ms: "Kosongkan Semua",
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
  filterPlaceholder: {
    en: "Filter...",
    ms: "Tapis...",
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

  // AI Assistant
  aiTitle: {
    en: "AI Data Assistant",
    ms: "Pembantu Data AI",
  },
  aiSubtitle: {
    en: "Ask questions about your data in natural language",
    ms: "Tanya soalan mengenai data anda dalam bahasa biasa",
  },
  aiQueryTab: {
    en: "Query Builder",
    ms: "Pembina Pertanyaan",
  },
  aiExplainTab: {
    en: "Explain Data",
    ms: "Terangkan Data",
  },
  aiQueryPlaceholder: {
    en: "e.g., Show all lecturers from Faculty of Engineering with grade DM54...",
    ms: "cth., Tunjukkan semua pensyarah dari Fakulti Kejuruteraan dengan gred DM54...",
  },
  aiExplainPlaceholder: {
    en: "e.g., What does H-index mean? Explain the grading system DM54...",
    ms: "cth., Apa maksud H-index? Terangkan sistem gred DM54...",
  },
  aiGenerate: {
    en: "Generate Query",
    ms: "Jana Pertanyaan",
  },
  aiExplain: {
    en: "Explain",
    ms: "Terangkan",
  },
  aiRunQuery: {
    en: "Run Query",
    ms: "Jalankan Pertanyaan",
  },
  aiGeneratedSql: {
    en: "Generated SQL (Read-Only)",
    ms: "SQL Dijana (Baca Sahaja)",
  },
  aiResults: {
    en: "Query Results",
    ms: "Keputusan Pertanyaan",
  },
  aiExplanation: {
    en: "Explanation",
    ms: "Penjelasan",
  },
  aiSelectDb: {
    en: "Select database to query:",
    ms: "Pilih pangkalan data untuk pertanyaan:",
  },
  aiReadOnlyNote: {
    en: "Read-only mode: Only SELECT queries are allowed. No data modification permitted.",
    ms: "Mod baca sahaja: Hanya pertanyaan SELECT dibenarkan. Tiada pengubahsuaian data dibenarkan.",
  },
  aiProcessing: {
    en: "Processing your request...",
    ms: "Memproses permintaan anda...",
  },
  aiSampleQueries: {
    en: "Try these examples:",
    ms: "Cuba contoh-contoh ini:",
  },

  // Request Form
  reqTitle: {
    en: "Data Request Form",
    ms: "Borang Permohonan Data",
  },
  reqSubtitle: {
    en: "Submit a request for specific data extraction from SMPPI databases",
    ms: "Hantar permohonan untuk pengekstrakan data khusus dari pangkalan data SMPPI",
  },
  reqName: {
    en: "Full Name",
    ms: "Nama Penuh",
  },
  reqStaffId: {
    en: "Staff ID / Matric No.",
    ms: "No. Kakitangan / No. Matrik",
  },
  reqEmail: {
    en: "Email Address",
    ms: "Alamat Emel",
  },
  reqDept: {
    en: "Department / Faculty",
    ms: "Jabatan / Fakulti",
  },
  reqPhone: {
    en: "Phone Number",
    ms: "No. Telefon",
  },
  reqPosition: {
    en: "Position / Designation",
    ms: "Jawatan",
  },
  reqSectionInfo: {
    en: "Requestor Information",
    ms: "Maklumat Pemohon",
  },
  reqSectionData: {
    en: "Data Request Details",
    ms: "Butiran Permohonan Data",
  },
  reqDatabase: {
    en: "Database / Data Source",
    ms: "Pangkalan Data / Sumber Data",
  },
  reqPurpose: {
    en: "Purpose of Request",
    ms: "Tujuan Permohonan",
  },
  reqPurposeResearch: {
    en: "Research",
    ms: "Penyelidikan",
  },
  reqPurposeAdmin: {
    en: "Administration",
    ms: "Pentadbiran",
  },
  reqPurposeReport: {
    en: "Reporting",
    ms: "Pelaporan",
  },
  reqPurposeAudit: {
    en: "Audit",
    ms: "Audit",
  },
  reqPurposeOther: {
    en: "Other",
    ms: "Lain-lain",
  },
  reqDescription: {
    en: "Description of Data Required",
    ms: "Penerangan Data Yang Diperlukan",
  },
  reqDescPlaceholder: {
    en: "Please describe the specific data fields, filters, and conditions you need...",
    ms: "Sila nyatakan medan data, penapis, dan syarat khusus yang anda perlukan...",
  },
  reqDateRange: {
    en: "Data Date Range (if applicable)",
    ms: "Julat Tarikh Data (jika berkenaan)",
  },
  reqFormat: {
    en: "Preferred Output Format",
    ms: "Format Output Pilihan",
  },
  reqUrgency: {
    en: "Urgency Level",
    ms: "Tahap Keutamaan",
  },
  reqUrgencyLow: {
    en: "Low (within 2 weeks)",
    ms: "Rendah (dalam 2 minggu)",
  },
  reqUrgencyMedium: {
    en: "Medium (within 1 week)",
    ms: "Sederhana (dalam 1 minggu)",
  },
  reqUrgencyHigh: {
    en: "High (within 3 days)",
    ms: "Tinggi (dalam 3 hari)",
  },
  reqUrgencyCritical: {
    en: "Critical (within 24 hours)",
    ms: "Kritikal (dalam 24 jam)",
  },
  reqJustification: {
    en: "Justification / Approval Reference",
    ms: "Justifikasi / Rujukan Kelulusan",
  },
  reqJustPlaceholder: {
    en: "Approval letter reference, project code, or authorizing officer...",
    ms: "Rujukan surat kelulusan, kod projek, atau pegawai yang memberi kuasa...",
  },
  reqConfidential: {
    en: "Data contains confidential/sensitive information",
    ms: "Data mengandungi maklumat sulit/sensitif",
  },
  reqAgree: {
    en: "I agree to use the data solely for the stated purpose and comply with data protection policies",
    ms: "Saya bersetuju menggunakan data hanya untuk tujuan yang dinyatakan dan mematuhi dasar perlindungan data",
  },
  reqSubmit: {
    en: "Submit Request",
    ms: "Hantar Permohonan",
  },
  reqReset: {
    en: "Reset Form",
    ms: "Set Semula Borang",
  },
  reqSectionApproval: {
    en: "Approval & Compliance",
    ms: "Kelulusan & Pematuhan",
  },
  reqSubmitted: {
    en: "Request submitted successfully! Reference No:",
    ms: "Permohonan berjaya dihantar! No. Rujukan:",
  },
  reqSelectDb: {
    en: "-- Select database --",
    ms: "-- Pilih pangkalan data --",
  },
  reqSelectPurpose: {
    en: "-- Select purpose --",
    ms: "-- Pilih tujuan --",
  },
  reqSelectUrgency: {
    en: "-- Select urgency --",
    ms: "-- Pilih keutamaan --",
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

  // Join Tables
  joinTables: { en: "Join Tables", ms: "Gabung Jadual" },
  joinBuilder: { en: "Join Builder", ms: "Pembina Gabungan" },
  joinSubtitle: {
    en: "Combine data from multiple sources into a unified table",
    ms: "Gabungkan data dari pelbagai sumber ke dalam jadual bersatu",
  },
  joinSelectSources: { en: "Select sources to join:", ms: "Pilih sumber untuk digabung:" },
  joinColumn: { en: "Join on column:", ms: "Gabung pada lajur:" },
  joinType: { en: "Join type:", ms: "Jenis gabungan:" },
  joinInner: { en: "Inner Join (matching only)", ms: "Gabungan Dalam (padanan sahaja)" },
  joinLeft: { en: "Left Join (keep all from first)", ms: "Gabungan Kiri (simpan semua dari pertama)" },
  joinFull: { en: "Full Join (keep all)", ms: "Gabungan Penuh (simpan semua)" },
  joinPreview: { en: "Preview Join", ms: "Pratonton Gabungan" },
  joinSave: { en: "Save Table", ms: "Simpan Jadual" },
  joinSaveName: { en: "Table name:", ms: "Nama jadual:" },
  joinSaved: { en: "Saved Tables", ms: "Jadual Tersimpan" },
  joinNoSaved: { en: "No saved tables yet", ms: "Belum ada jadual tersimpan" },
  joinLoad: { en: "Load", ms: "Muat" },
  joinDelete: { en: "Delete", ms: "Padam" },
  joinResult: { en: "Joined Result", ms: "Hasil Gabungan" },
  joinSelectMin2: { en: "Select at least 2 sources", ms: "Pilih sekurang-kurangnya 2 sumber" },
  joinNoCommon: { en: "No common columns found", ms: "Tiada lajur sepadan ditemui" },
  joinRecords: { en: "records in joined table", ms: "rekod dalam jadual gabungan" },

  // Visualization
  vizTitle: { en: "Data Visualization", ms: "Visualisasi Data" },
  vizSubtitle: {
    en: "Create charts from the current data view",
    ms: "Cipta carta dari paparan data semasa",
  },
  vizChartType: { en: "Chart type:", ms: "Jenis carta:" },
  vizBar: { en: "Bar Chart", ms: "Carta Bar" },
  vizLine: { en: "Line Chart", ms: "Carta Garis" },
  vizPie: { en: "Pie Chart", ms: "Carta Pai" },
  vizScatter: { en: "Scatter Plot", ms: "Plot Serakan" },
  vizXAxis: { en: "X-Axis / Category:", ms: "Paksi-X / Kategori:" },
  vizYAxis: { en: "Y-Axis / Value:", ms: "Paksi-Y / Nilai:" },
  vizAggregation: { en: "Aggregation:", ms: "Pengagregatan:" },
  vizCount: { en: "Count", ms: "Bilangan" },
  vizSum: { en: "Sum", ms: "Jumlah" },
  vizAvg: { en: "Average", ms: "Purata" },
  vizAiSuggest: { en: "AI Suggest", ms: "Cadangan AI" },
  vizGenerate: { en: "Generate Chart", ms: "Jana Carta" },
  vizSelectColumn: { en: "-- Select column --", ms: "-- Pilih lajur --" },
  vizNoData: { en: "Configure and generate a chart above", ms: "Konfigurasikan dan jana carta di atas" },
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
