import { Language } from '@shared/types/game';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSocket } from '../../hooks/useSocket';
import { Modal } from './Modal';

interface LanguageSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LanguageSettings: React.FC<LanguageSettingsProps> = ({
  isOpen,
  onClose,
}) => {
  const { t, i18n } = useTranslation();
  const socket = useSocket();
  const [currentLanguage, setCurrentLanguage] = useState<Language>(
    i18n.language as Language
  );

  const handleLanguageChange = (language: Language) => {
    setCurrentLanguage(language);
    i18n.changeLanguage(language);

    // Notify server about language change
    if (socket) {
      socket.emit('change-language', language);
    }
  };

  const languages = [
    { code: Language.SPANISH, name: 'Español', flag: '🇪🇸' },
    { code: Language.ENGLISH, name: 'English', flag: '🇺🇸' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('settings.language.title')}
      className="language-settings-modal"
    >
      <div className="language-settings">
        <p className="language-description">
          {t('settings.language.description')}
        </p>

        <div className="language-options">
          {languages.map(lang => (
            <button
              key={lang.code}
              className={`language-option ${
                currentLanguage === lang.code ? 'active' : ''
              }`}
              onClick={() => handleLanguageChange(lang.code)}
            >
              <span className="language-flag">{lang.flag}</span>
              <span className="language-name">{lang.name}</span>
              {currentLanguage === lang.code && (
                <span className="checkmark">✓</span>
              )}
            </button>
          ))}
        </div>

        <div className="language-info">
          <p className="current-language">
            {t('settings.language.current')}:{' '}
            {languages.find(l => l.code === currentLanguage)?.name}
          </p>
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            {t('common.close')}
          </button>
        </div>
      </div>
    </Modal>
  );
};
