import en_email from '../../locales/en.email.json' with { type: 'json' };
import en_translation from '../../locales/en.translation.json' with { type: 'json' };

import fr_email from '../../locales/fr.email.json' with { type: 'json' };
import fr_translation from '../../locales/fr.translation.json' with { type: 'json' };

export const i18nResources = {
  en: { translation: en_translation, email: en_email },
  fr: { translation: fr_translation, email: fr_email },
};
