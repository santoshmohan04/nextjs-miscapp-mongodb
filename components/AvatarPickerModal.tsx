"use client";

import React, { useState } from "react";
import { Modal, Button, Spinner } from "react-bootstrap";
import Image from "next/image";
import Avatar from "./Avatar";
import { AVAILABLE_AVATARS } from "@/lib/avatars";
import styles from "./avatarpickmodal.module.css";

interface AvatarPickerModalProps {
  show: boolean;
  onClose: () => void;
  onSelect: (avatarKey: string) => Promise<void>;
  currentAvatarKey?: string;
  userName?: string;
}

export default function AvatarPickerModal({
  show,
  onClose,
  onSelect,
  currentAvatarKey,
  userName = "User",
}: AvatarPickerModalProps) {
  const [loading, setLoading] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | undefined>(
    currentAvatarKey
  );

  const handleSelect = async (avatarKey: string) => {
    if (loading) return;
    setSelectedKey(avatarKey);
    setLoading(true);

    try {
      await onSelect(avatarKey);
      setLoading(false);
      onClose();
    } catch (err) {
      console.error("Failed to update avatar:", err);
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Choose Your Avatar</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className={styles.avatarGrid}>
          {AVAILABLE_AVATARS.map((avatar) => (
            <button
              key={avatar.key}
              className={`${styles.avatarItem} ${
                selectedKey === avatar.key ? styles.selected : ""
              }`}
              onClick={() => handleSelect(avatar.key)}
              disabled={loading}
              title={avatar.label}
            >
              <div className={styles.avatarPreview}>
                <Avatar avatarKey={avatar.key} name={userName} size="lg" />
              </div>
              {selectedKey === avatar.key && (
                <div className={styles.checkmark}>
                  {loading ? (
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                    />
                  ) : (
                    "✓"
                  )}
                </div>
              )}
            </button>
          ))}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={() => selectedKey && handleSelect(selectedKey)}
          disabled={loading || !selectedKey}
        >
          {loading ? "Saving..." : "Save Avatar"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
