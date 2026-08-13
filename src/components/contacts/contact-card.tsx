import { useState } from "react";
import { motion, useMotionValue, useTransform, type PanInfo } from "motion/react";
import { Pencil, Phone, Star, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { EmergencyContact } from "@/types";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

const REVEAL = 148;

export function ContactCard({
  contact,
  index,
  onEdit,
  onDelete,
}: {
  contact: EmergencyContact;
  index: number;
  onEdit: (contact: EmergencyContact) => void;
  onDelete: (contact: EmergencyContact) => void;
}) {
  const [open, setOpen] = useState(false);
  const x = useMotionValue(0);
  const actionsOpacity = useTransform(x, [-REVEAL, -REVEAL / 3, 0], [1, 0.4, 0]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const shouldOpen = info.offset.x < -REVEAL / 2 || info.velocity.x < -420;
    setOpen(shouldOpen);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="relative overflow-hidden rounded-3xl"
    >
      {/* Swipe-revealed actions */}
      <motion.div
        style={{ opacity: actionsOpacity }}
        className="absolute inset-y-0 right-0 flex items-center gap-2 pr-3"
      >
        <Button
          variant="outline"
          size="icon"
          aria-label={`Edit ${contact.name}`}
          onClick={() => {
            setOpen(false);
            onEdit(contact);
          }}
        >
          <Pencil />
        </Button>
        <Button
          variant="destructive"
          size="icon"
          aria-label={`Delete ${contact.name}`}
          onClick={() => {
            setOpen(false);
            onDelete(contact);
          }}
        >
          <Trash2 />
        </Button>
      </motion.div>

      <motion.div
        drag="x"
        style={{ x }}
        dragConstraints={{ left: -REVEAL, right: 0 }}
        dragElastic={0.08}
        onDragEnd={handleDragEnd}
        animate={{ x: open ? -REVEAL : 0 }}
        transition={{ type: "spring", stiffness: 420, damping: 38 }}
        className="surface-card relative touch-pan-y rounded-3xl p-5 transition-shadow duration-300 hover:shadow-lifted"
      >
        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-4">
          <Avatar className="h-12 w-12 border border-border">
            {contact.photoUrl && <AvatarImage src={contact.photoUrl} alt={contact.name} />}
            <AvatarFallback className="bg-primary-soft text-sm font-semibold text-primary">
              {initials(contact.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold tracking-tight">{contact.name}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">{contact.relationship}</p>
            <p className="mt-2 font-mono text-sm">{contact.phone}</p>
          </div>
          {contact.primary && (
            <span className="flex items-center gap-1 rounded-full bg-primary-soft px-2.5 py-1 text-[10px] font-semibold text-primary">
              <Star className="h-3 w-3" /> Primary
            </span>
          )}
        </div>

        <div className="mt-5 grid grid-cols-[minmax(0,1fr)_auto] gap-2">
          <Button variant="outline" size="lg" asChild>
            <a href={`tel:${contact.phone.replace(/\s/g, "")}`}>
              <Phone /> Call now
            </a>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden"
            aria-label={`Actions for ${contact.name}`}
            onClick={() => setOpen((prev) => !prev)}
          >
            <Pencil />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:inline-flex"
            aria-label={`Edit ${contact.name}`}
            onClick={() => onEdit(contact)}
          >
            <Pencil />
          </Button>
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground sm:hidden">
          Swipe left for edit and delete
        </p>
      </motion.div>
    </motion.div>
  );
}
