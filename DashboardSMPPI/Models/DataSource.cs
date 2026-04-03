namespace DashboardSMPPI.Models;

public class ColumnDef
{
    public string Key { get; set; } = "";
    public string Label { get; set; } = "";
    public bool Sortable { get; set; } = true;
}

public class DataSourceConfig
{
    public string Id { get; set; } = "";
    public string LabelKey { get; set; } = "";
    public string DescriptionKey { get; set; } = "";
    public List<ColumnDef> Columns { get; set; } = new();
    public List<string> FilterColumns { get; set; } = new();
    public List<string> DateColumns { get; set; } = new();
}

public static class DataSourceDefinitions
{
    public static List<DataSourceConfig> GetAll() => new()
    {
        new DataSourceConfig
        {
            Id = "pensyarah",
            LabelKey = "src_pensyarah",
            DescriptionKey = "src_pensyarah_desc",
            Columns = new List<ColumnDef>
            {
                new() { Key = "User_Name", Label = "col_name" },
                new() { Key = "User_Ic", Label = "col_ic" },
                new() { Key = "User_Jawatan", Label = "col_position" },
                new() { Key = "User_Gred", Label = "col_grade" },
                new() { Key = "User_NoStaff", Label = "col_staffno" },
                new() { Key = "User_Fakulti", Label = "col_faculty" },
                new() { Key = "User_Jabatan", Label = "col_department" },
                new() { Key = "User_PtjCode", Label = "col_ptjcode" },
                new() { Key = "User_Email", Label = "col_email" },
                new() { Key = "User_PhoneNo", Label = "col_phone" },
                new() { Key = "User_Gelaran", Label = "col_title" },
                new() { Key = "User_Gaji", Label = "col_salary" },
                new() { Key = "User_Status", Label = "col_status" },
                new() { Key = "User_JenisPerkhidmatan", Label = "col_servicetype" },
                new() { Key = "User_TarikhLantikan", Label = "col_appointmentdate" },
                new() { Key = "User_KelayakanTertinggi", Label = "col_highestqual" },
                new() { Key = "User_BidangPenyelidikan", Label = "col_researchfield" },
                new() { Key = "User_HIndex", Label = "col_hindex" },
                new() { Key = "User_JumlahPenerbitan", Label = "col_pubcount" },
                new() { Key = "User_GeranAktif", Label = "col_activegrant" },
                new() { Key = "User_PelajarPhD", Label = "col_phdstudents" },
                new() { Key = "User_PelajarMaster", Label = "col_masterstudents" },
            },
            FilterColumns = new() { "User_Fakulti", "User_Jabatan", "User_Gred", "User_Status", "User_Jawatan", "User_JenisPerkhidmatan", "User_Jantina" },
            DateColumns = new() { "User_TarikhLantikan", "User_TarikhSahJawatan", "User_TarikhLahir" }
        },
        new DataSourceConfig
        {
            Id = "pascasiswazah",
            LabelKey = "src_pascasiswazah",
            DescriptionKey = "src_pascasiswazah_desc",
            Columns = new List<ColumnDef>
            {
                new() { Key = "StudentID", Label = "col_studentid" },
                new() { Key = "Name", Label = "col_name" },
                new() { Key = "Programme", Label = "col_programme" },
                new() { Key = "Faculty", Label = "col_faculty" },
                new() { Key = "Supervisor", Label = "col_supervisor" },
                new() { Key = "ResearchTitle", Label = "col_researchtitle" },
                new() { Key = "Status", Label = "col_status" },
                new() { Key = "EnrollmentDate", Label = "col_enrolldate" },
                new() { Key = "ExpectedCompletion", Label = "col_expectedcompletion" },
                new() { Key = "FundingSource", Label = "col_fundingsource" },
                new() { Key = "PublicationCount", Label = "col_pubcount" },
                new() { Key = "CGPA", Label = "col_cgpa" },
            },
            FilterColumns = new() { "Programme", "Faculty", "Status", "FundingSource" },
            DateColumns = new() { "EnrollmentDate", "ExpectedCompletion" }
        },
        new DataSourceConfig
        {
            Id = "penyelidikan",
            LabelKey = "src_penyelidikan",
            DescriptionKey = "src_penyelidikan_desc",
            Columns = new List<ColumnDef>
            {
                new() { Key = "DbName", Label = "col_dbname" },
                new() { Key = "DbDescription", Label = "col_dbdesc" },
                new() { Key = "DbKeywords", Label = "col_keywords" },
                new() { Key = "ContactName", Label = "col_contactname" },
                new() { Key = "ContactEmail", Label = "col_contactemail" },
                new() { Key = "Faculty", Label = "col_faculty" },
                new() { Key = "Department", Label = "col_department" },
                new() { Key = "CreationDate", Label = "col_creationdate" },
                new() { Key = "Status", Label = "col_status" },
                new() { Key = "DataSize", Label = "col_datasize" },
                new() { Key = "AccessLevel", Label = "col_accesslevel" },
            },
            FilterColumns = new() { "Faculty", "Department", "Status", "AccessLevel" },
            DateColumns = new() { "CreationDate", "ApprovalDate" }
        },
        new DataSourceConfig
        {
            Id = "harta-intelek",
            LabelKey = "src_hartaintelek",
            DescriptionKey = "src_hartaintelek_desc",
            Columns = new List<ColumnDef>
            {
                new() { Key = "IDIntellectual", Label = "col_ipid" },
                new() { Key = "Title", Label = "col_iptitle" },
                new() { Key = "Type", Label = "col_iptype" },
                new() { Key = "PatentNumber", Label = "col_patentnumber" },
                new() { Key = "FilingDate", Label = "col_filingdate" },
                new() { Key = "Inventors", Label = "col_inventors" },
                new() { Key = "Faculty", Label = "col_faculty" },
                new() { Key = "Status", Label = "col_status" },
                new() { Key = "CommercialPotential", Label = "col_commercial" },
                new() { Key = "LicenseIncome", Label = "col_licenseincome" },
                new() { Key = "Country", Label = "col_country" },
                new() { Key = "Category", Label = "col_category" },
            },
            FilterColumns = new() { "Type", "Faculty", "Status", "CommercialPotential", "Country", "Category" },
            DateColumns = new() { "FilingDate", "ApprovalDate", "ExpiryDate" }
        },
        new DataSourceConfig
        {
            Id = "penyeliaan",
            LabelKey = "src_penyeliaan",
            DescriptionKey = "src_penyeliaan_desc",
            Columns = new List<ColumnDef>
            {
                new() { Key = "SupervisionID", Label = "col_supervisionid" },
                new() { Key = "SupervisorName", Label = "col_supervisorname" },
                new() { Key = "StudentName", Label = "col_studentname" },
                new() { Key = "Programme", Label = "col_programme" },
                new() { Key = "Faculty", Label = "col_faculty" },
                new() { Key = "ResearchTitle", Label = "col_researchtitle" },
                new() { Key = "Role", Label = "col_role" },
                new() { Key = "StartDate", Label = "col_startdate" },
                new() { Key = "Status", Label = "col_status" },
                new() { Key = "VivaDate", Label = "col_vivadate" },
                new() { Key = "VivaResult", Label = "col_vivaresult" },
                new() { Key = "PublicationCount", Label = "col_pubcount" },
            },
            FilterColumns = new() { "Programme", "Faculty", "Role", "Status", "VivaResult" },
            DateColumns = new() { "StartDate", "EndDate", "VivaDate" }
        }
    };
}
