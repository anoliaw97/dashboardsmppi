using System.Collections.Generic;
using System.Linq;

namespace DashboardSMPPI.Services
{
    public class TranslationService
    {
        private readonly Dictionary<string, Dictionary<string, string>> _translations;

        public TranslationService()
        {
            _translations = new Dictionary<string, Dictionary<string, string>>
            {
                // ── Header / Nav ──
                ["app_title"] = new() { ["en"] = "SMPPI Data Extractor", ["ms"] = "Pengekstrak Data SMPPI" },
                ["app_subtitle"] = new() { ["en"] = "Integrated Data Management Platform", ["ms"] = "Platform Pengurusan Data Bersepadu" },
                ["total_sources"] = new() { ["en"] = "Total Sources", ["ms"] = "Jumlah Sumber" },
                ["language_toggle"] = new() { ["en"] = "Bahasa Melayu", ["ms"] = "English" },

                // ── Search / Filter ──
                ["search_placeholder"] = new() { ["en"] = "Search all columns...", ["ms"] = "Cari semua lajur..." },
                ["filter_columns"] = new() { ["en"] = "Filter Columns", ["ms"] = "Tapis Lajur" },
                ["clear_filters"] = new() { ["en"] = "Clear Filters", ["ms"] = "Padam Tapisan" },
                ["active_filters"] = new() { ["en"] = "Active Filters", ["ms"] = "Tapisan Aktif" },
                ["no_results"] = new() { ["en"] = "No results found", ["ms"] = "Tiada hasil ditemui" },
                ["showing_results"] = new() { ["en"] = "Showing results", ["ms"] = "Menunjukkan hasil" },

                // ── AI Query ──
                ["ai_title"] = new() { ["en"] = "AI Query Builder", ["ms"] = "Pembina Pertanyaan AI" },
                ["ai_placeholder"] = new() { ["en"] = "Ask a question about the data...", ["ms"] = "Tanya soalan mengenai data..." },
                ["ai_generate"] = new() { ["en"] = "Generate Query", ["ms"] = "Jana Pertanyaan" },
                ["ai_run"] = new() { ["en"] = "Run Query", ["ms"] = "Jalankan Pertanyaan" },
                ["ai_results"] = new() { ["en"] = "Query Results", ["ms"] = "Hasil Pertanyaan" },
                ["ai_sql_label"] = new() { ["en"] = "Generated SQL", ["ms"] = "SQL Dijana" },
                ["ai_explanation"] = new() { ["en"] = "Explanation", ["ms"] = "Penjelasan" },
                ["sample_queries"] = new() { ["en"] = "Sample Queries", ["ms"] = "Contoh Pertanyaan" },

                // ── Data Sources ──
                ["src_pensyarah"] = new() { ["en"] = "Lecturer Data", ["ms"] = "Data Pensyarah" },
                ["src_pensyarah_desc"] = new() { ["en"] = "Academic staff information and profiles", ["ms"] = "Maklumat dan profil staf akademik" },
                ["src_pascasiswazah"] = new() { ["en"] = "Postgraduate", ["ms"] = "Pascasiswazah" },
                ["src_pascasiswazah_desc"] = new() { ["en"] = "Postgraduate student records and progress", ["ms"] = "Rekod dan kemajuan pelajar pascasiswazah" },
                ["src_penyelidikan"] = new() { ["en"] = "Research Databases", ["ms"] = "Pangkalan Data Penyelidikan" },
                ["src_penyelidikan_desc"] = new() { ["en"] = "Research projects and publications data", ["ms"] = "Data projek penyelidikan dan penerbitan" },
                ["src_hartaintelek"] = new() { ["en"] = "Intellectual Property", ["ms"] = "Harta Intelek" },
                ["src_hartaintelek_desc"] = new() { ["en"] = "Patents, trademarks and IP records", ["ms"] = "Rekod paten, tanda dagangan dan harta intelek" },
                ["src_penyeliaan"] = new() { ["en"] = "Supervision", ["ms"] = "Penyeliaan" },
                ["src_penyeliaan_desc"] = new() { ["en"] = "Student supervision records and details", ["ms"] = "Rekod dan butiran penyeliaan pelajar" },

                // ── Column Labels ──
                ["col_name"] = new() { ["en"] = "Name", ["ms"] = "Nama" },
                ["col_ic"] = new() { ["en"] = "IC Number", ["ms"] = "Nombor IC" },
                ["col_position"] = new() { ["en"] = "Position", ["ms"] = "Jawatan" },
                ["col_grade"] = new() { ["en"] = "Grade", ["ms"] = "Gred" },
                ["col_staffno"] = new() { ["en"] = "Staff Number", ["ms"] = "Nombor Staf" },
                ["col_faculty"] = new() { ["en"] = "Faculty", ["ms"] = "Fakulti" },
                ["col_department"] = new() { ["en"] = "Department", ["ms"] = "Jabatan" },
                ["col_ptjcode"] = new() { ["en"] = "PTJ Code", ["ms"] = "Kod PTJ" },
                ["col_email"] = new() { ["en"] = "Email", ["ms"] = "Emel" },
                ["col_phone"] = new() { ["en"] = "Phone", ["ms"] = "Telefon" },
                ["col_title"] = new() { ["en"] = "Title", ["ms"] = "Tajuk" },
                ["col_salary"] = new() { ["en"] = "Salary", ["ms"] = "Gaji" },
                ["col_status"] = new() { ["en"] = "Status", ["ms"] = "Status" },
                ["col_servicetype"] = new() { ["en"] = "Service Type", ["ms"] = "Jenis Perkhidmatan" },
                ["col_appointmentdate"] = new() { ["en"] = "Appointment Date", ["ms"] = "Tarikh Pelantikan" },
                ["col_highestqual"] = new() { ["en"] = "Highest Qualification", ["ms"] = "Kelayakan Tertinggi" },
                ["col_researchfield"] = new() { ["en"] = "Research Field", ["ms"] = "Bidang Penyelidikan" },
                ["col_hindex"] = new() { ["en"] = "H-Index", ["ms"] = "Indeks-H" },
                ["col_pubcount"] = new() { ["en"] = "Publication Count", ["ms"] = "Bilangan Penerbitan" },
                ["col_activegrant"] = new() { ["en"] = "Active Grants", ["ms"] = "Geran Aktif" },
                ["col_phdstudents"] = new() { ["en"] = "PhD Students", ["ms"] = "Pelajar PhD" },
                ["col_masterstudents"] = new() { ["en"] = "Master Students", ["ms"] = "Pelajar Sarjana" },
                ["col_studentid"] = new() { ["en"] = "Student ID", ["ms"] = "ID Pelajar" },
                ["col_programme"] = new() { ["en"] = "Programme", ["ms"] = "Program" },
                ["col_supervisor"] = new() { ["en"] = "Supervisor", ["ms"] = "Penyelia" },
                ["col_researchtitle"] = new() { ["en"] = "Research Title", ["ms"] = "Tajuk Penyelidikan" },
                ["col_enrolldate"] = new() { ["en"] = "Enrolment Date", ["ms"] = "Tarikh Pendaftaran" },
                ["col_expectedcompletion"] = new() { ["en"] = "Expected Completion", ["ms"] = "Jangkaan Tamat" },
                ["col_fundingsource"] = new() { ["en"] = "Funding Source", ["ms"] = "Sumber Pembiayaan" },
                ["col_cgpa"] = new() { ["en"] = "CGPA", ["ms"] = "CGPA" },
                ["col_dbname"] = new() { ["en"] = "Database Name", ["ms"] = "Nama Pangkalan Data" },
                ["col_dbdesc"] = new() { ["en"] = "Database Description", ["ms"] = "Penerangan Pangkalan Data" },
                ["col_keywords"] = new() { ["en"] = "Keywords", ["ms"] = "Kata Kunci" },
                ["col_contactname"] = new() { ["en"] = "Contact Name", ["ms"] = "Nama Hubungan" },
                ["col_contactemail"] = new() { ["en"] = "Contact Email", ["ms"] = "Emel Hubungan" },
                ["col_creationdate"] = new() { ["en"] = "Creation Date", ["ms"] = "Tarikh Penciptaan" },
                ["col_datasize"] = new() { ["en"] = "Data Size", ["ms"] = "Saiz Data" },
                ["col_accesslevel"] = new() { ["en"] = "Access Level", ["ms"] = "Tahap Akses" },
                ["col_ipid"] = new() { ["en"] = "IP ID", ["ms"] = "ID Harta Intelek" },
                ["col_iptitle"] = new() { ["en"] = "IP Title", ["ms"] = "Tajuk Harta Intelek" },
                ["col_iptype"] = new() { ["en"] = "IP Type", ["ms"] = "Jenis Harta Intelek" },
                ["col_patentnumber"] = new() { ["en"] = "Patent Number", ["ms"] = "Nombor Paten" },
                ["col_filingdate"] = new() { ["en"] = "Filing Date", ["ms"] = "Tarikh Pemfailan" },
                ["col_inventors"] = new() { ["en"] = "Inventors", ["ms"] = "Pencipta" },
                ["col_commercial"] = new() { ["en"] = "Commercialisation", ["ms"] = "Pengkomersialan" },
                ["col_licenseincome"] = new() { ["en"] = "License Income", ["ms"] = "Pendapatan Lesen" },
                ["col_country"] = new() { ["en"] = "Country", ["ms"] = "Negara" },
                ["col_category"] = new() { ["en"] = "Category", ["ms"] = "Kategori" },
                ["col_supervisionid"] = new() { ["en"] = "Supervision ID", ["ms"] = "ID Penyeliaan" },
                ["col_supervisorname"] = new() { ["en"] = "Supervisor Name", ["ms"] = "Nama Penyelia" },
                ["col_studentname"] = new() { ["en"] = "Student Name", ["ms"] = "Nama Pelajar" },
                ["col_role"] = new() { ["en"] = "Role", ["ms"] = "Peranan" },
                ["col_startdate"] = new() { ["en"] = "Start Date", ["ms"] = "Tarikh Mula" },
                ["col_vivadate"] = new() { ["en"] = "Viva Date", ["ms"] = "Tarikh Viva" },
                ["col_vivaresult"] = new() { ["en"] = "Viva Result", ["ms"] = "Keputusan Viva" },

                // ── Join Builder ──
                ["join_title"] = new() { ["en"] = "Join Builder", ["ms"] = "Pembina Gabungan" },
                ["join_select_sources"] = new() { ["en"] = "Select Sources", ["ms"] = "Pilih Sumber" },
                ["join_column"] = new() { ["en"] = "Join Column", ["ms"] = "Lajur Gabungan" },
                ["join_type"] = new() { ["en"] = "Join Type", ["ms"] = "Jenis Gabungan" },
                ["join_inner"] = new() { ["en"] = "Inner Join", ["ms"] = "Gabungan Dalam" },
                ["join_left"] = new() { ["en"] = "Left Join", ["ms"] = "Gabungan Kiri" },
                ["join_full"] = new() { ["en"] = "Full Join", ["ms"] = "Gabungan Penuh" },
                ["join_preview"] = new() { ["en"] = "Preview", ["ms"] = "Pratonton" },
                ["join_save"] = new() { ["en"] = "Save Join", ["ms"] = "Simpan Gabungan" },
                ["join_load"] = new() { ["en"] = "Load Join", ["ms"] = "Muat Gabungan" },
                ["join_delete"] = new() { ["en"] = "Delete", ["ms"] = "Padam" },
                ["join_saved_list"] = new() { ["en"] = "Saved Joins", ["ms"] = "Gabungan Tersimpan" },
                ["join_no_common"] = new() { ["en"] = "No common columns found", ["ms"] = "Tiada lajur sepunya ditemui" },

                // ── Visualization ──
                ["viz_title"] = new() { ["en"] = "Visualization", ["ms"] = "Visualisasi" },
                ["viz_chart_type"] = new() { ["en"] = "Chart Type", ["ms"] = "Jenis Carta" },
                ["viz_bar"] = new() { ["en"] = "Bar Chart", ["ms"] = "Carta Bar" },
                ["viz_line"] = new() { ["en"] = "Line Chart", ["ms"] = "Carta Garisan" },
                ["viz_pie"] = new() { ["en"] = "Pie Chart", ["ms"] = "Carta Pai" },
                ["viz_scatter"] = new() { ["en"] = "Scatter Plot", ["ms"] = "Plot Serakan" },
                ["viz_xaxis"] = new() { ["en"] = "X-Axis", ["ms"] = "Paksi-X" },
                ["viz_yaxis"] = new() { ["en"] = "Y-Axis", ["ms"] = "Paksi-Y" },
                ["viz_aggregate"] = new() { ["en"] = "Aggregate", ["ms"] = "Agregat" },
                ["viz_count"] = new() { ["en"] = "Count", ["ms"] = "Bilangan" },
                ["viz_sum"] = new() { ["en"] = "Sum", ["ms"] = "Jumlah" },
                ["viz_avg"] = new() { ["en"] = "Average", ["ms"] = "Purata" },
                ["viz_generate"] = new() { ["en"] = "Generate Chart", ["ms"] = "Jana Carta" },

                // ── Pagination ──
                ["page_size"] = new() { ["en"] = "Page Size", ["ms"] = "Saiz Halaman" },
                ["page_of"] = new() { ["en"] = "of", ["ms"] = "daripada" },
                ["page_prev"] = new() { ["en"] = "Previous", ["ms"] = "Sebelumnya" },
                ["page_next"] = new() { ["en"] = "Next", ["ms"] = "Seterusnya" },
                ["page_first"] = new() { ["en"] = "First", ["ms"] = "Pertama" },
                ["page_last"] = new() { ["en"] = "Last", ["ms"] = "Terakhir" },

                // ── Export ──
                ["export_all"] = new() { ["en"] = "Export All", ["ms"] = "Eksport Semua" },
                ["export_filtered"] = new() { ["en"] = "Export Filtered", ["ms"] = "Eksport Ditapis" },

                // ── Table ──
                ["table_loading"] = new() { ["en"] = "Loading data...", ["ms"] = "Memuatkan data..." },
                ["table_empty"] = new() { ["en"] = "No data available", ["ms"] = "Tiada data tersedia" },
                ["table_error"] = new() { ["en"] = "Error loading data", ["ms"] = "Ralat memuatkan data" },
                ["table_sort_asc"] = new() { ["en"] = "Sort Ascending", ["ms"] = "Isih Menaik" },
                ["table_sort_desc"] = new() { ["en"] = "Sort Descending", ["ms"] = "Isih Menurun" },
                ["table_columns_visible"] = new() { ["en"] = "Visible Columns", ["ms"] = "Lajur Kelihatan" },
                ["table_select_all"] = new() { ["en"] = "Select All", ["ms"] = "Pilih Semua" },
                ["table_deselect_all"] = new() { ["en"] = "Deselect All", ["ms"] = "Nyahpilih Semua" },
                ["table_rows_selected"] = new() { ["en"] = "rows selected", ["ms"] = "baris dipilih" },
                ["table_refresh"] = new() { ["en"] = "Refresh", ["ms"] = "Muat Semula" },

                // ── Actions ──
                ["btn_close"] = new() { ["en"] = "Close", ["ms"] = "Tutup" },
                ["btn_cancel"] = new() { ["en"] = "Cancel", ["ms"] = "Batal" },
                ["btn_apply"] = new() { ["en"] = "Apply", ["ms"] = "Guna" },
                ["explain_title"] = new() { ["en"] = "Explanation", ["ms"] = "Penjelasan" },
            };
        }

        /// <summary>
        /// Returns the translated string for the given key and language.
        /// Falls back to the key itself if the translation is not found.
        /// </summary>
        public string T(string key, string lang)
        {
            if (_translations.TryGetValue(key, out var entry))
            {
                if (entry.TryGetValue(lang, out var value))
                    return value;
            }
            return key;
        }

        /// <summary>
        /// Returns a column label translation for the given key and language.
        /// Falls back to the key itself if the translation is not found.
        /// </summary>
        public string ColLabel(string key, string lang)
        {
            if (_translations.TryGetValue(key, out var entry))
            {
                if (entry.TryGetValue(lang, out var value))
                    return value;
            }
            return key;
        }

        /// <summary>
        /// Returns all translations for the specified language as a flat dictionary.
        /// </summary>
        public Dictionary<string, string> GetAll(string lang)
        {
            var result = new Dictionary<string, string>();
            foreach (var kvp in _translations)
            {
                if (kvp.Value.TryGetValue(lang, out var value))
                    result[kvp.Key] = value;
                else
                    result[kvp.Key] = kvp.Key;
            }
            return result;
        }
    }
}
