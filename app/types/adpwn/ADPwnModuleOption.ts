export interface ADPwnModuleOption {
  key: string;
  type: ModuleOptionType;
  label: string;
  placeholder: string;
  required: boolean;
}

export enum ModuleOptionType {
  Checkbox = "checkbox",
  TextInput = "textInput",
  UserSelection = "userSelection",
  TargetSelection = "targetSelection",
}
