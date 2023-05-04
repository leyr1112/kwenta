import KwentaSDK from 'kwenta-sdk';

import { wagmiClient } from 'containers/Connector/config';

export const sdk = new KwentaSDK({ networkId: 10, provider: wagmiClient.provider });
