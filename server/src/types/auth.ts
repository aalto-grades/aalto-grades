import {AuthData} from '@/common/types';

export type FullLoginResult = AuthData & {
  forcePasswordReset: boolean | null;
};
