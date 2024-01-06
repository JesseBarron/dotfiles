import { recordTypeConstants } from "./record-type-constants";
import { CountriesArray } from "../../shared/Countries";
import { translateThis } from "../../shared/helpers";
import { FieldRef } from "./record-types";
import fieldTypesJSON from '../../javascript/record-types/field-types.json';
import React from "react";
import CardIcon from "../../shared/record_views/CardIcon";
import type { Address } from "../bg/src/types/cache/address";
import type { PaymentCard } from "../bg/src/types/cache/paymentCard";
import { isPaymentCard } from "../bg/src/types/cache/paymentCard";
import type { Record } from "../bg/src/types/cache/record";
import { formatCCN } from "@shared/Records/record-types-utils";
import { i18nGetUILanguage } from "../bg/src/lib/browserCommands/i18n/getUILanguage";

export interface FieldTypes {
  [index: string]: FieldType | undefined
}

export interface FieldType {
  $id: string,
  description: string,
  elements?: string[]
}

export const fieldTypes = fieldTypesJSON as FieldTypes

export interface SelectListOption {
  name: string,
  value: string
}

export interface FieldTypeConfig {
  canEdit?: boolean,
  canView?: boolean,
  generateOptions?: (props: any) => SelectListOption[],
  getDefaultValue?: (props: any) => string,
  getDisplayValue?: (value: string | number) => string,
  getMaskedValue?: (value: string) => string,
  isMasked?: boolean,
  placeholderText?: string,
  renderLeadingIcon?: (record: Record | PaymentCard | Address) => JSX.Element | null
  saveInput?: (value: string) => string | number | undefined,
  siblingField?: string,
  validateExpInput?: (value: string, inputType: string) => string,
  validateInput?: (value: string) => string,
}

const cardExpirationDateRegex = /(0[1-9]|1[012])[/](\d\d)/ // MM/YY
const dateRegex = /(0[1-9]|1[012])[/](0[1-9]|[12][0-9]|3[01])[/]\d\d/; // MM/DD/YY
const digitRegex = /^[0-9\b]+$/;
const lettersAndDigitsRegex = /[^A-Za-z0-9]+/;
// RFC 1035
const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

const replaceNonDigits = (value: string) => {
  return value.replace(/\D/g, '');
}

const replaceNonAlphanumerics = (value: string) => {
  return value.replace(/\W/g, '');
}

const maskNumber = (value: string) => {
  return "••••••••••••" + value.substr(-4);
}

const replaceWhiteSpaces = (value: string) => {
  return value.replace(/\s/g, '');
}

export const validateExpirationDate = (value: string, inputType: string) => {
  if (value.length > 5) { // limit length
    value = value.slice(0, 5);
  }

  if (value.length === 1) {
    if (parseInt(value, 10) > 1) {
      value = '0' + value + '/';
    }
  }
  else if (value.length === 2) {
    if (parseInt(value, 10) > 12) {
      value = '0' + value[0] + '/' + value[1];
    }
    else if (inputType != 'deleteContentBackward') {
      value = value + '/';
    }
  }
  else if (value.length === 3) { // auto add slash
    if (value[1] !== '/' && value[2] !== '/') {
      value = value.slice(0, 2) + '/' + value[2];
    }
  }
  else if (value.length === 5 && value[2] === '/') {
    var year = value.slice(3);
    var month = value.slice(0, 2);
    value = month + '/' + year;
  }

  return value;
}

export const fieldTypeConfigs: { [index: string]: FieldTypeConfig} = {
  [recordTypeConstants.TITLE]: {
    canView: false, // Because it's already included in the header
    getDefaultValue: props => props.recordType.$id === recordTypeConstants.LOGIN ? props.title : ''
  },
  [recordTypeConstants.LOGIN]: {
    placeholderText: translateThis("email_or_username"),
    getDefaultValue: props => props.uname
  },
  [recordTypeConstants.PASSWORD]: {
    isMasked: true,
    getMaskedValue: () => "••••••••"
  },
  [recordTypeConstants.URL]: {
    placeholderText: "https://",
    getDefaultValue: props => props.url
  },
  [recordTypeConstants.NOTE]: {
    placeholderText: "Add a note" // needs translation
  },
  [recordTypeConstants.ONE_TIME_CODE]: {
    canEdit: false
  },
  [recordTypeConstants.SECURITY_QUESTION]: {
    canEdit: false
  },
  [recordTypeConstants.DATE]: {
    getDisplayValue: (value) => {

      let timestamp: number;
      if (typeof value === 'string') {
        // Invalid date format
        if (Number.isNaN(parseInt(value))) {
          return ''
        // Means timestamp as string, so convert it
        } else {
          timestamp = parseInt(value);
        }
      } else {
        timestamp = value;
      }

      // convert from unix timestamp to MM/DD/YYYY format
      const dateObj = new Date(timestamp);
      const month = dateObj.getMonth() + 1;
      const day = dateObj.getDate();
      const year = dateObj.getFullYear();

      return dateObj.toLocaleDateString() || month + '/' + day + '/' + year;
    },
    validateInput: (value) => {

      // Very basic masking that only allows '/' and digits
      value = value.split('/').map(replaceNonDigits).join('/');

      return value;
    },
    saveInput: (value) => {

      // convert from MM/DD/YYYY into unix timesamp
      const dateObj = new Date(value);
      const timestamp = dateObj.getTime();

      return Number.isNaN(timestamp) ? undefined : timestamp;
    },
    placeholderText: "MM/DD/YYYY"
  },
  [recordTypeConstants.ZIP]: {
    validateInput: replaceNonDigits
  },
  [recordTypeConstants.ROUTING_NUMBER]: {
    validateInput: replaceNonDigits,
    isMasked: true,
    getMaskedValue: maskNumber,
    placeholderText: "123456789"
  },
  [recordTypeConstants.ACCOUNT_NUMBER]: {
    validateInput: replaceNonAlphanumerics,
    isMasked: true,
    getMaskedValue: maskNumber,
    placeholderText: "123456789"
  },
  [recordTypeConstants.CARD_NUMBER]: {
    getDisplayValue: (value) => {
      if (typeof value === 'number') {
        value = String(value);
      }
      return formatCCN(value);
    },
    validateInput: replaceNonDigits,
    saveInput: replaceWhiteSpaces,
    isMasked: true,
    getMaskedValue: maskNumber,
    placeholderText: "1234 5678 9012 3456",
    renderLeadingIcon: (record) => {
      if (!isPaymentCard(record)) return null
      const cardNumber = record[recordTypeConstants.CARD_NUMBER];
      return <CardIcon cardNumber={cardNumber}/>;
    }
  },
  [recordTypeConstants.CARD_EXPIRATION_DATE]: {
    validateExpInput: validateExpirationDate,
    placeholderText: "MM/YY",
    siblingField: recordTypeConstants.CARD_SECURITY_CODE
  },
  [recordTypeConstants.CARD_SECURITY_CODE]: {
    validateInput: replaceNonDigits,
    isMasked: true,
    getMaskedValue: () => "•••",
    placeholderText: "000",
    siblingField: recordTypeConstants.CARD_EXPIRATION_DATE
  },
  [recordTypeConstants.EMAIL]: {
    placeholderText: "email@example.com" // needs translation
  },
  [recordTypeConstants.ADDRESS_REF]: {
    placeholderText: "Add Address", // needs translation
    generateOptions: (props) => {
      var options: SelectListOption[] = [];

      return props.addresses.reduce((addressOptions: any, address: any) => {
        if (address.record_uid) {
          addressOptions.push({
            name: `${address.title}\n${address.address.street1} ${address.address.state}, ${address.address.city} ${address.address.zip}`,
            value: address.record_uid
          });
        }
        return addressOptions;
      }, options);
    }
  },
  [recordTypeConstants.ACCOUNT_TYPE]: {
    placeholderText: "Choose", // needs translation
    generateOptions: () => {
      return [{
        name: 'Checking',
        value: 'checking'
      }, {
        name: 'Savings',
        value: 'savings'
      }, {
        name: 'Other',
        value: 'other'
      }]
    }
  },
  [recordTypeConstants.COUNTRY]: {
    getDefaultValue: () => {
      const locale = i18nGetUILanguage().split('-')[1];
      const index = CountriesArray.findIndex(country => country.value.includes(locale));
      const value = CountriesArray[index]?.value
      return value;
    },
    generateOptions: () => CountriesArray
  },
  [recordTypeConstants.PIN_CODE]: {
    canEdit: false,
    canView: false
  },
  [recordTypeConstants.FILE_REF]: {
    canEdit: false,
    canView: false
  },
  [recordTypeConstants.FIRST_NAME]: {
    canView: false
  },
  [recordTypeConstants.LAST_NAME]: {
    canView: false
  },
  [recordTypeConstants.FULL_NAME]: {
    canEdit: false
  },
  [recordTypeConstants.CARD_REF]: {
    canEdit: false,
    canView: false
  },
  [recordTypeConstants.COMPANY]: {
    canEdit: false,
    canView: false
  }
};

const toSnake = (x: string) => x.split(/(?=[A-Z])/).join("_").toLowerCase();

export function getLabelForFieldRef(fieldRef: FieldRef): string {
  const label = fieldRef.label ?? fieldRef.$ref;
  const transKey = `fld_${toSnake(label)}`;
  return translateThis(transKey);
}
