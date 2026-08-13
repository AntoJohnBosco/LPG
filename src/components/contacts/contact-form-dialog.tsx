import { useEffect, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { z } from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { EmergencyContact, EmergencyContactInput } from "@/types";

const schema = z.object({
  name: z.string().trim().nonempty("Name is required").max(80, "Name is too long"),
  relationship: z
    .string()
    .trim()
    .nonempty("Relationship is required")
    .max(60, "Relationship is too long"),
  phone: z
    .string()
    .trim()
    .nonempty("Phone number is required")
    .max(20, "Phone number is too long")
    .regex(/^[+0-9 ()-]+$/, "Use digits, spaces and + only"),
});

const EMPTY = { name: "", relationship: "", phone: "" };

export function ContactFormDialog({
  open,
  contact,
  pending,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  contact: EmergencyContact | null;
  pending: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: EmergencyContactInput) => void;
}) {
  const [values, setValues] = useState(EMPTY);
  const [primary, setPrimary] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setValues(
      contact
        ? { name: contact.name, relationship: contact.relationship, phone: contact.phone }
        : EMPTY,
    );
    setPrimary(contact?.primary ?? false);
    setPhotoUrl(contact?.photoUrl);
    setErrors({});
  }, [open, contact]);

  const pickPhoto = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoUrl(String(reader.result));
    reader.readAsDataURL(file);
  };

  const submit = () => {
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    onSubmit({ id: contact?.id, ...parsed.data, primary, photoUrl });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{contact ? "Edit contact" : "Add contact"}</DialogTitle>
          <DialogDescription>
            Contacts are notified in order during a critical gas detection event.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border border-border">
              {photoUrl && <AvatarImage src={photoUrl} alt="Contact photo" />}
              <AvatarFallback className="bg-primary-soft text-primary">
                {values.name.trim().charAt(0).toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                <ImagePlus /> {photoUrl ? "Change photo" : "Add photo"}
              </Button>
              {photoUrl && (
                <Button variant="ghost" size="sm" onClick={() => setPhotoUrl(undefined)}>
                  <X /> Remove
                </Button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => pickPhoto(event.target.files?.[0])}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-name">Name</Label>
            <Input
              id="contact-name"
              value={values.name}
              maxLength={80}
              placeholder="Anita Rao"
              onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-relationship">Relationship</Label>
            <Input
              id="contact-relationship"
              value={values.relationship}
              maxLength={60}
              placeholder="Site safety officer"
              onChange={(e) => setValues((v) => ({ ...v, relationship: e.target.value }))}
            />
            {errors.relationship && (
              <p className="text-xs text-destructive">{errors.relationship}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-phone">Phone number</Label>
            <Input
              id="contact-phone"
              inputMode="tel"
              value={values.phone}
              maxLength={20}
              placeholder="+91 98450 11234"
              onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
            />
            {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
          </div>

          <div className="flex items-center justify-between gap-4 rounded-2xl bg-gradient-surface p-4">
            <div>
              <p className="text-sm font-semibold tracking-tight">Primary contact</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Called first during an alarm.</p>
            </div>
            <Switch checked={primary} onCheckedChange={setPrimary} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="hero" disabled={pending} onClick={submit}>
            {contact ? "Save changes" : "Add contact"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
