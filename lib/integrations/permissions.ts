/**
 * Granular Permission System for OAuth Integrations
 * Allows users to select specific permissions for each integration
 */

export interface Permission {
  id: string;
  name: string;
  description: string;
  scope: string[];
  required: boolean; // If true, integration won't work without it
  category: 'read' | 'write' | 'admin';
}

export interface PermissionGroup {
  name: string;
  permissions: Permission[];
}

// Gmail Permissions
export const GMAIL_PERMISSIONS: PermissionGroup[] = [
  {
    name: 'E-Mail lesen',
    permissions: [
      {
        id: 'gmail_read_basic',
        name: 'E-Mails anzeigen',
        description: 'Ermöglicht das Lesen Ihrer E-Mails und Metadaten',
        scope: ['https://www.googleapis.com/auth/gmail.readonly'],
        required: true,
        category: 'read'
      },
      {
        id: 'gmail_read_labels',
        name: 'Labels anzeigen',
        description: 'Ermöglicht das Anzeigen Ihrer E-Mail-Labels',
        scope: ['https://www.googleapis.com/auth/gmail.labels'],
        required: false,
        category: 'read'
      }
    ]
  },
  {
    name: 'E-Mail schreiben',
    permissions: [
      {
        id: 'gmail_send',
        name: 'E-Mails senden',
        description: 'Ermöglicht das Versenden von E-Mails in Ihrem Namen',
        scope: ['https://www.googleapis.com/auth/gmail.send'],
        required: false,
        category: 'write'
      },
      {
        id: 'gmail_modify',
        name: 'E-Mails bearbeiten',
        description: 'Ermöglicht das Löschen, Archivieren und Markieren von E-Mails',
        scope: ['https://www.googleapis.com/auth/gmail.modify'],
        required: false,
        category: 'write'
      }
    ]
  }
];

// Dropbox Permissions
export const DROPBOX_PERMISSIONS: PermissionGroup[] = [
  {
    name: 'Dateien',
    permissions: [
      {
        id: 'dropbox_read',
        name: 'Dateien lesen',
        description: 'Ermöglicht das Lesen und Herunterladen von Dateien',
        scope: ['files.content.read'],
        required: true,
        category: 'read'
      },
      {
        id: 'dropbox_write',
        name: 'Dateien schreiben',
        description: 'Ermöglicht das Hochladen und Bearbeiten von Dateien',
        scope: ['files.content.write'],
        required: false,
        category: 'write'
      },
      {
        id: 'dropbox_metadata',
        name: 'Metadaten lesen',
        description: 'Ermöglicht das Lesen von Dateiinformationen',
        scope: ['files.metadata.read'],
        required: false,
        category: 'read'
      }
    ]
  },
  {
    name: 'Freigaben',
    permissions: [
      {
        id: 'dropbox_sharing',
        name: 'Dateien teilen',
        description: 'Ermöglicht das Erstellen von Freigabe-Links',
        scope: ['sharing.write'],
        required: false,
        category: 'write'
      }
    ]
  }
];

// Outlook Permissions
export const OUTLOOK_PERMISSIONS: PermissionGroup[] = [
  {
    name: 'E-Mail',
    permissions: [
      {
        id: 'outlook_read',
        name: 'E-Mails lesen',
        description: 'Ermöglicht das Lesen Ihrer E-Mails',
        scope: ['https://graph.microsoft.com/Mail.Read'],
        required: true,
        category: 'read'
      },
      {
        id: 'outlook_send',
        name: 'E-Mails senden',
        description: 'Ermöglicht das Versenden von E-Mails',
        scope: ['https://graph.microsoft.com/Mail.Send'],
        required: false,
        category: 'write'
      },
      {
        id: 'outlook_modify',
        name: 'E-Mails verwalten',
        description: 'Ermöglicht das Bearbeiten und Löschen von E-Mails',
        scope: ['https://graph.microsoft.com/Mail.ReadWrite'],
        required: false,
        category: 'write'
      }
    ]
  },
  {
    name: 'System',
    permissions: [
      {
        id: 'outlook_offline',
        name: 'Offline-Zugriff',
        description: 'Ermöglicht dauerhaften Zugriff ohne erneute Anmeldung',
        scope: ['offline_access'],
        required: true,
        category: 'read'
      }
    ]
  }
];

// Slack Permissions
export const SLACK_PERMISSIONS: PermissionGroup[] = [
  {
    name: 'Kanäle',
    permissions: [
      {
        id: 'slack_channels_read',
        name: 'Kanäle anzeigen',
        description: 'Ermöglicht das Anzeigen von Kanal-Informationen',
        scope: ['channels:read'],
        required: true,
        category: 'read'
      },
      {
        id: 'slack_channels_history',
        name: 'Nachrichten lesen',
        description: 'Ermöglicht das Lesen von Kanal-Nachrichten',
        scope: ['channels:history'],
        required: false,
        category: 'read'
      }
    ]
  },
  {
    name: 'Nachrichten',
    permissions: [
      {
        id: 'slack_chat_write',
        name: 'Nachrichten senden',
        description: 'Ermöglicht das Senden von Nachrichten',
        scope: ['chat:write'],
        required: false,
        category: 'write'
      },
      {
        id: 'slack_files_write',
        name: 'Dateien hochladen',
        description: 'Ermöglicht das Hochladen von Dateien',
        scope: ['files:write'],
        required: false,
        category: 'write'
      }
    ]
  }
];

// Google Calendar Permissions
export const GOOGLE_CALENDAR_PERMISSIONS: PermissionGroup[] = [
  {
    name: 'Kalender',
    permissions: [
      {
        id: 'calendar_read',
        name: 'Termine anzeigen',
        description: 'Ermöglicht das Lesen Ihrer Kalendertermine',
        scope: ['https://www.googleapis.com/auth/calendar.readonly'],
        required: true,
        category: 'read'
      },
      {
        id: 'calendar_write',
        name: 'Termine erstellen',
        description: 'Ermöglicht das Erstellen und Bearbeiten von Terminen',
        scope: ['https://www.googleapis.com/auth/calendar.events'],
        required: false,
        category: 'write'
      },
      {
        id: 'calendar_full',
        name: 'Vollständiger Zugriff',
        description: 'Ermöglicht das Verwalten aller Kalender-Aspekte',
        scope: ['https://www.googleapis.com/auth/calendar'],
        required: false,
        category: 'admin'
      }
    ]
  }
];

// Google Sheets Permissions
export const GOOGLE_SHEETS_PERMISSIONS: PermissionGroup[] = [
  {
    name: 'Tabellen',
    permissions: [
      {
        id: 'sheets_read',
        name: 'Tabellen lesen',
        description: 'Ermöglicht das Lesen von Google Sheets',
        scope: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        required: true,
        category: 'read'
      },
      {
        id: 'sheets_write',
        name: 'Tabellen bearbeiten',
        description: 'Ermöglicht das Bearbeiten von Google Sheets',
        scope: ['https://www.googleapis.com/auth/spreadsheets'],
        required: false,
        category: 'write'
      }
    ]
  },
  {
    name: 'Drive',
    permissions: [
      {
        id: 'sheets_drive',
        name: 'Drive-Zugriff',
        description: 'Ermöglicht das Erstellen neuer Dateien in Drive',
        scope: ['https://www.googleapis.com/auth/drive.file'],
        required: false,
        category: 'write'
      }
    ]
  }
];

// OneDrive Permissions
export const ONEDRIVE_PERMISSIONS: PermissionGroup[] = [
  {
    name: 'Dateien',
    permissions: [
      {
        id: 'onedrive_read',
        name: 'Dateien lesen',
        description: 'Ermöglicht das Lesen von OneDrive-Dateien',
        scope: ['https://graph.microsoft.com/Files.Read.All'],
        required: true,
        category: 'read'
      },
      {
        id: 'onedrive_write',
        name: 'Dateien schreiben',
        description: 'Ermöglicht das Bearbeiten von OneDrive-Dateien',
        scope: ['https://graph.microsoft.com/Files.ReadWrite.All'],
        required: false,
        category: 'write'
      }
    ]
  },
  {
    name: 'System',
    permissions: [
      {
        id: 'onedrive_offline',
        name: 'Offline-Zugriff',
        description: 'Ermöglicht dauerhaften Zugriff',
        scope: ['offline_access'],
        required: true,
        category: 'read'
      }
    ]
  }
];

// Microsoft Teams Permissions
export const MICROSOFT_TEAMS_PERMISSIONS: PermissionGroup[] = [
  {
    name: 'Chat',
    permissions: [
      {
        id: 'teams_chat_read',
        name: 'Chats lesen',
        description: 'Ermöglicht das Lesen von Chat-Nachrichten',
        scope: ['https://graph.microsoft.com/Chat.Read'],
        required: true,
        category: 'read'
      },
      {
        id: 'teams_chat_write',
        name: 'Nachrichten senden',
        description: 'Ermöglicht das Senden von Chat-Nachrichten',
        scope: ['https://graph.microsoft.com/ChatMessage.Send'],
        required: false,
        category: 'write'
      },
      {
        id: 'teams_chat_manage',
        name: 'Chats verwalten',
        description: 'Ermöglicht das Verwalten von Chats',
        scope: ['https://graph.microsoft.com/Chat.ReadWrite'],
        required: false,
        category: 'write'
      }
    ]
  }
];

// Master Permission Map
export const INTEGRATION_PERMISSIONS: Record<string, PermissionGroup[]> = {
  gmail: GMAIL_PERMISSIONS,
  dropbox: DROPBOX_PERMISSIONS,
  outlook: OUTLOOK_PERMISSIONS,
  slack: SLACK_PERMISSIONS,
  'google-calendar': GOOGLE_CALENDAR_PERMISSIONS,
  'google-sheets': GOOGLE_SHEETS_PERMISSIONS,
  onedrive: ONEDRIVE_PERMISSIONS,
  'microsoft-teams': MICROSOFT_TEAMS_PERMISSIONS
};

/**
 * Get selected scopes based on permission IDs
 */
export function getSelectedScopes(
  integrationType: string,
  selectedPermissionIds: string[]
): string[] {
  const permissionGroups = INTEGRATION_PERMISSIONS[integrationType] || [];
  const scopes: string[] = [];

  permissionGroups.forEach(group => {
    group.permissions.forEach(permission => {
      if (selectedPermissionIds.includes(permission.id) || permission.required) {
        scopes.push(...permission.scope);
      }
    });
  });

  // Remove duplicates
  return [...new Set(scopes)];
}

/**
 * Get required permission IDs for an integration
 */
export function getRequiredPermissions(integrationType: string): string[] {
  const permissionGroups = INTEGRATION_PERMISSIONS[integrationType] || [];
  const required: string[] = [];

  permissionGroups.forEach(group => {
    group.permissions.forEach(permission => {
      if (permission.required) {
        required.push(permission.id);
      }
    });
  });

  return required;
}

/**
 * Get default permissions (all required + commonly used optional)
 */
export function getDefaultPermissions(integrationType: string): string[] {
  const permissionGroups = INTEGRATION_PERMISSIONS[integrationType] || [];
  const defaults: string[] = [];

  permissionGroups.forEach(group => {
    group.permissions.forEach(permission => {
      // Include all required and first optional permission from each category
      if (permission.required || permission.category === 'read') {
        defaults.push(permission.id);
      }
    });
  });

  return defaults;
}
