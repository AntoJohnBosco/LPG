import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Plus, Siren, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/app-shell";
import { ContactCard } from "@/components/contacts/contact-card";
import { ContactFormDialog } from "@/components/contacts/contact-form-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeleteContact, useEmergencyContacts, useSaveContact } from "@/hooks/use-gasguard";
import type { EmergencyContact } from "@/types";

export const Route = createFileRoute("/contacts")({
  head: () => ({
    meta: [
      { title: "Emergency Contacts — GasGuard AI" },
      {
        name: "description",
        content:
          "Add, edit and delete the emergency contacts GasGuard AI calls when a gas leak is detected.",
      },
      { property: "og:title", content: "Emergency Contacts — GasGuard AI" },
      {
        property: "og:description",
        content: "Manage your gas safety escalation ladder with one-tap emergency calling.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactsPage,
});

function ContactsPage() {
  const contacts = useEmergencyContacts();
  const save = useSaveContact();
  const remove = useDeleteContact();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<EmergencyContact | null>(null);
  const [pendingDelete, setPendingDelete] = useState<EmergencyContact | null>(null);

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (contact: EmergencyContact) => {
    setEditing(contact);
    setFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Response team"
        title="Emergency contacts"
        description="Escalation ladder used by automatic alerts — tap to call, swipe a card to edit or delete."
      />

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="surface-card ambient-grid rounded-4xl p-6"
      >
        <h2 className="text-lg font-semibold tracking-tight">Broadcast an emergency</h2>
        <p className="mt-1 max-w-lg text-sm text-muted-foreground">
          Sends an SMS and push alert to every contact below with the affected node and live ppm
          reading.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button
            variant="emergency"
            size="xl"
            onClick={() => toast.error("Emergency broadcast sent to all contacts")}
          >
            <Siren /> Trigger emergency broadcast
          </Button>
          <Button variant="outline" size="xl" onClick={openAdd}>
            <UserPlus /> Add contact
          </Button>
        </div>
      </motion.section>

      <section className="grid gap-4 sm:grid-cols-2">
        {contacts.isLoading
          ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-3xl" />)
          : contacts.data?.map((contact, index) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                index={index}
                onEdit={openEdit}
                onDelete={setPendingDelete}
              />
            ))}

        {!contacts.isLoading && (contacts.data?.length ?? 0) === 0 && (
          <div className="surface-card rounded-3xl p-8 text-center sm:col-span-2">
            <p className="text-sm font-semibold tracking-tight">No contacts yet</p>
            <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
              Add the people and services GasGuard AI should reach during a leak.
            </p>
            <Button variant="hero" size="lg" className="mt-5" onClick={openAdd}>
              <Plus /> Add your first contact
            </Button>
          </div>
        )}
      </section>

      <ContactFormDialog
        open={formOpen}
        contact={editing}
        pending={save.isPending}
        onOpenChange={setFormOpen}
        onSubmit={(input) =>
          save.mutate(input, {
            onSuccess: (contact) => {
              setFormOpen(false);
              toast.success(editing ? `${contact.name} updated` : `${contact.name} added`);
            },
            onError: () => toast.error("Could not save contact"),
          })
        }
      />

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {pendingDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This contact will no longer be called or messaged during an emergency. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={remove.isPending}
              onClick={() => {
                const target = pendingDelete;
                if (!target) return;
                remove.mutate(target.id, {
                  onSuccess: () => toast.success(`${target.name} removed`),
                  onError: () => toast.error("Could not delete contact"),
                });
                setPendingDelete(null);
              }}
            >
              Delete contact
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
