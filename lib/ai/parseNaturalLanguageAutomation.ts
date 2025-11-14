import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const PARSER_PROMPTS = {
  de: `Du bist ein Experte für das Übersetzen natürlicher Sprache in Workflow-Konfigurationen.

Der Benutzer beschreibt, was automatisiert werden soll. Erstelle daraus eine strukturierte JSON-Konfiguration.

BEISPIELE:
User: "Gmail verbinden → Wenn Rechnung ankommt → Wichtige Infos extrahieren → In Tabelle einfügen"
JSON: {
  "trigger": {"type": "email", "integration": "gmail", "conditions": [{"field": "subject", "contains": ["Rechnung", "Invoice"]}]},
  "actions": [
    {"type": "ai_extract", "fields": ["invoice_number", "amount", "due_date"]},
    {"type": "spreadsheet_append", "integration": "google_sheets"}
  ]
}

User: "E-Mails überwachen → Wenn Betreff 'dringend' → Benachrichtigung senden"
JSON: {
  "trigger": {"type": "email", "integration": "gmail", "conditions": [{"field": "subject", "contains": ["dringend", "urgent"]}]},
  "actions": [{"type": "notification", "channel": "email", "priority": "high"}]
}

Erstelle jetzt eine JSON-Konfiguration für die folgende Beschreibung:`,

  en: `You are an expert at translating natural language into workflow configurations.

The user describes what they want to automate. Create a structured JSON configuration from it.

EXAMPLES:
User: "Connect Gmail → When invoice arrives → Extract important info → Add to spreadsheet"
JSON: {
  "trigger": {"type": "email", "integration": "gmail", "conditions": [{"field": "subject", "contains": ["Invoice", "Bill"]}]},
  "actions": [
    {"type": "ai_extract", "fields": ["invoice_number", "amount", "due_date"]},
    {"type": "spreadsheet_append", "integration": "google_sheets"}
  ]
}

User: "Monitor emails → If subject contains 'urgent' → Send notification"
JSON: {
  "trigger": {"type": "email", "integration": "gmail", "conditions": [{"field": "subject", "contains": ["urgent", "important"]}]},
  "actions": [{"type": "notification", "channel": "email", "priority": "high"}]
}

Now create a JSON configuration for the following description:`
};

export async function parseNaturalLanguageAutomation(
  userPrompt: string,
  userLanguage: 'de' | 'en' = 'de'
): Promise<{
  workflow_config: any;
  suggested_name: string;
  confidence: number;
}> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: PARSER_PROMPTS[userLanguage]
      },
      {
        role: 'user',
        content: userPrompt
      }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2,
  });

  const result = JSON.parse(completion.choices[0].message.content!);
  
  // Generate a suggested name based on the workflow
  const suggestedName = generateAutomationName(result, userLanguage);
  
  return {
    workflow_config: result,
    suggested_name: suggestedName,
    confidence: 0.90
  };
}

function generateAutomationName(config: any, language: 'de' | 'en'): string {
  const nameTemplates = {
    de: {
      email_to_spreadsheet: 'E-Mail zu Tabelle',
      invoice_processing: 'Rechnungsverarbeitung',
      backup: 'Automatisches Backup',
      notification: 'Benachrichtigungen'
    },
    en: {
      email_to_spreadsheet: 'Email to Spreadsheet',
      invoice_processing: 'Invoice Processing',
      backup: 'Automatic Backup',
      notification: 'Notifications'
    }
  };
  
  // Simple pattern matching
  if (config.trigger?.type === 'email' && config.actions?.[0]?.type === 'spreadsheet_append') {
    return nameTemplates[language].email_to_spreadsheet;
  }
  
  return nameTemplates[language].invoice_processing;
}
