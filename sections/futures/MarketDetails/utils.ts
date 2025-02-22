export enum MarketDataKey {
	indexPrice = 'Index Price',
	marketPrice = 'Market Price',
	dailyChange = '24H Change',
	dailyVolume = '24H Volume',
	dailyTrades = '24H Trades',
	openInterestLong = 'Open Interest (L)',
	openInterestShort = 'Open Interest (S)',
	skew = 'Skew',
	instFundingRate = 'Inst. Funding Rate',
	hourlyFundingRate = '1H Funding Rate',
}

export const marketDataKeyMap: Record<MarketDataKey, string> = {
	[MarketDataKey.indexPrice]: 'index-price',
	[MarketDataKey.marketPrice]: 'market-price',
	[MarketDataKey.dailyChange]: '24h-change',
	[MarketDataKey.dailyVolume]: '24h-vol',
	[MarketDataKey.dailyTrades]: '24h-trades',
	[MarketDataKey.openInterestLong]: 'open-interest-l',
	[MarketDataKey.openInterestShort]: 'open-interest-s',
	[MarketDataKey.instFundingRate]: '1h-funding-rate',
	[MarketDataKey.hourlyFundingRate]: '1h-funding-rate',
	[MarketDataKey.skew]: 'skew',
};

export const isMarketDataKey = (key: string): key is MarketDataKey => {
	return Object.values<string>(MarketDataKey).includes(key);
};
