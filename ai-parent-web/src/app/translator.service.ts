import { Injectable } from '@angular/core';
import * as i18n from 'roddeh-i18n';

import * as standardEnglishPersona from '../assets/personas/standard-en.json';
import * as standardChinesePersona from '../assets/personas/standard-zh.json';

@Injectable({
  providedIn: 'root'
})
export class TranslatorService {

  private translations : {[key in string] : Translator};

  constructor() {
    this.translations = [
      {
        file: standardEnglishPersona['default'],
        persona: 'en'
      },
      {
        file: standardChinesePersona['default'],
        persona: 'zh'
      }
    ].reduce((acc, curr) => {

      const generalTranslation = i18n.create({ values: curr.file.general });
      const chatTranslation = i18n.create({ values: curr.file.conversation });
      const reportTranslation = i18n.create({ values: curr.file.report });

      acc[curr.persona] = {
        'general': generalTranslation,
        'chat': chatTranslation,
        'report': reportTranslation,
        'error': () => {
          const randomNumber = Math.floor(Math.random() * 5) + 1;
          return generalTranslation(`error_${randomNumber}`);
        },
        'connector': () => {
          const randomNumber = Math.floor(Math.random() * 5) + 1;
          return generalTranslation(`connector_${randomNumber}`);
        }
      };
      return acc;
    }, {});
  }

  public getTranslator(persona: string): Translator {
    return this.translations[persona];
  }
}

export type Translator = {
  general: (text: string, args?: any) => string,
  chat: (text: string, args?: any) => string,
  report: (text: string, args?: any) => string,
  error: () => string,
  connector: () => string
};