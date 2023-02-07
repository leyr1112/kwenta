import { wei } from '@synthetixio/wei';

import { PricesMap } from 'sdk/types/prices';
import { PricesInfoMap } from 'state/prices/types';

export const getPricesInfo = (oldPrices: PricesInfoMap, newPrices: PricesMap<string>) => {
	let pricesInfo: PricesInfoMap = {};

	let asset: keyof PricesMap<string>;
	for (asset in newPrices) {
		const newPrice = wei(newPrices[asset]);
		const oldPrice = oldPrices[asset]?.price ? wei(oldPrices[asset]!.price) : null;
		const oldChange = oldPrices[asset]?.change;

		pricesInfo[asset] = {
			price: newPrice,
			change: !!oldPrice
				? newPrice.gt(oldPrice)
					? 'up'
					: oldPrice.gt(newPrice)
					? 'down'
					: oldChange ?? null
				: null,
		};
	}
	return pricesInfo;
};
