"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PropertyForm } from "@/components/properties/property-form";
import { PropertiesList } from "@/components/properties/properties-list";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function PropertiesPage() {
  const t = useTranslations();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setIsFormOpen(false);
    setEditingProperty(null);
    setRefreshKey((prev) => prev + 1);
  };

  const handleEdit = (property: any) => {
    setEditingProperty(property);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("properties.title")}</h1>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="me-2 h-4 w-4" />
          {t("properties.newProperty")}
        </Button>
      </div>

      <PropertiesList key={refreshKey} onEdit={handleEdit} />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingProperty
                ? t("properties.editProperty")
                : t("properties.newProperty")}
            </DialogTitle>
          </DialogHeader>
          <PropertyForm
            property={editingProperty}
            onSuccess={handleSuccess}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingProperty(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
