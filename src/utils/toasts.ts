// src/utils/toasts.ts
import { toast } from "react-toastify";

export const showSuccess = (message: string) => {
  toast.success(message, {
    icon: "✅",
  });
};

export const showError = (message: string) => {
  toast.error(message, {
    icon: "❌",
  });
};

export const showWarning = (message: string) => {
  toast.warning(message, {
    icon: "⚠️",
  });
};

export const showInfo = (message: string) => {
  toast.info(message, {
    icon: "ℹ️",
  });
};

// Exemples préconfigurés pour Moovea
export const toastActiviteAjoutee = (titre: string) =>
  showSuccess(`L'activité “${titre}” a été proposée avec succès !`);

export const toastVoteActivite = (titre: string) =>
  showSuccess(`🎉 Vous avez voté pour “${titre}” !`);

export const toastActiviteSupprimee = (titre: string) =>
  showSuccess(`🗑 L'activité “${titre}” a été supprimée.`);

export const toastDepenseAjoutee = (titre: string) =>
  showSuccess(`💸 La dépense “${titre}” a été ajoutée.`);

export const toastDepenseSupprimee = (titre: string) =>
  showSuccess(`🗑 La dépense “${titre}” a été supprimée.`);

export const toastErreurGenerique = () =>
  showError("Une erreur est survenue. Veuillez réessayer.");
export const toastParticipantAjoute = (email: string) =>
  toast.success(`👤 ${email} a été ajouté(e) au voyage !`);

export const toastDiscussionEnvoyee = () =>
  toast.success("💬 Message envoyé !");
