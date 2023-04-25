import { createSelector } from '@reduxjs/toolkit';

import { DEFAULT_NETWORK_ID } from 'constants/defaults';
import { getSynthsForNetwork } from 'sdk/data/synths';
import type { RootState } from 'state/store';

const SUPPORTED_NETWORKS = [1, 10, 5, 420];

export const selectWallet = (state: RootState) => '0xc8728Ae130381EB77Fc9a8b715564B00e83E19Df';

export const selectNetwork = (state: RootState) => state.wallet.networkId ?? DEFAULT_NETWORK_ID;

export const selectIsUnsupportedNetwork = createSelector(
	(state: RootState) => state.wallet.networkId,
	(networkId) => networkId && !SUPPORTED_NETWORKS.includes(networkId)
);

export const selectIsWalletConnected = createSelector(
	(state: RootState) => state.wallet.walletAddress,
	(walletAddress) => !!walletAddress
);

export const selectIsL2 = createSelector(
	(state: RootState) => state.wallet.networkId,
	(networkId) => networkId && (networkId === 10 || networkId === 420)
);

export const selectIsL1 = createSelector(
	(state: RootState) => state.wallet.networkId,
	(networkId) => networkId && (networkId === 1 || networkId === 5)
);

export const selectIsTestnet = createSelector(
	(state: RootState) => state.wallet.networkId,
	(networkId) => networkId && (networkId === 5 || networkId === 420)
);

export const selectIsMainnet = createSelector(
	(state: RootState) => state.wallet.networkId,
	(networkId) => networkId && (networkId === 5 || networkId === 420)
);

export const selectSynthsMap = createSelector(
	(state: RootState) => state.wallet.networkId,
	(networkId) => (networkId ? getSynthsForNetwork(networkId) : {})
);
