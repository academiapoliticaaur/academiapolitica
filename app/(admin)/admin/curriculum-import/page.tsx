import type { Metadata } from "next";
import { CurriculumImportClient } from "./curriculum-import-client";
import { ImportModuleButton } from "@/components/admin/import-module-button";

export const metadata: Metadata = { title: "Import Curriculum" };

export default function CurriculumImportPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Import Curriculum AI</h1>
          <p className="text-sm text-gray-500 mt-1">
            Importă un curs complet dintr-un fișier DOCX sau PDF
          </p>
        </div>
        <ImportModuleButton />
      </div>
      <CurriculumImportClient />
    </div>
  );
}
