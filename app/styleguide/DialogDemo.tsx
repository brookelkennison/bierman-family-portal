"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";

/** Opens the delete confirm from Figma 12. */
export function DialogDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Button
        variant="dangerText"
        iconLeft="delete"
        onClick={() => setOpen(true)}
      >
        Delete booking
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Delete this booking?"
        icon="delete"
        actions={
          <>
            <Button
              variant="danger"
              size="lg"
              fullWidth
              onClick={() => setOpen(false)}
            >
              Delete booking
            </Button>
            <Button
              variant="outline"
              size="lg"
              fullWidth
              data-autofocus
              onClick={() => setOpen(false)}
            >
              Keep it
            </Button>
          </>
        }
      >
        This removes Parent training for Maya on Thu, Oct 22. It can&apos;t be
        undone. If plans just changed, cancel instead.
      </Dialog>
    </div>
  );
}
