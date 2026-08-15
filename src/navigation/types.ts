import type { NavigatorScreenParams } from '@react-navigation/native';

export type PartnersStackParamList = {
  PartnersList: undefined;
  PartnerForm: { partnerId?: string } | undefined;
};

export type SettingsStackParamList = {
  SettingsHome: undefined;
  AppLimits: undefined;
};

export type RootTabParamList = {
  Learn: undefined;
  Partners: NavigatorScreenParams<PartnersStackParamList> | undefined;
  Triggered: undefined;
  Practice: undefined;
  Settings: NavigatorScreenParams<SettingsStackParamList> | undefined;
};
