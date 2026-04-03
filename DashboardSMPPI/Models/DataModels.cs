namespace DashboardSMPPI.Models;

public class Pensyarah
{
    public string User_Name { get; set; } = "";
    public string User_Ic { get; set; } = "";
    public string User_Jawatan { get; set; } = "";
    public string User_Gred { get; set; } = "";
    public string User_NoStaff { get; set; } = "";
    public string User_Fakulti { get; set; } = "";
    public string User_Jabatan { get; set; } = "";
    public string User_PtjCode { get; set; } = "";
    public string User_Email { get; set; } = "";
    public string User_PhoneNo { get; set; } = "";
    public string User_Gelaran { get; set; } = "";
    public string User_Gaji { get; set; } = "";
    public string User_Status { get; set; } = "";
    public string User_JenisPerkhidmatan { get; set; } = "";
    public string User_TarikhLantikan { get; set; } = "";
    public string User_TarikhSahJawatan { get; set; } = "";
    public string User_KelayakanTertinggi { get; set; } = "";
    public string User_BidangPenyelidikan { get; set; } = "";
    public string User_GoogleScholar { get; set; } = "";
    public string User_Orcid { get; set; } = "";
    public string User_Scopus { get; set; } = "";
    public string User_HIndex { get; set; } = "";
    public string User_JumlahPenerbitan { get; set; } = "";
    public string User_GeranAktif { get; set; } = "";
    public string User_JumlahGeran { get; set; } = "";
    public string User_PelajarPhD { get; set; } = "";
    public string User_PelajarMaster { get; set; } = "";
    public string User_AlamatPejabat { get; set; } = "";
    public string User_Warganegara { get; set; } = "";
    public string User_Bangsa { get; set; } = "";
    public string User_Agama { get; set; } = "";
    public string User_Jantina { get; set; } = "";
    public string User_TarikhLahir { get; set; } = "";
    public string User_StatusPerkahwinan { get; set; } = "";
    public string User_AlamatRumah { get; set; } = "";
    public string User_NoTelRumah { get; set; } = "";
}

public class Pascasiswazah
{
    public string StudentID { get; set; } = "";
    public string Name { get; set; } = "";
    public string IC { get; set; } = "";
    public string Programme { get; set; } = "";
    public string Faculty { get; set; } = "";
    public string Department { get; set; } = "";
    public string Supervisor { get; set; } = "";
    public string CoSupervisor { get; set; } = "";
    public string ResearchTitle { get; set; } = "";
    public string Status { get; set; } = "";
    public string EnrollmentDate { get; set; } = "";
    public string ExpectedCompletion { get; set; } = "";
    public string FundingSource { get; set; } = "";
    public string PublicationCount { get; set; } = "";
    public string CGPA { get; set; } = "";
}

public class Penyelidikan
{
    public string DbName { get; set; } = "";
    public string DbDescription { get; set; } = "";
    public string DbKeywords { get; set; } = "";
    public string DbUrl { get; set; } = "";
    public string ContactName { get; set; } = "";
    public string ContactEmail { get; set; } = "";
    public string ContactPhone { get; set; } = "";
    public string Faculty { get; set; } = "";
    public string Department { get; set; } = "";
    public string CreationDate { get; set; } = "";
    public string ApprovalDate { get; set; } = "";
    public string Status { get; set; } = "";
    public string DataSize { get; set; } = "";
    public string AccessLevel { get; set; } = "";
}

public class HartaIntelek
{
    public string IDIntellectual { get; set; } = "";
    public string ProjectID { get; set; } = "";
    public string Title { get; set; } = "";
    public string Type { get; set; } = "";
    public string PatentNumber { get; set; } = "";
    public string FilingDate { get; set; } = "";
    public string ApprovalDate { get; set; } = "";
    public string ExpiryDate { get; set; } = "";
    public string Inventors { get; set; } = "";
    public string Faculty { get; set; } = "";
    public string Status { get; set; } = "";
    public string CommercialPotential { get; set; } = "";
    public string LicenseIncome { get; set; } = "";
    public string Agent { get; set; } = "";
    public string Country { get; set; } = "";
    public string Category { get; set; } = "";
    public string Description { get; set; } = "";
}

public class Penyeliaan
{
    public string SupervisionID { get; set; } = "";
    public string SupervisorName { get; set; } = "";
    public string StudentName { get; set; } = "";
    public string Programme { get; set; } = "";
    public string Faculty { get; set; } = "";
    public string ResearchTitle { get; set; } = "";
    public string Role { get; set; } = "";
    public string StartDate { get; set; } = "";
    public string EndDate { get; set; } = "";
    public string Status { get; set; } = "";
    public string VivaDate { get; set; } = "";
    public string VivaResult { get; set; } = "";
    public string PublicationCount { get; set; } = "";
}
