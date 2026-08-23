import type { NavigatorScreenParams } from '@react-navigation/native';

export type PartnersStackParamList = {
  PartnersList: undefined;
  PartnerForm: { partnerId?: string } | undefined;
};

export type RootTabParamList = {
  Learn: undefined;
  Partners: NavigatorScreenParams<PartnersStackParamList> | undefined;
  Triggered: undefined;
  Practice: undefined;
  Settings: undefined;
};
