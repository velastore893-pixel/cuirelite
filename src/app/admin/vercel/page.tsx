"use client";

import { useState } from "react";
import { Cloud, Database, Rocket, ExternalLink, Copy, CheckCircle, AlertCircle } from "lucide-react";

export default function DeploymentPage() {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">نشر الموقع</h1>
        <p className="text-gray-500 mt-1">دليل نشر الموقع على Vercel مع Supabase</p>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* Supabase Setup */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
              <Database size={20} className="text-white" />
            </div>
            الخطوة 1: إعداد Supabase
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <span className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
              <div>
                <p className="font-semibold">إنشاء مشروع جديد</p>
                <a href="https://supabase.com" target="_blank" className="text-green-600 text-sm flex items-center gap-1 hover:underline">
                  supabase.com <ExternalLink size={12} />
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <span className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
              <div>
                <p className="font-semibold">انسخ Database URL</p>
                <p className="text-sm text-gray-500">من Project Settings → Database</p>
                <button onClick={() => copyToClipboard("postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres")} className="mt-2 flex items-center gap-2 text-sm text-green-600 hover:underline">
                  <Copy size={14} /> نسخ نموذج الرابط
                </button>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <span className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
              <div>
                <p className="font-semibold">انسخ API Keys</p>
                <p className="text-sm text-gray-500">من Project Settings → API</p>
                <button onClick={() => copyToClipboard("NEXT_PUBLIC_SUPABASE_URL=https://[REF].supabase.co\nNEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key\nSUPABASE_SERVICE_ROLE_KEY=your_service_key")} className="mt-2 flex items-center gap-2 text-sm text-green-600 hover:underline">
                  <Copy size={14} /> نسخ نموذج المتغيرات
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Vercel Setup */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
              <Cloud size={20} className="text-white" />
            </div>
            الخطوة 2: نشر على Vercel
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <span className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
              <div>
                <p className="font-semibold">ارفع المشروع إلى GitHub</p>
                <p className="text-sm text-gray-500">أنشئ مستودع جديد وارفع الكود</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <span className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
              <div>
                <p className="font-semibold">اربط Vercel بـ GitHub</p>
                <a href="https://vercel.com" target="_blank" className="text-blue-600 text-sm flex items-center gap-1 hover:underline">
                  vercel.com <ExternalLink size={12} />
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <span className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
              <div>
                <p className="font-semibold">أضف متغيرات البيئة</p>
                <p className="text-sm text-gray-500">في Project Settings → Environment Variables</p>
                <div className="mt-2 bg-gray-900 text-green-400 p-3 rounded-lg text-xs font-mono overflow-x-auto">
                  <div>DATABASE_URL=your_database_url</div>
                  <div>NEXT_PUBLIC_SUPABASE_URL=your_url</div>
                  <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key</div>
                  <div>SUPABASE_SERVICE_ROLE_KEY=your_key</div>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <span className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">4</span>
              <div>
                <p className="font-semibold">اضغط Deploy</p>
                <p className="text-sm text-gray-500">Vercel سيقوم بالبناء والنشر تلقائياً</p>
              </div>
            </div>
          </div>
        </div>

        {/* Migration */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <Rocket size={20} className="text-white" />
            </div>
            الخطوة 3: نقل البيانات
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
              <div>
                <p className="font-semibold">شغّل Seed على Supabase</p>
                <p className="text-sm text-gray-500">اضغط على زر Seed بالأسفل لنقل البيانات</p>
                <code className="mt-2 block bg-gray-900 text-green-400 p-2 rounded text-xs">
                  DATABASE_URL=your_supabase_url npx tsx src/db/seed.ts
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-6 text-white">
          <h3 className="text-lg font-bold mb-4">روابط سريعة</h3>
          <div className="flex flex-wrap gap-3">
            <a href="https://supabase.com" target="_blank" className="bg-white/20 px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors">
              Supabase
            </a>
            <a href="https://vercel.com" target="_blank" className="bg-white/20 px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors">
              Vercel
            </a>
            <a href="https://github.com" target="_blank" className="bg-white/20 px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors">
              GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
