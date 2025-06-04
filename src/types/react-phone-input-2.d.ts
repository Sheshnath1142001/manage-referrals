declare module 'react-phone-input-2' {
  import { Component } from 'react';
  
  interface PhoneInputProps {
    country?: string;
    value?: string;
    onChange?: (value: string, data: any) => void;
    enableSearch?: boolean;
    searchPlaceholder?: string;
    inputProps?: any;
    buttonClass?: string;
    containerClass?: string;
    dropdownClass?: string;
    searchClass?: string;
    preferredCountries?: string[];
    countryCodeEditable?: boolean;
  }

  export default class PhoneInput extends Component<PhoneInputProps> {}
} 