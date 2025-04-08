export interface ADPwnModuleOption {
  key: string;
  type: ModuleOptionType;
  required: boolean;
}

export enum ModuleOptionType {
  Checkbox = "checkbox",
  TextInput = "textInput",
  UserSelection = "userSelection",
  TargetSelection = "targetSelection",
}
