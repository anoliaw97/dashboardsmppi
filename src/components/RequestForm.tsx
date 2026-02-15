"use client";

import { useState } from "react";
import {
  Send,
  RotateCcw,
  CheckCircle2,
  User,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { DataSourceConfig } from "@/lib/data-sources";
import { Lang, t } from "@/lib/translations";

interface RequestFormProps {
  dataSources: DataSourceConfig[];
  lang: Lang;
}

interface FormData {
  name: string;
  staffId: string;
  email: string;
  department: string;
  phone: string;
  position: string;
  database: string;
  purpose: string;
  description: string;
  dateFrom: string;
  dateTo: string;
  format: string;
  urgency: string;
  justification: string;
  confidential: boolean;
  agree: boolean;
}

const initialForm: FormData = {
  name: "",
  staffId: "",
  email: "",
  department: "",
  phone: "",
  position: "",
  database: "",
  purpose: "",
  description: "",
  dateFrom: "",
  dateTo: "",
  format: "Excel",
  urgency: "",
  justification: "",
  confidential: false,
  agree: false,
};

export default function RequestForm({
  dataSources,
  lang,
}: RequestFormProps) {
  const [form, setForm] = useState<FormData>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [refNo, setRefNo] = useState("");

  const update = (field: keyof FormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ref = `SMPPI-${Date.now().toString(36).toUpperCase()}`;
    setRefNo(ref);
    setSubmitted(true);
  };

  const handleReset = () => {
    setForm(initialForm);
    setSubmitted(false);
    setRefNo("");
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          <CheckCircle2 size={64} className="mx-auto mb-4 text-green-500" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            {t("reqSubmitted", lang)}
          </h2>
          <p className="text-2xl font-mono font-bold text-blue-600 mb-6">
            {refNo}
          </p>
          <div className="bg-slate-50 rounded-xl p-4 text-left text-sm text-slate-600 space-y-1 mb-6">
            <p>
              <strong>{t("reqName", lang)}:</strong> {form.name}
            </p>
            <p>
              <strong>{t("reqEmail", lang)}:</strong> {form.email}
            </p>
            <p>
              <strong>{t("reqDatabase", lang)}:</strong>{" "}
              {dataSources.find((d) => d.id === form.database)?.label ||
                form.database}
            </p>
            <p>
              <strong>{t("reqUrgency", lang)}:</strong> {form.urgency}
            </p>
          </div>
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            {lang === "en" ? "Submit Another Request" : "Hantar Permohonan Lain"}
          </button>
        </div>
      </div>
    );
  }

  const inputClass =
    "w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1";

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-6 text-white mb-6">
        <div className="flex items-center gap-3 mb-2">
          <FileText size={24} />
          <h2 className="text-xl font-bold">{t("reqTitle", lang)}</h2>
        </div>
        <p className="text-blue-100 text-sm">{t("reqSubtitle", lang)}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Requestor Information */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <User size={18} className="text-blue-600" />
            <h3 className="text-base font-semibold text-slate-800">
              {t("reqSectionInfo", lang)}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>{t("reqName", lang)} *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>{t("reqStaffId", lang)} *</label>
              <input
                type="text"
                required
                value={form.staffId}
                onChange={(e) => update("staffId", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>{t("reqEmail", lang)} *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>{t("reqPhone", lang)}</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>{t("reqDept", lang)} *</label>
              <input
                type="text"
                required
                value={form.department}
                onChange={(e) => update("department", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>{t("reqPosition", lang)}</label>
              <input
                type="text"
                value={form.position}
                onChange={(e) => update("position", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Data Request Details */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText size={18} className="text-blue-600" />
            <h3 className="text-base font-semibold text-slate-800">
              {t("reqSectionData", lang)}
            </h3>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t("reqDatabase", lang)} *</label>
                <select
                  required
                  value={form.database}
                  onChange={(e) => update("database", e.target.value)}
                  className={inputClass}
                >
                  <option value="">{t("reqSelectDb", lang)}</option>
                  {dataSources.map((ds) => (
                    <option key={ds.id} value={ds.id}>
                      {ds.label}
                    </option>
                  ))}
                  <option value="multiple">
                    {lang === "en"
                      ? "Multiple Databases (specify below)"
                      : "Pelbagai Pangkalan Data (nyatakan di bawah)"}
                  </option>
                </select>
              </div>
              <div>
                <label className={labelClass}>{t("reqPurpose", lang)} *</label>
                <select
                  required
                  value={form.purpose}
                  onChange={(e) => update("purpose", e.target.value)}
                  className={inputClass}
                >
                  <option value="">{t("reqSelectPurpose", lang)}</option>
                  <option value="research">
                    {t("reqPurposeResearch", lang)}
                  </option>
                  <option value="admin">{t("reqPurposeAdmin", lang)}</option>
                  <option value="report">{t("reqPurposeReport", lang)}</option>
                  <option value="audit">{t("reqPurposeAudit", lang)}</option>
                  <option value="other">{t("reqPurposeOther", lang)}</option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>
                {t("reqDescription", lang)} *
              </label>
              <textarea
                required
                rows={4}
                placeholder={t("reqDescPlaceholder", lang)}
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                className={`${inputClass} resize-none`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>
                  {t("reqDateRange", lang)}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={form.dateFrom}
                    onChange={(e) => update("dateFrom", e.target.value)}
                    className={`${inputClass} flex-1`}
                  />
                  <span className="text-slate-400 text-xs">
                    {t("to", lang)}
                  </span>
                  <input
                    type="date"
                    value={form.dateTo}
                    onChange={(e) => update("dateTo", e.target.value)}
                    className={`${inputClass} flex-1`}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>{t("reqFormat", lang)}</label>
                <select
                  value={form.format}
                  onChange={(e) => update("format", e.target.value)}
                  className={inputClass}
                >
                  <option value="Excel">Excel (.xlsx)</option>
                  <option value="CSV">CSV (.csv)</option>
                  <option value="PDF">PDF (.pdf)</option>
                  <option value="JSON">JSON (.json)</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>{t("reqUrgency", lang)} *</label>
                <select
                  required
                  value={form.urgency}
                  onChange={(e) => update("urgency", e.target.value)}
                  className={inputClass}
                >
                  <option value="">{t("reqSelectUrgency", lang)}</option>
                  <option value="low">{t("reqUrgencyLow", lang)}</option>
                  <option value="medium">
                    {t("reqUrgencyMedium", lang)}
                  </option>
                  <option value="high">{t("reqUrgencyHigh", lang)}</option>
                  <option value="critical">
                    {t("reqUrgencyCritical", lang)}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Approval & Compliance */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck size={18} className="text-blue-600" />
            <h3 className="text-base font-semibold text-slate-800">
              {t("reqSectionApproval", lang)}
            </h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>
                {t("reqJustification", lang)}
              </label>
              <textarea
                rows={2}
                placeholder={t("reqJustPlaceholder", lang)}
                value={form.justification}
                onChange={(e) => update("justification", e.target.value)}
                className={`${inputClass} resize-none`}
              />
            </div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.confidential}
                onChange={(e) => update("confidential", e.target.checked)}
                className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">
                {t("reqConfidential", lang)}
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={form.agree}
                onChange={(e) => update("agree", e.target.checked)}
                className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">
                {t("reqAgree", lang)} *
              </span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="px-5 py-2.5 border border-slate-300 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <RotateCcw size={16} />
            {t("reqReset", lang)}
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md"
          >
            <Send size={16} />
            {t("reqSubmit", lang)}
          </button>
        </div>
      </form>
    </div>
  );
}
