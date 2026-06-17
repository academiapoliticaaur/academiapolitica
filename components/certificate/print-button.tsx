"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PrintButton() {
  return (
    <Button
      onClick={() => window.print()}
      className="gap-2 bg-teal-600 hover:bg-teal-700 text-white"
    >
      <Printer size={16} />
      Tipărește / Salvează PDF
    </Button>
  );
}
