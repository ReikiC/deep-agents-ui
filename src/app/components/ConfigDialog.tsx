"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConfigDialog({
  open,
  onOpenChange,
}: ConfigDialogProps) {
  const [apiUrl, setApiUrl] = useState("");

  useEffect(() => {
    if (open) {
      setApiUrl(
        localStorage.getItem("api_url") ||
        process.env.NEXT_PUBLIC_API_URL ||
        "http://localhost:8000"
      );
    }
  }, [open]);

  const handleSave = () => {
    if (!apiUrl) {
      alert("Please enter an API URL");
      return;
    }

    localStorage.setItem("api_url", apiUrl);
    onOpenChange(false);
    // 刷新页面以应用新配置
    window.location.reload();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your API connection settings. These settings are saved in your browser&apos;s local storage.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="apiUrl">API URL</Label>
            <Input
              id="apiUrl"
              placeholder="http://localhost:8000"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              The URL of your Universal Agent Backend API server
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleSave}>Save & Reload</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
